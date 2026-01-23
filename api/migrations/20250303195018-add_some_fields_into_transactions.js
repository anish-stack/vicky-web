'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'car_tab', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'dham_package_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'dham_pickup_city_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'dham_package_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'dham_pickup_city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('transactions', 'dham_package_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'car_tab');
    await queryInterface.removeColumn('transactions', 'dham_package_name');
    await queryInterface.removeColumn('transactions', 'dham_pickup_city_name');
    await queryInterface.removeColumn('transactions', 'dham_package_id');
    await queryInterface.removeColumn('transactions', 'dham_pickup_city_id');
    await queryInterface.removeColumn('transactions', 'dham_package_days');
  }
};
