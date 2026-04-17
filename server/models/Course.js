const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
  course_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  college_id: { type: DataTypes.INTEGER, allowNull: false },
  course_code: { type: DataTypes.STRING(20), allowNull: false },
  course_name: { type: DataTypes.STRING(255), allowNull: false },
  intake_seats: { type: DataTypes.INTEGER, defaultValue: 60 },
  duration_years: { type: DataTypes.INTEGER, defaultValue: 3 },
  is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
}, { tableName: 'courses' });

module.exports = Course;
