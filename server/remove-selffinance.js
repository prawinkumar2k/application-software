const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Prawin@2k4',
      database: 'dote_admission'
    });
    
    // Disable foreign key checks temporarily
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Foreign key checks disabled');
    
    // Get all SELF_FINANCE college IDs first
    const [selfFinanceColleges] = await conn.execute('SELECT college_id FROM colleges WHERE college_type = ?', ['SELF_FINANCE']);
    console.log(`\n🗑️  Removing ${selfFinanceColleges.length} SELF_FINANCE colleges...`);
    
    // Delete courses for these colleges
    const collegeIds = selfFinanceColleges.map(c => c.college_id);
    if(collegeIds.length > 0) {
      const placeholders = collegeIds.map(() => '?').join(',');
      const [courseResult] = await conn.execute(`DELETE FROM courses WHERE college_id IN (${placeholders})`, collegeIds);
      console.log(`✅ Deleted ${courseResult.affectedRows} courses`);
    }
    
    // Delete SELF_FINANCE colleges
    const [collegeResult] = await conn.execute('DELETE FROM colleges WHERE college_type = ?', ['SELF_FINANCE']);
    console.log(`✅ Deleted ${collegeResult.affectedRows} SELF_FINANCE colleges`);
    
    // Re-enable foreign key checks
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔒 Foreign key checks re-enabled');
    
    // Verify
    const [verify] = await conn.execute('SELECT college_type, COUNT(*) as count FROM colleges GROUP BY college_type');
    console.log('\n✨ Final College Distribution:');
    console.table(verify);
    
    const [totalData] = await conn.execute('SELECT COUNT(*) as total_colleges FROM colleges');
    const [totalCourses] = await conn.execute('SELECT COUNT(*) as total_courses FROM courses');
    console.log(`\n📊 Database Status:`);
    console.log(`   Total Colleges: ${totalData[0].total_colleges}`);
    console.log(`   Total Courses: ${totalCourses[0].total_courses}`);
    
    await conn.end();
    console.log('\n✨ Cleanup complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
