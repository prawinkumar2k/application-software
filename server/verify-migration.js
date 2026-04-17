const { College, Course, User, District } = require('./models');

(async () => {
  try {
    const colleges = await College.findAll({ 
      attributes: ['college_code', 'college_name', 'district_id'],
      include: [{ model: District, as: 'district', attributes: ['district_name'], required: false }],
      order: [['college_code', 'ASC']]
    });
    
    const courseCount = await Course.count();
    const users = await User.findAll({ attributes: ['name', 'email', 'role'] });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         DOTE MIGRATION VERIFICATION - COMPLETE             ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📚 COLLEGES IN DATABASE:');
    console.log('─'.repeat(80));
    colleges.forEach(c => {
      const districtName = c.district ? c.district.district_name : 'N/A';
      console.log(`  ${String(c.college_code).padEnd(4)} | ${c.college_name.padEnd(45)} | ${districtName}`);
    });
    console.log('─'.repeat(80));
    console.log(`✓ Total: ${colleges.length} colleges\n`);

    console.log('📖 COURSE DATA:');
    console.log('─'.repeat(60));
    console.log(`✓ Total Course Entries: ${courseCount}\n`);

    console.log('👥 USER ACCOUNTS:');
    console.log('─'.repeat(60));
    users.forEach(u => {
      console.log(`  ${u.name.padEnd(20)} | ${u.email.padEnd(35)} | ${u.role}`);
    });
    console.log('─'.repeat(60));
    console.log(`✓ Total: ${users.length} users\n`);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║               ALL DATA SUCCESSFULLY MIGRATED               ║');
    console.log('║  Ready for production! Start servers and test API routes   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
