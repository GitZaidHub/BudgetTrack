// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add altering commands here.
//      *
//      * Example:
//      * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
//      */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add reverting commands here.
//      *
//      * Example:
//      * await queryInterface.dropTable('users');
//      */
//   }
// };
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Expenses', 'note', {
      type: Sequelize.STRING(500),
      allowNull: true,  // optional field — existing rows get NULL, no backfill needed
      defaultValue: null,
      after: 'category', // places it after the category column in MySQL
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Expenses', 'note');
  },
};