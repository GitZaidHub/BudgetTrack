const sequelize = require('../config/database');
const User = require('./User');
const Expense = require('./Expense');
const Order = require('./Order');

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

const db = {
  sequelize,
  User,
  Expense,
  Order,
};

module.exports = db;