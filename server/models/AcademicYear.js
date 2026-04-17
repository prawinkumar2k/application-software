const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AcademicYear = sequelize.define('AcademicYear', {
  year_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  year_label: { type: DataTypes.STRING(20), allowNull: false },
  is_active: { type: DataTypes.TINYINT, defaultValue: 0 },
  app_open_date: { type: DataTypes.DATEONLY, allowNull: true },
  app_close_date: { type: DataTypes.DATEONLY, allowNull: true },
}, { tableName: 'academic_years' });

module.exports = AcademicYear;
