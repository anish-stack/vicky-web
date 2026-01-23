"use strict";
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("transactions", "additional_time_charge", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
		});
    await queryInterface.addColumn("trips", "additional_time_charge", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("transactions", "additional_time_charge");
		await queryInterface.removeColumn("trips", "additional_time_charge");
	},
};
