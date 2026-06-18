const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ForgotPasswordRequest = sequelize.define(
  'ForgotPasswordRequest',
  {
    id: {
      // UUID, not auto-increment — per spec, this needs to be
      // unguessable, unlike a sequential integer id.
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'ForgotPasswordRequests',
    timestamps: true, // createdAt also used to enforce link expiry
    indexes: [{ fields: ['userId'] }],
  }
);

module.exports = ForgotPasswordRequest;