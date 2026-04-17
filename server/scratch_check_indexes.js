const sequelize = require('./config/db');

async function checkIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEX FROM `master_communities`;");
    console.log('Indexes for master_communities:');
    results.forEach(idx => {
      console.log(`- ${idx.Key_name} (Column: ${idx.Column_name})`);
    });
    console.log(`Total indexes: ${results.length}`);
  } catch (err) {
    console.error('Error checking indexes:', err);
  } finally {
    process.exit();
  }
}

checkIndexes();
