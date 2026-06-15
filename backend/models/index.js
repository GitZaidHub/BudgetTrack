const sequelize = require('../config/database');
const User = require('./User');

// Associations will be added here in future milestones, e.g.:
// User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Expense.belongsTo(User, { foreignKey: 'userId' });

const db = {
  sequelize,
  User,
};

module.exports = db;