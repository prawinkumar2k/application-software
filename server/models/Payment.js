const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  payment_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  application_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  tracking_id: { type: DataTypes.STRING(100) },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
  status: { type: DataTypes.ENUM('PENDING','SUCCESS','FAILED','ABORTED'), defaultValue: 'PENDING' },
  bank_ref_no: { type: DataTypes.STRING(100) },
  payment_mode: { type: DataTypes.STRING(50) },
  failure_message: { type: DataTypes.TEXT },
}, { tableName: 'payments', timestamps: true, underscored: true });

module.exports = Payment;
