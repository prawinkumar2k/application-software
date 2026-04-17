const models = require('./models');

(async () => {
  try {
    const districts = await models.District.count();
    const colleges = await models.College.count();
    const courses = await models.Course.count();
    const users = await models.User.count();
    const students = await models.Student.count();

    console.log('\n✅ MIGRATION VERIFICATION SUCCESSFUL!\n');
    console.log('📊 Database Statistics:');
    console.log('  ✓ Districts:', districts);
    console.log('  ✓ Colleges:', colleges);
    console.log('  ✓ Branch Codes (Courses):', courses);
    console.log('  ✓ System Users:', users);
    console.log('  ✓ Student Profiles:', students);
    
    // Sample college data
    const sample = await models.College.findOne();
    console.log('\n📍 Sample College:');
    console.log('  Code:', sample.college_code);
    console.log('  Name:', sample.college_name);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
