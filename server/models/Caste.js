const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Caste = sequelize.define('Caste', {
  caste_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  community_id: { type: DataTypes.INTEGER, allowNull: false },
  caste_name: { type: DataTypes.STRING(100), allowNull: false },
}, { tableName: 'master_castes', timestamps: true, underscored: true });

module.exports = Caste;
