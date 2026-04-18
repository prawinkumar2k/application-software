const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Document = sequelize.define('Document', {
  doc_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  application_id: { type: DataTypes.INTEGER, allowNull: false },
  doc_type: { type: DataTypes.STRING(50), allowNull: false },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  original_name: { type: DataTypes.STRING(255) },
  file_size: { type: DataTypes.INTEGER },
  mime_type: { type: DataTypes.STRING(100) },
  is_verified: { type: DataTypes.TINYINT, defaultValue: 0 },
  verified_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'documents', timestamps: true, underscored: true });

module.exports = Document;
