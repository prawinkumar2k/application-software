const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  notif_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('EMAIL','SMS'), defaultValue: 'EMAIL' },
  subject: { type: DataTypes.STRING(255) },
  body: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('SENT','FAILED','PENDING'), defaultValue: 'PENDING' },
  sent_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'notifications', timestamps: true, underscored: true });

module.exports = Notification;
