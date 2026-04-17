/**
 * FINAL COMPREHENSIVE DOTE MIGRATION
 * Loads ALL 365 colleges from SQL files with complete course mappings
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
  ApplicationCollege,
  FeeStructure
} = require('../models');
const bcrypt = require('bcryptjs');

// PARSER FUNCTION
function extractCollegeData(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ Skipping ${path.basename(filePath)} (not found)`);
    return { colleges: [], courses: [] };
  }

  const colleges = new Map();
  const courses = new Map();
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let processedCount = 0;

  for (const line of lines) {
    if (!line.includes('INSERT INTO')) continue;

    const valuesMatch = line.match(/VALUES\s*\(([^)]+)\)/);
    if (!valuesMatch) continue;

    const valuesStr = valuesMatch[1];
    const values = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];
      if (char === "'" && valuesStr[i-1] !== '\\') {
        inQuote = !inQuote;
        current += char;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current) values.push(current.trim());

    const cleaned = values.map(v => {
      let val = v.trim();
      if (val === 'NULL') return null;
      if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1);
      return val;
    });

    if (cleaned.length < 10) continue;

    const [f1, collegeCode, district, taluk, collegeName, branchCode, branchName, branchType, intake] = cleaned;

    if (!collegeCode || collegeCode === 'C Code' || collegeCode === 'Sl. No' || collegeCode.includes('Total')) continue;
    if (!branchCode || branchCode === 'Branch Code' || intake === '-' || !intake) continue;

    const key = collegeCode;
    if (!colleges.has(key)) {
      colleges.set(key, {
        code: collegeCode,
        name: collegeName,
        district: district || 'Unknown',
        taluk: taluk || '',
        branches: []
      });
    }

    const college = colleges.get(key);
    college.branches.push({
      code: branchCode,
      name: branchName || '',
      intake: parseInt(intake) || 60
    });

    if (branchCode && branchName && !courses.has(branchCode)) {
      courses.set(branchCode, branchName);
    }

    processedCount++;
  }

  const collegeArray = Array.from(colleges.values()).filter(c => c.branches.length > 0);
  const courseArray = Array.from(courses.entries()).map(([code, name]) => ({ code, name }));

  console.log(`  ✓ ${path.basename(filePath)}: ${collegeArray.length} colleges, ${courseArray.length} courses (${processedCount} records processed)`);

  return { colleges: collegeArray, courses: courseArray };
}

// MAIN MIGRATION
async function migrate() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     🚀 FINAL COMPREHENSIVE DOTE MIGRATION            ║');
    console.log('║        Loading ALL 365+ Colleges from SQL Files       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Database connection
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Parse all SQL files
    console.log('📂 Parsing SQL Files:');
    const govtData = extractCollegeData(path.join(__dirname, '../../govt.sql'));
    const affiliatedData = extractCollegeData(path.join(__dirname, '../../sheet1.sql'));
    const aidedData = extractCollegeData(path.join(__dirname, '../../aided.sql'));

    // Merge data
    const allColleges = [...govtData.colleges, ...affiliatedData.colleges, ...aidedData.colleges];
    
    const courseMap = new Map();
    [govtData.courses, affiliatedData.courses, aidedData.courses].forEach(arr => {
      arr.forEach(c => {
        if (!courseMap.has(c.code)) {
          courseMap.set(c.code, c);
        }
      });
    });
    const uniqueCourses = Array.from(courseMap.values());

    console.log(`\n📊 Total Data to Load:`);
    console.log(`  • Colleges: ${allColleges.length}`);
    console.log(`  • Unique Courses: ${uniqueCourses.length}\n`);

    // TN Districts
    const TN_DISTRICTS = [
      'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
      'Erode', 'Kancheepuram', 'Kallakurichi', 'Kanyakumari', 'Karur', 'Krishnagiri',
      'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
      'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
      'The Nilgiris', 'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvannamalai', 'Thiruvarur',
      'Thoothukudi', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Trichirappalli', 'Tuticorin',
      'Vellore', 'Viluppuram'
    ];

    // STEP 1: Districts
    console.log('📍 Seeding districts...');
    for (const districtName of TN_DISTRICTS) {
      await District.findOrCreate({
        where: { district_name: districtName },
        defaults: { district_name: districtName, state: 'Tamil Nadu', created_at: new Date(), updated_at: new Date() }
      });
    }
    console.log(`  ✓ Seeded ${TN_DISTRICTS.length} districts\n`);

    // Get district map
    const districtMap = {};
    const allDistricts = await District.findAll();
    allDistricts.forEach(d => {
      districtMap[d.district_name.toLowerCase()] = d.district_id;
    });

    // STEP 2: Courses
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
    console.log(`  ✓ Seeded ${uniqueCourses.length} courses\n`);

    // STEP 3: Colleges (THE BIG ONE - 365 colleges!)
    console.log('🏫 Seeding 365+ colleges...');
    let successCount = 0;
    let skipCount = 0;

    for (const collegeData of allColleges) {
      if (!collegeData.code || !collegeData.name) {
        skipCount++;
        continue;
      }

      const districtId = districtMap[collegeData.district?.toLowerCase()];
      if (!districtId) {
        skipCount++;
        continue;
      }

      const collegeType = parseInt(collegeData.code) >= 300 ? 'Affiliated' : 'Government';

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
          email: `info.${collegeData.code}@polytechnic.tn.edu.in`,
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Add courses for this college
      for (const branch of collegeData.branches) {
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

      successCount++;
      if (successCount % 50 === 0) {
        process.stdout.write('.');
      }
    }
    console.log(`\n  ✓ Seeded ${successCount} colleges (${skipCount} skipped)\n`);

    // STEP 4: Communities & Castes
    console.log('👥 Seeding communities and castes...');
    const COMMUNITIES = ['OC', 'BC', 'MBC', 'SC', 'ST', 'BCM'];
    const communityMap = {};
    for (const comm of COMMUNITIES) {
      const [c] = await Community.findOrCreate({
        where: { community_code: comm },
        defaults: { community_code: comm, created_at: new Date(), updated_at: new Date() }
      });
      communityMap[comm] = c.community_id;
    }

    const CASTES_BY_COMMUNITY = {
      'OC': ['OC1', 'OC2'], 'BC': ['BC1', 'BC2'], 'MBC': ['MBC1', 'MBC2'],
      'SC': ['SC1', 'SC2'], 'ST': ['ST1', 'ST2'], 'BCM': ['BCM1', 'BCM2']
    };

    let casteCount = 0;
    for (const [comm, castes] of Object.entries(CASTES_BY_COMMUNITY)) {
      for (const caste of castes) {
        await Caste.findOrCreate({
          where: { caste_name: caste, community_id: communityMap[comm] },
          defaults: {
            caste_name: caste,
            community_id: communityMap[comm],
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
    const years = ['2023-24', '2024-25', '2025-26'];
    for (const year of years) {
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
    console.log(`  ✓ Seeded ${years.length} academic years\n`);

    // STEP 6: Fee Structure
    console.log('💰 Setting up fee structure...');
    await FeeStructure.findOrCreate({
      where: { fee_structure_id: 1 },
      defaults: {
        category: 'General',
        annual_fee: 15000,
        application_fee: 500,
        exam_fee: 1000,
        hostel_fee: 25000,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log(`  ✓ Fee structure configured\n`);

    // STEP 7: System Users
    console.log('👥 Creating system users...');
    
    // Admin
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await User.findOrCreate({
      where: { email: 'admin@dote.tn.gov.in' },
      defaults: {
        email: 'admin@dote.tn.gov.in',
        password_hash: adminHash,
        full_name: 'DOTE System Administrator',
        phone: '9876543200',
        user_type: 'ADMIN',
        is_verified: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // College staff for top 20 colleges
    const topColleges = await College.findAll({ limit: 20, order: [['college_id', 'ASC']] });
    const staffHash = await bcrypt.hash('Staff@123', 10);
    for (const college of topColleges) {
      await User.findOrCreate({
        where: { email: `staff${college.college_code}@dote.tn.gov.in` },
        defaults: {
          email: `staff${college.college_code}@dote.tn.gov.in`,
          password_hash: staffHash,
          full_name: `College Staff - ${college.college_code}`,
          phone: `987650${college.college_id}`.substring(0, 10),
          user_type: 'COLLEGE_STAFF',
          college_id: college.college_id,
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Test students
    const studentHash = await bcrypt.hash('Student@123', 10);
    for (let i = 0; i < 15; i++) {
      const [user] = await User.findOrCreate({
        where: { phone: `98765432${i}01` },
        defaults: {
          email: `student${i}@dote-students.tn.gov.in`,
          password_hash: studentHash,
          full_name: `Test Student ${i + 1}`,
          phone: `98765432${i}01`,
          user_type: 'STUDENT',
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      await Student.findOrCreate({
        where: { user_id: user.user_id },
        defaults: {
          user_id: user.user_id,
          register_number: `REG202425${i.toString().padStart(3, '0')}`,
          date_of_birth: '2000-01-05',
          gender: i % 3 === 0 ? 'F' : 'M',
          community_id: communityMap['OC'],
          mother_tongue: 'Tamil',
          address: `Address ${i}`,
          pincode: '600001',
          district_id: allDistricts[0].district_id,
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    console.log(`  ✓ Created 1 Admin + 20 Staff + 15 Students\n`);

    // FINAL STATS
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✨ MIGRATION COMPLETE!                               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const finalStats = {
      districts: await District.count(),
      colleges: await College.count(),
      courses: await Course.count(),
      communities: await Community.count(),
      castes: await Caste.count(),
      academicYears: await AcademicYear.count(),
      users: await User.count(),
      students: await Student.count()
    };

    console.log('📊 FINAL DATABASE STATISTICS:');
    console.log(`  ✓ Districts: ${finalStats.districts}`);
    console.log(`  ✓ Colleges: ${finalStats.colleges}`);
    console.log(`  ✓ Courses: ${finalStats.courses}`);
    console.log(`  ✓ Communities: ${finalStats.communities}`);
    console.log(`  ✓ Castes: ${finalStats.castes}`);
    console.log(`  ✓ Academic Years: ${finalStats.academicYears}`);
    console.log(`  ✓ System Users: ${finalStats.users}`);
    console.log(`  ✓ Student Profiles: ${finalStats.students}\n`);

    console.log('🎓 DATA SOURCED FROM OFFICIAL SQL FILES:');
    console.log(`  ✓ govt.sql (Government Colleges)`);
    console.log(`  ✓ sheet1.sql (Affiliated Colleges)`);
    console.log(`  ✓ aided.sql (Aided Colleges)\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ DOTE DATABASE READY FOR APPLICATION!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

migrate();
