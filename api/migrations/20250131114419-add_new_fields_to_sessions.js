'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('sessions', 'city_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('sessions', 'local_rental_plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('sessions', 'time', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sessions', 'category');
    await queryInterface.removeColumn('sessions', 'city_id');
    await queryInterface.removeColumn('sessions', 'local_rental_plan_id');
    await queryInterface.removeColumn('sessions', 'time');
  }
};
