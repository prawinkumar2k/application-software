require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcrypt');
const { sequelize, District, Community, Caste, AcademicYear, College, Course, User, FeeStructure, Student, Application } = require('../models');

const TN_DISTRICTS = [
  'Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli',
  'Tiruppur','Vellore','Erode','Thoothukkudi','Dindigul','Thanjavur',
  'Ranipet','Sivaganga','Virudhunagar','Nagapattinam','Kancheepuram',
  'Chengalpattu','Kallakurichi','Krishnagiri','Dharmapuri','Villupuram',
  'Cuddalore','Ariyalur','Perambalur','Karur','Namakkal','Nilgiris',
  'Ramanathapuram','Pudukkottai','Tenkasi','Tirupattur','Tiruvarur',
  'Mayiladuthurai','Kanniyakumari'
];

const COMMUNITIES = [
  { community_code: 'OC', community_name: 'Others / General' },
  { community_code: 'BC', community_name: 'Backward Class' },
  { community_code: 'MBC', community_name: 'Most Backward Class' },
  { community_code: 'SC', community_name: 'Scheduled Caste' },
  { community_code: 'ST', community_name: 'Scheduled Tribe' },
  { community_code: 'BCM', community_name: 'Backward Class Muslim' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Connected & synced');

    // Districts
    for (const name of TN_DISTRICTS) {
      await District.findOrCreate({ where: { district_name: name }, defaults: { state: 'Tamil Nadu' } });
    }
    console.log('✓ Districts seeded');

    // Communities
    for (const c of COMMUNITIES) {
      await Community.findOrCreate({ where: { community_code: c.community_code }, defaults: c });
    }
    console.log('✓ Communities seeded');

    // Academic year
    const [year] = await AcademicYear.findOrCreate({
      where: { year_label: '2025-26' },
      defaults: { is_active: 1, app_open_date: '2025-06-01', app_close_date: '2025-08-31' },
    });
    console.log('✓ Academic year seeded');

    // Fee structures
    const fees = [
      { year_id: year.year_id, category: 'OC', amount: 300 },
      { year_id: year.year_id, category: 'BC', amount: 250 },
      { year_id: year.year_id, category: 'MBC', amount: 200 },
      { year_id: year.year_id, category: 'SC', amount: 0 },
      { year_id: year.year_id, category: 'ST', amount: 0 },
      { year_id: year.year_id, category: 'BCM', amount: 250 },
      { year_id: year.year_id, category: 'GENERAL', amount: 300 },
    ];
    for (const f of fees) {
      await FeeStructure.findOrCreate({ where: { year_id: f.year_id, category: f.category }, defaults: f });
    }
    console.log('✓ Fee structures seeded');

    // Sample colleges
    const chennaiDistrict = await District.findOne({ where: { district_name: 'Chennai' } });
    const coimbatoreDistrict = await District.findOne({ where: { district_name: 'Coimbatore' } });

    const sampleColleges = [
      { college_code: 'GPC001', college_name: 'Government Polytechnic College, Chennai', district_id: chennaiDistrict?.district_id, gender_type: 'CO-ED', hostel_available: 1, hostel_gender: 'BOTH', college_type: 'GOVERNMENT' },
      { college_code: 'GPC002', college_name: 'Government Polytechnic College for Women, Chennai', district_id: chennaiDistrict?.district_id, gender_type: 'FEMALE', hostel_available: 1, hostel_gender: 'FEMALE', college_type: 'GOVERNMENT' },
      { college_code: 'GPC003', college_name: 'Government Polytechnic College, Coimbatore', district_id: coimbatoreDistrict?.district_id, gender_type: 'CO-ED', hostel_available: 1, hostel_gender: 'MALE', college_type: 'GOVERNMENT' },
      { college_code: 'GPC004', college_name: 'Dr. Dharmambal Government Polytechnic College for Women', district_id: chennaiDistrict?.district_id, gender_type: 'FEMALE', hostel_available: 0, college_type: 'GOVERNMENT' },
    ];

    const collegeMap = {};
    for (const c of sampleColleges) {
      const [college] = await College.findOrCreate({ where: { college_code: c.college_code }, defaults: c });
      collegeMap[c.college_code] = college;
      // Add courses
      const courses = [
        { course_code: 'MECH', course_name: 'Diploma in Mechanical Engineering', intake_seats: 60 },
        { course_code: 'ECE', course_name: 'Diploma in Electronics & Communication Engineering', intake_seats: 60 },
        { course_code: 'CSE', course_name: 'Diploma in Computer Science & Engineering', intake_seats: 60 },
        { course_code: 'CIVIL', course_name: 'Diploma in Civil Engineering', intake_seats: 60 },
      ];
      for (const course of courses) {
        await Course.findOrCreate({ where: { college_id: college.college_id, course_code: course.course_code }, defaults: { ...course, college_id: college.college_id } });
      }
    }
    console.log('✓ Colleges & courses seeded');

    // Super admin
    const adminPass = await bcrypt.hash('Admin@123', 12);
    await User.findOrCreate({
      where: { email: 'admin@dote.tn.gov.in' },
      defaults: { name: 'Super Admin', email: 'admin@dote.tn.gov.in', password: adminPass, role: 'SUPER_ADMIN' },
    });
    console.log('✓ Admin user seeded (admin@dote.tn.gov.in / Admin@123)');

    // College Staff Users
    const staffPass = await bcrypt.hash('Staff@123', 12);
    const staffAccounts = [
      { email: 'staff.gpc001@dote.tn.gov.in', name: 'Rajesh Kumar', college_code: 'GPC001' },
      { email: 'staff.gpc002@dote.tn.gov.in', name: 'Priya Sharma', college_code: 'GPC002' },
      { email: 'staff.gpc003@dote.tn.gov.in', name: 'Arun Patel', college_code: 'GPC003' },
      { email: 'staff.gpc004@dote.tn.gov.in', name: 'Lakshmi Reddy', college_code: 'GPC004' },
    ];

    for (const staff of staffAccounts) {
      const college = collegeMap[staff.college_code];
      await User.findOrCreate({
        where: { email: staff.email },
        defaults: {
          name: staff.name,
          email: staff.email,
          password: staffPass,
          role: 'COLLEGE_STAFF',
          college_id: college.college_id,
        },
      });
    }
    console.log('✓ College Staff users seeded');
    console.log('  - staff.gpc001@dote.tn.gov.in / Staff@123');
    console.log('  - staff.gpc002@dote.tn.gov.in / Staff@123');
    console.log('  - staff.gpc003@dote.tn.gov.in / Staff@123');
    console.log('  - staff.gpc004@dote.tn.gov.in / Staff@123');

    // Sample Students
    const studentPass = await bcrypt.hash('Student@123', 12);
    const genCommunity = await Community.findOne({ where: { community_code: 'OC' } });
    const studentAccounts = [
      { mobile: '9876543210', email: 'student1@example.com', name: 'Arjun Singh' },
      { mobile: '9876543211', email: 'student2@example.com', name: 'Devi Lakshmi' },
      { mobile: '9876543212', email: 'student3@example.com', name: 'Vikram Raj' },
      { mobile: '9876543213', email: 'student4@example.com', name: 'Nisha Verma' },
      { mobile: '9876543214', email: 'student5@example.com', name: 'Rohan Kumar' },
    ];

    for (const student of studentAccounts) {
      await Student.findOrCreate({
        where: { mobile: student.mobile },
        defaults: {
          mobile: student.mobile,
          email: student.email,
          password: studentPass,
          name: student.name,
          community_id: genCommunity?.community_id,
          is_verified: 1,
        },
      });
    }
    console.log('✓ Sample Students seeded');
    console.log('  - 9876543210 / Student@123');
    console.log('  - 9876543211 / Student@123');
    console.log('  - 9876543212 / Student@123');
    console.log('  - 9876543213 / Student@123');
    console.log('  - 9876543214 / Student@123');

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
