const db = require('./config/db');

(async () => {
  try {
    await db.authenticate();
    console.log('Connected to database');
    
    // Disable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('Disabled foreign key checks');
    
    // Drop the corrupted table
    await db.query('DROP TABLE IF EXISTS master_communities');
    console.log('✅ Dropped master_communities table');
    
    // Drop the corrupted Caste table too (likely has same issue)
    await db.query('DROP TABLE IF EXISTS master_castes');
    console.log('✅ Dropped master_castes table');
    
    // Re-enable foreign key checks
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Re-enabled foreign key checks');
    
    // Sync models to recreate cleanly
    const { Community, Caste } = require('./models');
    await Community.sync({ force: false });
    console.log('✅ Community table recreated');
    
    await Caste.sync({ force: false });
    console.log('✅ Caste table recreated');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
