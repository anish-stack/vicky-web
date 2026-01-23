'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Vehicles', 'passengers', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Vehicles', 'large_size_bag', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Vehicles', 'medium_size_bag', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('Vehicles', 'hand_bag', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Vehicles', 'passengers');
    await queryInterface.removeColumn('Vehicles', 'large_size_bag');
    await queryInterface.removeColumn('Vehicles', 'medium_size_bag');
    await queryInterface.removeColumn('Vehicles', 'hand_bag');
  }
};
