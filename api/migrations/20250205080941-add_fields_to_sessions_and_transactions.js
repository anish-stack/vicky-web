'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'airport_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('sessions', 'airport_city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('sessions', 'airport_from_to', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'airport_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'airport_city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('transactions', 'airport_from_to', {
      type: Sequelize.STRING,
      allowNull: true,
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sessions', 'airport_id');
    await queryInterface.removeColumn('sessions', 'airport_city_id');
    await queryInterface.removeColumn('sessions', 'airport_from_to');
    await queryInterface.removeColumn('transactions', 'airport_id');
    await queryInterface.removeColumn('transactions', 'airport_city_id');
    await queryInterface.removeColumn('transactions', 'airport_from_to');
  }
};
