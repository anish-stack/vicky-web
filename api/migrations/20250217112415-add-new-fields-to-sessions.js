'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'car_tab', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'check_in', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'check_out', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'adult', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'children', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'rooms', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sessions', 'car_tab');
    await queryInterface.removeColumn('sessions', 'check_in');
    await queryInterface.removeColumn('sessions', 'check_out');
    await queryInterface.removeColumn('sessions', 'adult');
    await queryInterface.removeColumn('sessions', 'children');
    await queryInterface.removeColumn('sessions', 'rooms');
  }
};
