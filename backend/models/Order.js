const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      // The Cashfree order ID — separate from our own auto-increment `id`,
      // since Cashfree requires a string identifier we generate ourselves.
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUCCESSFUL', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Orders',
    timestamps: true,
    indexes: [{ fields: ['userId'] }, { fields: ['orderId'] }],
  }
);

module.exports = Order;