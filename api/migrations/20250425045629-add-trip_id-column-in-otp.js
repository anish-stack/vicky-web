"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("otp", "trip_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "trips", // Name of the Trip table
        key: "id", // Primary key in the Trip table
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      after: "phone_number",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("otp", "trip_id");
  },
};
