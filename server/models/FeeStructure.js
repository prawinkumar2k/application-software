const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FeeStructure = sequelize.define('FeeStructure', {
  fee_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  year_id: { type: DataTypes.INTEGER, allowNull: false },
  category: { type: DataTypes.STRING(50), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0.00 },
}, { tableName: 'fee_structures', timestamps: true, underscored: true });

module.exports = FeeStructure;
