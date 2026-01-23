"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("otp", "otp_type", {
      type: Sequelize.ENUM("start_trip", "end_trip", "login"),
      allowNull: false,
      defaultValue: "login",
      after: "otp",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("otp", "otp_type");
  },
};
