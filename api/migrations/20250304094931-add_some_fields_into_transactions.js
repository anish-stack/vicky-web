'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'dham_category_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'dham_category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'dham_category_name');
    await queryInterface.removeColumn('transactions', 'dham_category_id');
  }
};
