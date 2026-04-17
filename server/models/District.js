const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const District = sequelize.define('District', {
  district_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  district_name: { type: DataTypes.STRING(100), allowNull: false },
  state: { type: DataTypes.STRING(100), defaultValue: 'Tamil Nadu' },
}, { tableName: 'master_districts' });

module.exports = District;
