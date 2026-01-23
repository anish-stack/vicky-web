'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'vehicle_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('transactions', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'pickup_address', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'vehicle_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'extra_km', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'toll_tax', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('transactions', 'parking_charges', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('transactions', 'driver_charges', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('transactions', 'night_charges', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('transactions', 'fuel_charges', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'vehicle_id');
    await queryInterface.removeColumn('transactions', 'name');
    await queryInterface.removeColumn('transactions', 'pickup_address');
    await queryInterface.removeColumn('transactions', 'vehicle_name');
    await queryInterface.removeColumn('transactions', 'extra_km');
    await queryInterface.removeColumn('transactions', 'toll_tax');
    await queryInterface.removeColumn('transactions', 'parking_charges');
    await queryInterface.removeColumn('transactions', 'driver_charges');
    await queryInterface.removeColumn('transactions', 'night_charges');
    await queryInterface.removeColumn('transactions', 'fuel_charges');
  }
};
