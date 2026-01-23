"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("Vehicles", "additional_time_charge", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("Vehicles", "additional_time_charge");
	},
};
