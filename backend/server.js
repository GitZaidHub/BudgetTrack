require('dotenv').config();
const validateEnv = require('./config/envValidator');

// Validate BEFORE importing app.js or touching the database at all —
// if config is broken, we want to know immediately, not after Sequelize
// has already tried (and possibly failed in a more confusing way) to
// connect using bad/missing credentials.
try {
  validateEnv();
} catch (error) {
  console.error('❌ Startup aborted:\n');
  console.error(error.message);
  process.exit(1);
}

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synced.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();