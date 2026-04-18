const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Application = sequelize.define('Application', {
  application_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  year_id: { type: DataTypes.INTEGER, allowNull: false },
  application_no: { type: DataTypes.STRING(30), unique: true },
  aadhaar_number: { type: DataTypes.STRING(12), allowNull: true, unique: true },
  status: {
    type: DataTypes.ENUM('DRAFT','SUBMITTED','PAID','VERIFIED','ALLOCATED','REJECTED'),
    defaultValue: 'DRAFT'
  },
  submitted_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'applications', timestamps: true, underscored: true });

module.exports = Application;
