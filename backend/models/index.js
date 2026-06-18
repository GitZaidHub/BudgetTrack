const sequelize = require('../config/database');
const User = require('./User');
const Expense = require('./Expense');
const Order = require('./Order');
const ForgotPasswordRequest = require('./ForgotPasswordRequest');

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// A User can generate many ForgotPasswordRequests over time (Many-to-One
// from the request's perspective, as specified).
User.hasMany(ForgotPasswordRequest, { foreignKey: 'userId', onDelete: 'CASCADE' });
ForgotPasswordRequest.belongsTo(User, { foreignKey: 'userId' });

const db = {
  sequelize,
  User,
  Expense,
  Order,
  ForgotPasswordRequest,
};

module.exports = db;