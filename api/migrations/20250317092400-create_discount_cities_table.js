'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('discount_cities', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      discount_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'discounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      pickup_city_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pickup_city_place_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      drop_city_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      drop_city_place_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('discount_cities');
  }
};
