'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Vehicles', 'extra_fare_km', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Vehicles', 'driver_expences', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vehicles', 'extra_fare_km');
    await queryInterface.removeColumn('Vehicles', 'driver_expences');
  }
};
