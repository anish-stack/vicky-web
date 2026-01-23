'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('sessions', 'adult', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('sessions', 'children', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    
    await queryInterface.changeColumn('sessions', 'rooms', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
