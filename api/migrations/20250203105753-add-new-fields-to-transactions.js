'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'local_rental_plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'category');
    await queryInterface.removeColumn('transactions', 'city_id');
    await queryInterface.removeColumn('transactions', 'local_rental_plan_id');
  }
};
