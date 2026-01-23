"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("one_way_trip_pricings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      from: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      to: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price_per_km: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("one_way_trip_pricings");
  },
};
