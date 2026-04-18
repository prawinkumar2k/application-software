const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('SUPER_ADMIN','COLLEGE_STAFF'), allowNull: false, defaultValue: 'COLLEGE_STAFF' },
  college_id: { type: DataTypes.INTEGER, allowNull: true },
  is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
  last_login: { type: DataTypes.DATE, allowNull: true },
  refresh_token: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'users', timestamps: true, underscored: true });

module.exports = User;
