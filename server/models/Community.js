const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Community = sequelize.define('Community', {
  community_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  community_code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  community_name: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'master_communities' });

module.exports = Community;
