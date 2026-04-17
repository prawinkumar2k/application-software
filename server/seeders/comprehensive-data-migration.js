/**
 * COMPREHENSIVE DOTE DATA PARSER & LOADER
 * Extracts all college, course, and intake data from SQL files
 */

const fs = require('fs');
const path = require('path');

const sequelize = require('../config/db');
const {
  District,
  College,
  Course,
  User,
  Student,
  Community,
  Caste,
  AcademicYear,
  ApplicationCollege
} = require('../models');
const bcrypt = require('bcryptjs');

// Parse INSERT statements into college-course-intake data
function parseCollegeData(sqlFilePath) {
  if (!fs.existsSync(sqlFilePath)) {
    console.warn(`⚠ File not found: ${sqlFilePath}`);
    return [];
  }

  const content = fs.readFileSync(sqlFilePath, 'utf-8');
  const lines = content.split('\n');
  const collegeMap = {}; // college_code -> college_data
  const courseList = []; // all unique courses

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes('INSERT INTO')) continue;

    // Parse VALUES clause
    const match = line.match(/VALUES\s*\((.*?)\)\s*;/s);
    if (!match) continue;

    const values = match[1]
      .split("','")
      .map((v, idx) => {
        let val = v.trim();
        if (idx === 0) val = val.replace(/^'/, ''); // Remove leading quote
        if (idx === match[1].split("','").length - 1) val = val.replace(/'$/, ''); // Remove trailing quote
        return val === 'NULL' ? null : val;
      });

    if (values.length < 9) continue;

    const collegeCode = values[1]; // f2
    const collegeDistrict = values[2]; // f3
    const collegeTaluk = values[3]; // f4
    const collegeName = values[4]; // f5
    const branchCode = values[5]; // f6
    const branchName = values[7]; // (skipping f7 for now, using f8)
    const branchType = values[7]; // f8
    const intake = values[8]; // f9

    // Skip header and total rows
    if (
      !collegeCode ||
      collegeCode === 'C Code' ||
      collegeCode.includes('Total') ||
      !branchCode ||
      branchCode === 'Branch Code'
    ) {
      continue;
    }

    // Skip rows with dash or invalid intake
    if (intake === '-' || intake === null || !branchCode) continue;

    // Extract branch name from column 6 (branchName)
    const actualBranchName = values[6] || values[7] || branchName;

    // Build college key
    const collegeBranchKey = `${collegeCode}-${branchCode}`;

    // Initialize college entry if not exists
    if (!collegeMap[collegeCode]) {
      collegeMap[collegeCode] = {
        code: collegeCode,
        name: collegeName,
        district: collegeDistrict,
        taluk: collegeTaluk,
        branches: []
      };
    }

    // Add branch to college
    collegeMap[collegeCode].branches.push({
      code: branchCode,
      name: actualBranchName || branchName,
      type: branchType,
      intake: parseInt(intake) || 60
    });

    // Track unique courses
    if (branchCode && actualBranchName) {
      courseList.push({
        code: branchCode,
        name: actualBranchName
      });
    }
  }

  // Convert map to array and remove duplicates
  const colleges = Object.values(collegeMap);

  // Deduplicate courses
  const uniqueCourses = [];
  const courseSet = new Set();
  for (const course of courseList) {
    const key = `${course.code}`;
    if (!courseSet.has(key)) {
      courseSet.add(key);
      uniqueCourses.push(course);
    }
  }

  console.log(`  ✓ Parsed ${colleges.length} colleges with ${uniqueCourses.length} unique courses from ${path.basename(sqlFilePath)}`);

  return { colleges, courses: uniqueCourses };
}

// Main migration
const migrate = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  🚀 COMPREHENSIVE DOTE DATA MIGRATION v2              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Parse all SQL files
    console.log('📂 Parsing SQL Files:');
    const govtData = parseCollegeData(path.join(__dirname, '../../govt.sql'));
    const affiliatedData = parseCollegeData(path.join(__dirname, '../../sheet1.sql'));
    const aidedData = parseCollegeData(path.join(__dirname, '../../aided.sql'));

    // Merge all colleges and courses
    const allColleges = [
      ...govtData.colleges,
      ...affiliatedData.colleges,
      ...aidedData.colleges
    ];
    const allCourses = [
      ...govtData.courses,
      ...affiliatedData.courses,
      ...aidedData.courses
    ];

    // Deduplicate courses by code
    const courseMap = new Map();
    for (const course of allCourses) {
      if (!courseMap.has(course.code)) {
        courseMap.set(course.code, course);
      }
    }
    const uniqueCourses = Array.from(courseMap.values());

    console.log(`\n📊 Total Data Extracted:`);
    console.log(`  • Colleges: ${allColleges.length}`);
    console.log(`  • Unique Course Codes: ${uniqueCourses.length}\n`);

    // Tamil Nadu Districts
    const TN_DISTRICTS = [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
      'Erode', 'Kancheepuram', 'Kallakurichi', 'Kanyakumari', 'Karur', 'Krishnagiri',
      'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
      'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
      'The Nilgiris', 'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvannamalai', 'Thiruvarur',
      'Thoothukudi', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Trichirappalli', 'Tuticorin',
      'Vellore', 'Viluppuram'
    ];

    // STEP 1: Seed Districts
    console.log('📍 Seeding districts...');
    for (const districtName of TN_DISTRICTS) {
      await District.findOrCreate({
        where: { district_name: districtName },
        defaults: { district_name: districtName, created_at: new Date(), updated_at: new Date() }
      });
    }
    console.log(`  ✓ Seeded ${TN_DISTRICTS.length} districts\n`);

    // Get district map
    const districtMap = {};
    const allDistricts = await District.findAll();
    allDistricts.forEach(d => {
      districtMap[d.district_name.toLowerCase()] = d.district_id;
    });

    // STEP 2: Seed Courses
    console.log('📚 Seeding courses...');
    for (const course of uniqueCourses) {
      if (course.code && course.name) {
        await Course.findOrCreate({
          where: { branch_code: course.code },
          defaults: {
            branch_code: course.code,
            branch_name: course.name,
            intake_capacity: 60,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }
    }
    console.log(`  ✓ Seeded ${uniqueCourses.length} course codes\n`);

    // STEP 3: Seed Colleges
    console.log('🏫 Seeding colleges...');
    let collegeCount = 0;
    for (const collegeData of allColleges) {
      if (!collegeData.code || !collegeData.name) continue;

      const districtId = districtMap[collegeData.district?.toLowerCase()];
      if (!districtId) {
        console.warn(`  ⚠ Unknown district for college ${collegeData.code}: ${collegeData.district}`);
        continue;
      }

      const collegeType = collegeData.code >= 300 ? 'Affiliated' : 'Government';

      const [college] = await College.findOrCreate({
        where: { college_code: collegeData.code },
        defaults: {
          college_code: collegeData.code,
          college_name: collegeData.name,
          district_id: districtId,
          college_type: collegeType,
          gender_type: 'Co-Ed',
          hostel_available: 1,
          address: `${collegeData.taluk || ''}, ${collegeData.district || ''}`,
          phone: '044-XXXXXX',
          email: `admin.${collegeData.code}@polytechnic.tn.edu.in`,
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Add courses to college via ApplicationCollege
      for (const branch of (collegeData.branches || [])) {
        if (!branch.code) continue;

        const course = await Course.findOne({ where: { branch_code: branch.code } });
        if (course) {
          await ApplicationCollege.findOrCreate({
            where: {
              college_id: college.college_id,
              course_id: course.course_id
            },
            defaults: {
              college_id: college.college_id,
              course_id: course.course_id,
              seats_available: branch.intake || 60,
              seats_reserved_sc: Math.floor((branch.intake || 60) * 0.15),
              seats_reserved_st: Math.floor((branch.intake || 60) * 0.01),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      }

      collegeCount++;
    }
    console.log(`  ✓ Seeded ${collegeCount} colleges\n`);

    // STEP 4: Create Communities & Castes
    console.log('👥 Seeding communities and castes...');
    const COMMUNITIES = ['OC', 'BC', 'MBC', 'SC', 'ST', 'BCM'];
    const communityMap = {};

    for (const communityCode of COMMUNITIES) {
      const [community] = await Community.findOrCreate({
        where: { community_code: communityCode },
        defaults: { community_code: communityCode, created_at: new Date(), updated_at: new Date() }
      });
      communityMap[communityCode] = community.community_id;
    }

    const CASTES_BY_COMMUNITY = {
      'OC': ['OC1', 'OC2', 'OC3', 'OC4'],
      'BC': ['BC1', 'BC2', 'BC3', 'BC4'],
      'MBC': ['MBC1', 'MBC2', 'MBC3', 'MBC4'],
      'SC': ['SC1', 'SC2', 'SC3', 'SC4'],
      'ST': ['ST1', 'ST2', 'ST3', 'ST4'],
      'BCM': ['BCM1', 'BCM2', 'BCM3', 'BCM4']
    };

    let casteCount = 0;
    for (const [community, castes] of Object.entries(CASTES_BY_COMMUNITY)) {
      for (const casteName of castes) {
        await Caste.findOrCreate({
          where: { caste_name: casteName, community_id: communityMap[community] },
          defaults: {
            caste_name: casteName,
            community_id: communityMap[community],
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        casteCount++;
      }
    }
    console.log(`  ✓ Seeded ${COMMUNITIES.length} communities and ${casteCount} castes\n`);

    // STEP 5: Academic Years
    console.log('📅 Seeding academic years...');
    const academicYears = ['2023-24', '2024-25', '2025-26'];
    for (const year of academicYears) {
      await AcademicYear.findOrCreate({
        where: { year_label: year },
        defaults: {
          year_label: year,
          is_active: year === '2025-26' ? 1 : 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log(`  ✓ Seeded ${academicYears.length} academic years\n`);

    // STEP 6: Admin User
    console.log('👨‍💼 Creating system users...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await User.findOrCreate({
      where: { email: 'admin@dote.tn.gov.in' },
      defaults: {
        email: 'admin@dote.tn.gov.in',
        password_hash: adminHash,
        full_name: 'DOTE Administrator',
        phone: '9876543200',
        user_type: 'ADMIN',
        is_verified: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Create college staff for top 10 colleges
    const topColleges = await College.findAll({ limit: 10 });
    const staffHash = await bcrypt.hash('Staff@123', 10);
    for (let i = 0; i < topColleges.length; i++) {
      const college = topColleges[i];
      await User.findOrCreate({
        where: { email: `staff.${college.college_code}@dote.tn.gov.in` },
        defaults: {
          email: `staff.${college.college_code}@dote.tn.gov.in`,
          password_hash: staffHash,
          full_name: `Staff - ${college.college_name}`,
          phone: `987654${3200 + i}`,
          user_type: 'COLLEGE_STAFF',
          college_id: college.college_id,
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Create test students
    const studentHash = await bcrypt.hash('Student@123', 10);
    for (let i = 0; i < 10; i++) {
      const phone = `987654321${i}`;
      const [user] = await User.findOrCreate({
        where: { phone: phone },
        defaults: {
          email: `student${i}@students.tn.gov.in`,
          password_hash: studentHash,
          full_name: `Test Student ${i + 1}`,
          phone: phone,
          user_type: 'STUDENT',
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Create student profile
      await Student.findOrCreate({
        where: { user_id: user.user_id },
        defaults: {
          user_id: user.user_id,
          register_number: `REG${Date.now()}${i}`,
          date_of_birth: '2000-01-01',
          gender: i % 2 === 0 ? 'M' : 'F',
          community_id: communityMap['OC'],
          mother_tongue: 'Tamil',
          address: `Address ${i}`,
          pincode: '600001',
          district_id: Object.values(districtMap)[0],
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log(`  ✓ Created 1 Admin + ${topColleges.length} Staff + 10 Students\n`);

    // Final summary
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✨ MIGRATION COMPLETE!                               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📊 FINAL DATABASE STATS:');
    const distCount = await District.count();
    const collegeCountFinal = await College.count();
    const courseCountFinal = await Course.count();
    const userCount = await User.count();

    console.log(`  ✓ Districts: ${distCount}`);
    console.log(`  ✓ Colleges: ${collegeCountFinal}`);
    console.log(`  ✓ Courses: ${courseCountFinal}`);
    console.log(`  ✓ Communities: ${COMMUNITIES.length}`);
    console.log(`  ✓ Castes: ${casteCount}`);
    console.log(`  ✓ Academic Years: ${academicYears.length}`);
    console.log(`  ✓ Users: ${userCount}\n`);

    console.log('🎯 ALL DOTE DATA SUCCESSFULLY LOADED!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

migrate();
