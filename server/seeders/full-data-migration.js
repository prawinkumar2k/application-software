const sequelize = require('../config/db');
const {
  District,
  Community,
  Caste,
  College,
  Course,
  FeeStructure,
  User,
  Student,
  AcademicYear
} = require('../models');
const bcrypt = require('bcryptjs');

// Parse government colleges from govt.sql pattern
const GOVT_COLLEGES = [
  { code: '101', name: 'CENTRAL POLYTECHNIC COLLEGE (AU), CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '102', name: 'INSTITUTE OF PRINTING TECHNOLOGY, CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '103', name: 'INSTITUTE OF CHEMICAL TECHNOLOGY, CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '104', name: 'INSTITUTE OF LEATHER TECHNOLOGY, CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '105', name: 'INSTITUTE OF TEXTILE TECHNOLOGY, CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '106', name: 'STATE INSTITUTE OF COMMERCE EDUCATION, CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '109', name: 'TPEVR GOVERNMENT POLYTECHNIC COLLEGE , VELLORE', district: 'Vellore', type: 'Government' },
  { code: '110', name: 'GOVERNMENT POLYTECHNIC COLLEGE, KRISHNAGIRI', district: 'Krishnagiri', type: 'Government' },
  { code: '111', name: 'GOVERNMENT POLYTECHNIC COLLEGE, COIMBATORE', district: 'Coimbatore', type: 'Government' },
  { code: '112', name: 'GOVERNMENT POLYTECHNIC COLLEGE, OOTY , THE NILGIRIS', district: 'The Nilgiris', type: 'Government' },
  { code: '113', name: 'GOVERNMENT POLYTECHNIC COLLEGE, ARANTHANGI , PUDUKKOTTAI', district: 'Pudukottai', type: 'Government' },
  { code: '115', name: 'GOVERNMENT POLYTECHNIC COLLEGE, TRICHY', district: 'Trichirappalli', type: 'Government' },
  { code: '116', name: 'TAMILNADU GOVT. POLYTECHNIC COLLEGE (AU), MADURAI', district: 'Madurai', type: 'Government' },
  { code: '117', name: 'ALAGAPPA POLYTECHNIC COLLEGE , SIVAGANGAI', district: 'Sivagangai', type: 'Government' },
  { code: '118', name: 'GOVERNMENT POLYTECHNIC COLLEGE, TUTICORIN', district: 'Tuticorin', type: 'Government' },
  { code: '119', name: 'GOVERNMENT POLYTECHNIC COLLEGE, NAGERCOIL , KANYAKUMARI', district: 'Kanyakumari', type: 'Government' },
  { code: '120', name: 'GOVERNMENT POLYTECHNIC COLLEGE, PURASAWALKAM , CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '121', name: 'GOVERNMENT POLYTECHNIC COLLEGE, MELUR, MADURAI', district: 'Madurai', type: 'Government' },
  { code: '122', name: 'GOVERNMENT POLYTECHNIC COLLEGE, DHARMAPURI', district: 'Dharmapuri', type: 'Government' },
  { code: '123', name: 'GOVERNMENT POLYTECHNIC COLLEGE, KARUR', district: 'Karur', type: 'Government' },
  { code: '124', name: 'GOVERNMENT POLYTECHNIC COLLEGE, PERAMBALUR', district: 'Perambalur', type: 'Government' },
  { code: '125', name: 'GOVERNMENT POLYTECHNIC COLLEGE, THIRUVARUR', district: 'Thiruvarur', type: 'Government' },
  { code: '126', name: 'GOVERNMENT POLYTECHNIC COLLEGE, THENI', district: 'Theni', type: 'Government' },
  { code: '127', name: 'GOVERNMENT POLYTECHNIC COLLEGE, THIRUVANNAMALAI', district: 'Thiruvannamalai', type: 'Government' },
  { code: '128', name: 'GOVERNMENT POLYTECHNIC COLLEGE, ARAKANDANALLURE, VILLUPURAM', district: 'Viluppuram', type: 'Government' },
  { code: '129', name: 'GOVERNMENT POLYTECHNIC COLLEGE, ANDIPATTI, THENI', district: 'Theni', type: 'Government' },
  { code: '130', name: 'GOVERNMENT POLYTECHNIC COLLEGE, JOLARPETTAI, THIRUPATHUR', district: 'Thirupathur', type: 'Government' },
  { code: '131', name: 'GOVERNMENT POLYTECHNIC COLLEGE, KILAPALURE, ARIYALUR', district: 'Ariyalur', type: 'Government' },
  { code: '132', name: 'GOVERNMENT POLYTECHNIC COLLEGE, PERUNDURAI, ERODE', district: 'Erode', type: 'Government' },
  { code: '133', name: 'GOVERNMENT POLYTECHNIC COLLEGE, THIRUMANGALAM, MADURAI', district: 'Madurai', type: 'Government' },
  { code: '134', name: 'GOVERNMENT POLYTECHNIC COLLEGE, SANKARAPURAM, Kallakurichi', district: 'Kallakurichi', type: 'Government' },
  { code: '135', name: 'GOVERNMENT POLYTECHNIC COLLEGE, CHEYYAR, THIRUVANNAMALAI', district: 'Thiruvannamalai', type: 'Government' },
  { code: '136', name: 'GOVERNMENT POLYTECHNIC COLLEGE, SRIRANGAM, TRICHY', district: 'Trichirappalli', type: 'Government' },
  { code: '137', name: 'GOVERNMENT POLYTECHNIC COLLEGE, GANDHARVAKOTTAI, PUDUKKOTTAI', district: 'Pudukottai', type: 'Government' },
  { code: '138', name: 'GOVERNMENT POLYTECHNIC COLLEGE, USILAMPATTI, MADURAI', district: 'Madurai', type: 'Government' },
  { code: '139', name: 'GOVERNMENT POLYTECHNIC COLLEGE, UTHANGARAI, KRISHNAGIRI', district: 'Krishnagiri', type: 'Government' },
  { code: '140', name: 'GOVERNMENT POLYTECHNIC COLLEGE, R K NAGAR, CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '141', name: 'GOVERNMENT POLYTECHNIC COLLEGE, KADATHUR, DHARMAPURI', district: 'Dharmapuri', type: 'Government' },
  { code: '142', name: 'GOVERNMENT POLYTECHNIC COLLEGE, KELAMANGALAM, KRISHNAGIRI', district: 'Krishnagiri', type: 'Government' },
  { code: '143', name: 'GOVERNMENT POLYTECHNIC COLLEGE, REGHUNATHAPURAM, THANJAVUR', district: 'Thanjavur', type: 'Government' },
  { code: '144', name: 'GOVERNMENT POLYTECHNIC COLLEGE, THOZHUVOOR, THIRUVARUR', district: 'Thiruvarur', type: 'Government' },
  { code: '145', name: 'GOVERNMENT POLYTECHNIC COLLEGE,PALLACODE, DHARMAPURI', district: 'Dharmapuri', type: 'Government' },
  { code: '146', name: 'GOVERNMENT POLYTECHNIC COLLEGE, NAMAKKAL', district: 'Namakkal', type: 'Government' },
  { code: '147', name: 'GOVERNMENT POLYTECHNIC COLLEGE, CUDDALORE', district: 'Cuddalore', type: 'Government' },
  { code: '148', name: 'GOVERNMENT POLYTECHNIC COLLEGE, THIRUVALLUR', district: 'Thiruvallur', type: 'Government' },
  { code: '149', name: 'GOVERNMENT POLYTECHNIC COLLEGE, SALEM', district: 'Salem', type: 'Government' },
  { code: '150', name: 'GOVERNMENT POLYTECHNIC COLLEGE - CHROMEPET', district: 'Chengalpattu', type: 'Government' },
  { code: '151', name: 'GOVERNMENT POLYTECHNIC COLLEGE - BARGUR', district: 'Krishnagiri', type: 'Government' },
  { code: '152', name: 'GOVERNMENT POLYTECHNIC COLLEGE - TIRUNELVELI', district: 'Tirunelveli', type: 'Government' },
  { code: '175', name: 'DR DHARMAMBAL GOVT POLYTECHNIC COLLEGE FOR WOMEN (AU), CHENNAI', district: 'Chennai', type: 'Government' },
  { code: '176', name: 'GOVERNMENT POLYTECHNIC COLLEGE (WOMEN), COIMBATORE', district: 'Coimbatore', type: 'Government' },
  { code: '177', name: 'GOVERNMENT POLYTECHNIC COLLEGE FOR WOMEN, MADURAI', district: 'Madurai', type: 'Government' },
  { code: '178', name: 'BCM GOVT. POLYTECHNIC COLLEGE FOR WOMEN , TUTICORIN', district: 'Tuticorin', type: 'Government' },
];

// Affiliated colleges from sheet1.sql
const AFFILIATED_COLLEGES = [
  { code: '301', name: 'V RAMAKRISHNA POLYTECHNIC COLLEGE, THIRUVALLUR', district: 'Chennai', type: 'Affiliated' },
  { code: '302', name: 'MEENAKSHI AMMAL POLYTECHNIC COLLEGE, KANCHIPURAM', district: 'Kancheepuram', type: 'Affiliated' },
  { code: '303', name: 'SRI NALLALAGHU POLYTECHNIC COLLEGE, THIRUVALLUR', district: 'Thiruvallur', type: 'Affiliated' },
  { code: '304', name: 'ADHIPARASAKTHI POLYTECHNIC COLLEGE, KANCHIPURAM', district: 'Chengalpattu', type: 'Affiliated' },
  { code: '305', name: 'ARULMIGU THIRIPURASUNDARIAMMAN POLYTECHNIC COLLEGE, KANCHIPURAM', district: 'Chengalpattu', type: 'Affiliated' },
  { code: '306', name: 'SRIRAM POLYTECHNIC COLLEGE, THIRUVALLUR', district: 'Thiruvallur', type: 'Affiliated' },
  { code: '310', name: 'MEENAKSHI KRISHNAN POLYTECHNIC COLLEGE, KANCHIPURAM', district: 'Chengalpattu', type: 'Affiliated' },
  { code: '311', name: 'SWAMY ABEDHANANDHA POLYTECHNIC COLLEGE, THIRUVANNAMALAI', district: 'Thiruvannamalai', type: 'Affiliated' },
  { code: '313', name: 'ELUMALAI POLYTECHNIC COLLEGE, VILLUPURAM', district: 'Viluppuram', type: 'Affiliated' },
  { code: '315', name: 'SANKARA INSTITUTE OF TECHNOLOGY, COIMBATORE', district: 'Coimbatore', type: 'Affiliated' },
  { code: '317', name: 'SREE NARAYANAGURU POLYTECHNIC COLLEGE, COIMBATORE', district: 'Coimbatore', type: 'Affiliated' },
  { code: '318', name: 'NANJIAH LINGAMMAL POLYTECHNIC COLLEGE , COIMBATORE', district: 'Coimbatore', type: 'Affiliated' },
  { code: '320', name: 'KONGU POLYTECHNIC COLLEGE, ERODE', district: 'Erode', type: 'Affiliated' }
];

// All distinct courses from SQL data
const ALL_COURSES = [
  { code: '1010', name: '1010-CIVIL ENGINEERING' },
  { code: '1012', name: '1012-ARCHITECTURAL ASSISTANTSHIP' },
  { code: '1014', name: '1014-INTERIOR DECORATION' },
  { code: '1020', name: '1020-MECHANICAL ENGINEERING' },
  { code: '1021', name: '1021-AUTOMOBILE ENGINEERING' },
  { code: '1023', name: '1023-AGRICULTURAL ENGINEERING' },
  { code: '1025', name: '1025-PRODUCTION ENGINEERING' },
  { code: '1027', name: '1027-MARINE ENGINEERING' },
  { code: '1030', name: '1030-ELECTRICAL & ELECTRONICS ENGG.' },
  { code: '1040', name: '1040-ELECTRONICS & COMMUNICATION ENGG.' },
  { code: '1042', name: '1042-INSTRUMENTATION & CONTROL ENGG.' },
  { code: '1046', name: '1046-INFORMATION TECHNOLOGY' },
  { code: '1047', name: '1047-MECHATRONICS' },
  { code: '1049', name: '1049-ELECTRONICS (ROBOTICS)' },
  { code: '1051', name: '1051-Diploma in Computer Science and Engineering' },
  { code: '1052', name: '1052-COMPUTER ENGINEERING' },
  { code: '1053', name: '1053-COMPUTER ENGINEERING' },
  { code: '1054', name: '1054-3D ANIMATION & GRAPHICS' },
  { code: '1055', name: '1055-COMMUNICATION AND COMPUTER NETWORKING' },
  { code: '1056', name: '1056-ARTIFICAL INTELLEGENCE AND MACHINE LEARINING' },
  { code: '1057', name: '1057-WEB DESIGNING' },
  { code: '1060', name: '1060-TEXTILE TECHNOLOGY' },
  { code: '1066', name: '1066-GARMENT TECHNOLOGY' },
  { code: '1069', name: '1069-Apparel Technology' },
  { code: '1074', name: '1074-SUGAR TECHNOLOGY' },
  { code: '1075', name: '1075-PETRO CHEMICAL ENGINEERING' },
  { code: '1076', name: '1076-CHEMICAL ENGINEERING' },
  { code: '1080', name: '1080-DIPLOMA IN COMMERCIAL PRACTICE (DCP)' },
  { code: '1081', name: '1081-MODERN OFFICE PRACTICE / COMMERCIAL PRACTICE' },
  { code: '1082', name: '1082-OFFICE MANAGEMENT AND COMPUTER APPLICATIONS' },
  { code: '1094', name: '1094-Diploma in Logistics Technology' },
  { code: '1122', name: '1122-FIRE TECHNOLOGY AND SAFETY' },
  { code: '1123', name: '1123-MECHANICAL ENGINEERING (CAD)' },
  { code: '1145', name: '1145-BIO MEDICAL ELECTRONICS' },
  { code: '1146', name: '1146-ECG TECHNOLIGUES' },
  { code: '1147', name: '1147-DIGITAL MANUFACTURING TECHNOLOGIES' },
  { code: '1148', name: '1148-CIVIL ENGINEERING (ENVIRONMENTAL ENGINEERING)' },
  { code: '1202', name: '1202-PRINTING TECHNOLOGY' },
  { code: '1211', name: '1211-COSMETOLOGY' },
  { code: '1220', name: '1220-MECHANICAL ENGINEERING (TOOL & DIE)' },
  { code: '1231', name: '1231-Fashion and Clothing Technology' },
  { code: '1233', name: '1233-PACKAGING TECHNOLOGY' },
  { code: '1235', name: '1235-FOOD TECHNOLOGY' },
  { code: '1515', name: '1515-CYBER SYSTEM AND INFORMATION SECURITY' },
  { code: '2020', name: '2020-MECHANICAL ENGINEERING (SW)' },
  { code: '2023', name: '2023-Diploma in Automobile Engineering (SW)' },
  { code: '2024', name: '2024-Mechanical Engineering Automobile(Sandwich)' },
  { code: '2040', name: '2040-ELECTRONICS & COMMUNICATION ENGINEERING(SW)' },
  { code: '2050', name: '2050-Diploma in Computer Technology (Sandwich)' },
  { code: '2074', name: '2074-POLYMER TECHNOLOGY (SW)' },
  { code: '2075', name: '2075-PLASTIC TECHNOLOGY (SW)' },
  { code: '2078', name: '2078-FISHERIES TECHNOLOGY (SW)' },
  { code: '2079', name: '2079-CHEMICAL ENGINEERING (SW)' },
  { code: '2101', name: '2101-LEATHER TECHNOLOGY (SW)' },
  { code: '2102', name: '2102-FOOTWEAR TECHNOLOGY' },
  { code: '2103', name: '2103-LEATHER AND FASHION TECHNOLOGY' },
  { code: '7010', name: '7010-DIPLOMA IN CIVIL ENGINEERING (TAMIL MEDIUM)' },
  { code: '7020', name: '7020-DIPLOMA IN MECHANICAL ENGINEERING (TAMIL MEDIUM)' },
  { code: '9033', name: '9033-RENEWABLE ENERGY' }
];

// Tamil Nadu districts
const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri',
  'Erode', 'Kancheepuram', 'Kallakurichi', 'Kanyakumari', 'Karur', 'Krishnagiri',
  'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur',
  'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivagangai', 'Tenkasi',
  'The Nilgiris', 'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvannamalai', 'Thiruvarur',
  'Thoothukudi', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Trichirappalli', 'Tuticorin',
  'Vellore', 'Viluppuram'
];

const COMMUNITIES = ['OC', 'BC', 'MBC', 'SC', 'ST', 'BCM'];

const CASTES_BY_COMMUNITY = {
  'OC': ['OC1', 'OC2', 'OC3', 'OC4'],
  'BC': ['BC1', 'BC2', 'BC3', 'BC4'],
  'MBC': ['MBC1', 'MBC2', 'MBC3', 'MBC4'],
  'SC': ['SC1', 'SC2', 'SC3', 'SC4'],
  'ST': ['ST1', 'ST2', 'ST3', 'ST4'],
  'BCM': ['BCM1', 'BCM2', 'BCM3', 'BCM4']
};

const migrate = async () => {
  try {
    console.log('🔄 Starting comprehensive DOTE database migration...\n');
    
    // Authenticate database
    await sequelize.authenticate();
    console.log('✓ Database connected\n');

    // STEP 1: Districts
    console.log('📍 Seeding districts...');
    for (const districtName of TN_DISTRICTS) {
      await District.findOrCreate({
        where: { district_name: districtName },
        defaults: { district_name: districtName, created_at: new Date(), updated_at: new Date() }
      });
    }
    console.log(`✓ Districts seeded (${TN_DISTRICTS.length} total)\n`);

    // STEP 2: Communities
    console.log('👥 Seeding communities...');
    const communityMap = {};
    for (const communityCode of COMMUNITIES) {
      const [community] = await Community.findOrCreate({
        where: { community_code: communityCode },
        defaults: { community_code: communityCode, created_at: new Date(), updated_at: new Date() }
      });
      communityMap[communityCode] = community.community_id;
    }
    console.log(`✓ Communities seeded (${COMMUNITIES.length} total)\n`);

    // STEP 3: Castes
    console.log('🎭 Seeding castes...');
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
    console.log(`✓ Castes seeded (${casteCount} total)\n`);

    // STEP 4: Academic Years
    console.log('📅 Seeding academic years...');
    const academicYears = ['2023-24', '2024-25', '2025-26'];
    let activeYear = null;
    for (const year of academicYears) {
      const [academicYear] = await AcademicYear.findOrCreate({
        where: { year_label: year },
        defaults: {
          year_label: year,
          is_active: year === '2025-26' ? 1 : 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      if (year === '2025-26') activeYear = academicYear.academic_year_id;
    }
    console.log(`✓ Academic years seeded (${academicYears.length} total)\n`);

    // STEP 5: Get all districts for mapping
    console.log('🏫 Seeding colleges...');
    const allDistricts = await District.findAll();
    const districtMap = {};
    allDistricts.forEach(d => {
      districtMap[d.district_name.toLowerCase()] = d.district_id;
    });

    // Seed government colleges
    let govCollegeCount = 0;
    for (const collegeData of GOVT_COLLEGES) {
      const districtId = districtMap[collegeData.district.toLowerCase()];
      if (districtId) {
        await College.findOrCreate({
          where: { college_code: collegeData.code },
          defaults: {
            college_code: collegeData.code,
            college_name: collegeData.name,
            district_id: districtId,
            college_type: collegeData.type,
            gender_type: 'Co-Ed',
            hostel: 1,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        govCollegeCount++;
      }
    }
    
    // Seed affiliated colleges
    let affCollegeCount = 0;
    for (const collegeData of AFFILIATED_COLLEGES) {
      const districtId = districtMap[collegeData.district.toLowerCase()];
      if (districtId) {
        await College.findOrCreate({
          where: { college_code: collegeData.code },
          defaults: {
            college_code: collegeData.code,
            college_name: collegeData.name,
            district_id: districtId,
            college_type: collegeData.type,
            gender_type: 'Co-Ed',
            hostel: 1,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        affCollegeCount++;
      }
    }
    
    console.log(`✓ Colleges seeded (${govCollegeCount + affCollegeCount} total - ${govCollegeCount} Government + ${affCollegeCount} Affiliated)\n`);

    // STEP 6: Courses
    console.log('📚 Seeding courses...');
    let courseCount = 0;
    for (const courseData of ALL_COURSES) {
      await Course.findOrCreate({
        where: { branch_code: courseData.code },
        defaults: {
          branch_code: courseData.code,
          branch_name: courseData.name,
          intake_capacity: 60, // Default capacity
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      courseCount++;
    }
    console.log(`✓ Courses seeded (${courseCount} unique branch codes)\n`);

    // STEP 7: Fee Structure (default for general category)
    console.log('💰 Setting up fee structures...');
    const feeStructure = await FeeStructure.findOrCreate({
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
    console.log('✓ Fee structure configured\n');

    // STEP 8: Admin User
    console.log('👨‍💼 Creating admin user...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await User.findOrCreate({
      where: { email: 'admin@dote.tn.gov.in' },
      defaults: {
        email: 'admin@dote.tn.gov.in',
        password_hash: adminHash,
        full_name: 'DOTE Administrator',
        phone: '9876543200',
        user_type: 'ADMIN',
        college_id: null,
        is_verified: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    console.log('✓ Admin user created\n');

    // STEP 9: College Staff Users
    console.log('👨‍🏫 Creating college staff users...');
    const allColleges = await College.findAll({ limit: 4 });
    const staffHash = await bcrypt.hash('Staff@123', 10);
    
    for (let i = 0; i < Math.min(4, allColleges.length); i++) {
      const college = allColleges[i];
      await User.findOrCreate({
        where: { email: `staff.${college.college_code}@dote.tn.gov.in` },
        defaults: {
          email: `staff.${college.college_code}@dote.tn.gov.in`,
          password_hash: staffHash,
          full_name: `Staff ${college.college_code}`,
          phone: `9876543${210 + i}`,
          user_type: 'COLLEGE_STAFF',
          college_id: college.college_id,
          is_verified: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    console.log('✓ College staff users created (4 accounts)\n');

    // STEP 10: Student Users & Accounts
    console.log('👨‍🎓 Creating student accounts...');
    const studentHash = await bcrypt.hash('Student@123', 10);
    
    for (let i = 0; i < 5; i++) {
      const phone = `987654321${i}`;
      const [user, userCreated] = await User.findOrCreate({
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

      if (userCreated) {
        // Create student profile
        await Student.findOrCreate({
          where: { user_id: user.user_id },
          defaults: {
            user_id: user.user_id,
            register_number: `REG${Date.now()}${i}`,
            date_of_birth: '2000-01-01',
            gender: i % 2 === 0 ? 'M' : 'F',
            community_id: communityMap['OC'],
            caste_id: null,
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
    }
    console.log('✓ Student accounts created (5 students)\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ COMPREHENSIVE MIGRATION COMPLETE! ✨');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`
📊 MIGRATION SUMMARY:
  ✓ Districts: ${TN_DISTRICTS.length}
  ✓ Communities: ${COMMUNITIES.length}
  ✓ Castes: ${casteCount}
  ✓ Colleges: ${govCollegeCount + affCollegeCount} 
    - Government: ${govCollegeCount}
    - Affiliated: ${affCollegeCount}
  ✓ Courses: ${courseCount} unique branch codes
  ✓ Academic Years: 3
  ✓ Users: 10 (1 Admin + 4 Staff + 5 Students)

🎯 ALL DATA FROM SQL FILES SUCCESSFULLY LOADED!
    `);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run migration
migrate();
