'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('dham_packages', 'image', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('dham_packages', 'dham_category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("dham_packages", "distance", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('dham_packages', 'image');
    await queryInterface.removeColumn('dham_packages', 'dham_category_id');
    await queryInterface.removeColumn('dham_packages', 'distance');
  }
};
