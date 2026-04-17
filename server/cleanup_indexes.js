const sequelize = require('./config/db');

async function cleanupIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEX FROM `master_communities`;");
    const indexesToDrop = results
      .filter(idx => idx.Key_name.startsWith('community_code'))
      .map(idx => idx.Key_name);

    console.log(`Found ${indexesToDrop.length} indexes to drop.`);

    for (const indexName of indexesToDrop) {
      console.log(`Dropping index: ${indexName}`);
      await sequelize.query(`ALTER TABLE \`master_communities\` DROP INDEX \`${indexName}\`;`);
    }

    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    process.exit();
  }
}

cleanupIndexes();
