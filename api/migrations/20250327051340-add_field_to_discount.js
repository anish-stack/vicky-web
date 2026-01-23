'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('discounts', 'overall_discount', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, 
    });

    await queryInterface.addColumn('discounts', 'apply_overall_discount', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('discounts', 'apply_citywise_discount', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('discounts', 'overall_discount');
    await queryInterface.removeColumn('discounts', 'apply_overall_discount');
    await queryInterface.removeColumn('discounts', 'apply_citywise_discount');
  }
};
