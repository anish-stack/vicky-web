'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'dham_package_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'dham_pickup_city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('sessions', 'dham_package_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sessions', 'dham_package_id');
    await queryInterface.removeColumn('sessions', 'dham_pickup_city_id');
    await queryInterface.removeColumn('sessions', 'dham_package_days');
  }
};
