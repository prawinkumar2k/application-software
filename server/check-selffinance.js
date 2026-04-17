const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Prawin@2k4',
      database: 'dote_admission'
    });
    
    const [rows] = await conn.execute('SELECT college_type, COUNT(*) as count FROM colleges GROUP BY college_type');
    console.log('\n📊 College Types Distribution:');
    console.table(rows);
    
    const [selfFinance] = await conn.execute('SELECT college_id, college_name, college_type FROM colleges WHERE college_type = ?', ['SELF_FINANCE']);
    console.log(`\n⚠️  Found ${selfFinance.length} SELF_FINANCE colleges`);
    
    if(selfFinance.length > 0 && selfFinance.length <= 20) {
      console.table(selfFinance);
    } else if(selfFinance.length > 20) {
      console.table(selfFinance.slice(0, 10));
      console.log(`... and ${selfFinance.length - 10} more`);
    }
    
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
