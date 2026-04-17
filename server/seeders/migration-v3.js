/**
 * CORRECTED COMPREHENSIVE DOTE MIGRATION
 * Works with the actual database schema
 */

const fs = require('fs');
const path = require('path');
const sequelize = require('../config/db');
const { District, College, Course, User, Student, Community, Caste, AcademicYear } = require('../models');
const bcrypt = require('bcryptjs');

// SQL Parser
function extractCollegeData(filePath) {
  if (!fs.existsSync(filePath)) {
    return { colleges: [], courses: [] };
  }

  const colleges = new Map();
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

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
  }

  const collegeArray = Array.from(colleges.values()).filter(c => c.branches.length > 0);
  return collegeArray;
}

// MAIN MIGRATION
async function migrate() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║    🚀 COMPREHENSIVE DOTE MIGRATION - v3              ║');
    console.log('║      Loading ALL Colleges from Official SQL Files     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // Parse SQL files
    console.log('📂 Parsing SQL Files:');
    const govtColleges = extractCollegeData(path.join(__dirname, '../../govt.sql'));
    const affiliatedColleges = extractCollegeData(path.join(__dirname, '../../sheet1.sql'));
   
    console.log(`  ✓ govt.sql: ${govtColleges.length} colleges`);
    console.log(`  ✓ sheet1.sql: ${affiliatedColleges.length} colleges\n`);

    const allColleges = [...govtColleges, ...affiliatedColleges];
    console.log(`📊 Total Colleges to Load: ${allColleges.length}\n`);

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

    // STEP 2: Colleges & Courses
    console.log('🏫 Seeding colleges and courses...');
    let collegeCount = 0;
    let courseCount = 0;
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

      const collegeType = parseInt(collegeData.code) >= 300 ? 'SELF_FINANCE' : 'GOVERNMENT';

      const [college] = await College.findOrCreate({
        where: { college_code: collegeData.code },
        defaults: {
          college_code: collegeData.code,
          college_name: collegeData.name,
          district_id: districtId,
          college_type: collegeType,
          gender_type: 'CO-ED',
          hostel_available: 1,
          address: `${collegeData.taluk || ''}, ${collegeData.district || ''}`,
          phone: '044-XXXXXX',
          email: `admin.${collegeData.code}@polytechnic.tn.edu.in`,
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Add courses for this college
      for (const branch of collegeData.branches) {
        if (!branch.code) continue;

        await Course.findOrCreate({
          where: { college_id: college.college_id, course_code: branch.code },
          defaults: {
            college_id: college.college_id,
            course_code: branch.code,
            course_name: branch.name || `Branch ${branch.code}`,
            intake_seats: branch.intake || 60,
            duration_years: 3,
            is_active: 1,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        courseCount++;
      }

      collegeCount++;
      if (collegeCount % 50 === 0) process.stdout.write('.');
    }
    console.log(`\n  ✓ Seeded ${collegeCount} colleges with ${courseCount} courses (${skipCount} skipped)\n`);

    // STEP 3: Communities & Castes
    console.log('👥 Seeding communities and castes...');
    const COMMUNITIES = ['OC', 'BC', 'MBC', 'SC', 'ST'];
    const communityMap = {};
    for (const comm of COMMUNITIES) {
      const [c] = await Community.findOrCreate({
        where: { community_code: comm },
        defaults: { community_code: comm, community_name: comm, created_at: new Date(), updated_at: new Date() }
      });
      communityMap[comm] = c.community_id;
    }

    // Castes
    const CASTES_BY_COMMUNITY = {
      'OC': ['OC1', 'OC2'], 'BC': ['BC1', 'BC2'], 'MBC': ['MBC1', 'MBC2'],
      'SC': ['SC1', 'SC2'], 'ST': ['ST1', 'ST2']
    };

    let casteCount = 0;
    for (const [comm, castes] of Object.entries(CASTES_BY_COMMUNITY)) {
      for (const caste of castes) {
        await Caste.findOrCreate({
          where: { caste_name: caste, community_id: communityMap[comm] },
          defaults: { caste_name: caste, community_id: communityMap[comm], created_at: new Date(), updated_at: new Date() }
        });
        casteCount++;
      }
    }
    console.log(`  ✓ Seeded ${COMMUNITIES.length} communities and ${casteCount} castes\n`);

    // STEP 4: Academic Years
    console.log('📅 Seeding academic years...');
    const years = ['2023-24', '2024-25', '2025-26'];
    for (const year of years) {
      await AcademicYear.findOrCreate({
        where: { year_label: year },
        defaults: { year_label: year, is_active: year === '2025-26' ? 1 : 0, created_at: new Date(), updated_at: new Date() }
      });
    }
    console.log(`  ✓ Seeded ${years.length} academic years\n`);

    // STEP 5: Sample Users & Students
    console.log('👥 Creating system users...');
    const adminHash = await bcrypt.hash('admin@123', 10);
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@dote.tn.gov.in' },
      defaults: {
        name: 'DOTE Administrator',
        email: 'admin@dote.tn.gov.in',
        password: adminHash,
        role: 'SUPER_ADMIN',
        is_active: 1
      }
    });

    // Top 10 colleges get staff
    const topColleges = await College.findAll({ limit: 10, order: [['college_id', 'ASC']] });
    const staffHash = await bcrypt.hash('staff@123', 10);
    for (const college of topColleges) {
      await User.findOrCreate({
        where: { email: `staff${college.college_code}@dote.tn.edu.in` },
        defaults: {
          name: `Staff - ${college.college_code}`,
          email: `staff${college.college_code}@dote.tn.edu.in`,
          password: staffHash,
          role: 'COLLEGE_STAFF',
          college_id: college.college_id,
          is_active: 1
        }
      });
    }

    // 10 test students
    const studentHash = await bcrypt.hash('student@123', 10);
    for (let i = 0; i < 10; i++) {
      const [student] = await Student.findOrCreate({
        where: { mobile: `98765432${i}01` },
        defaults: {
          mobile: `98765432${i}01`,
          name: `Test Student ${i + 1}`,
          email: `student${i}@dote.tn.edu.in`,
          password: studentHash,
          gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
          community_id: communityMap['OC'],
          dob: '2000-01-05',
          comm_address: `Address ${i}`,
          comm_pincode: '600001',
          comm_district_id: allDistricts[0].district_id
        }
      });
    }

    console.log(`  ✓ Created 1 Admin + ${topColleges.length} Staff + 10 Students\n`);

    // FINAL STATS
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✨ MIGRATION COMPLETE!                               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const stats = {
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
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`  ✓ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
    });

    console.log('\n🎓 DATA SOURCED FROM OFFICIAL SQL FILES:');
    console.log(`  ✓ govt.sql - Government Polytechnic Colleges`);
    console.log(`  ✓ sheet1.sql - Affiliated Polytechnic Colleges\n`);

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
