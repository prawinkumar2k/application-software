const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApplicationCollege = sequelize.define('ApplicationCollege', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  application_id: { type: DataTypes.INTEGER, allowNull: false },
  college_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: true },
  preference_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, { tableName: 'application_colleges', timestamps: true, underscored: true });

module.exports = ApplicationCollege;
