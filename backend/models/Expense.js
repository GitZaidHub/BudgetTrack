const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { EXPENSE_CATEGORIES } = require('../utils/categories');

const Expense = sequelize.define(
  'Expense',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    category: {
      type: DataTypes.ENUM(...EXPENSE_CATEGORIES),
      allowNull: false,
    },
    note: {
  type: DataTypes.STRING(500),
  allowNull: true,
  defaultValue: null,
},
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Expenses',
    timestamps: true,
    indexes: [
      {
        // Every list query filters by userId — index it.
        fields: ['userId'],
      },
    ],
  }
  
);

module.exports = Expense;