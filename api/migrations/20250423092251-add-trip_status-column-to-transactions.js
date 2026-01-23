"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("transactions", "trip_status", {
      type: Sequelize.ENUM("active", "reserved", "completed", "cancel"),
      allowNull: false,
      after: "trip_type",
      defaultValue: "reserved",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("transactions", "trip_status");
  },
};
