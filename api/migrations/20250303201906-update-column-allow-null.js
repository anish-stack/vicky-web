'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('transactions', 'trip_type', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('transactions', 'distance', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
     
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('transactions', 'trip_type', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('transactions', 'distance', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
  }
};
