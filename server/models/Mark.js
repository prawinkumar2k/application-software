const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Mark = sequelize.define('Mark', {
  mark_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  application_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_name: { type: DataTypes.STRING(100), allowNull: false },
  marks_obtained: { type: DataTypes.DECIMAL(6,2), allowNull: false },
  max_marks: { type: DataTypes.DECIMAL(6,2), allowNull: false, defaultValue: 100 },
  exam_year: { type: DataTypes.STRING(10) },
}, { tableName: 'marks', timestamps: true, underscored: true });

module.exports = Mark;
