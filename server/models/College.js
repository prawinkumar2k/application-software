const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const College = sequelize.define('College', {
  college_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  college_code: { type: DataTypes.STRING(20), allowNull: false },
  college_name: { type: DataTypes.STRING(255), allowNull: false },
  address: { type: DataTypes.TEXT },
  district_id: { type: DataTypes.INTEGER },
  gender_type: { type: DataTypes.ENUM('MALE','FEMALE','CO-ED'), allowNull: false, defaultValue: 'CO-ED' },
  hostel_available: { type: DataTypes.TINYINT, defaultValue: 0 },
  hostel_gender: { type: DataTypes.ENUM('MALE','FEMALE','BOTH'), allowNull: true },
  college_type: { type: DataTypes.ENUM('GOVERNMENT','AIDED','SELF_FINANCE'), defaultValue: 'GOVERNMENT' },
  phone: { type: DataTypes.STRING(15) },
  email: { type: DataTypes.STRING(100) },
  is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'colleges' });

module.exports = College;
