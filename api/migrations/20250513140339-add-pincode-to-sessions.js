"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.addColumn("sessions", "pincode", {
			type: Sequelize.STRING,
			allowNull: true, // Set to false if you want it to be required
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.removeColumn("sessions", "pincode");
	},
};
