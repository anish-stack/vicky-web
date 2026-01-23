"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("transactions", "additional_kilometers", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
			after: "extra_km",
		});

		await queryInterface.addColumn("transactions", "additional_time", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
			after: "additional_kilometers",
		});

    await queryInterface.addColumn("trips", "additional_kilometers", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
			after: "extra_km",
		});
    await queryInterface.addColumn("trips", "additional_time", {
			type: Sequelize.DECIMAL(8, 2),
			allowNull: false,
			defaultValue: 0.0,
			after: "additional_kilometers",
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("transactions", "additional_kilometers");
		await queryInterface.removeColumn("transactions", "additional_time");
    await queryInterface.removeColumn("trips", "additional_kilometers");
		await queryInterface.removeColumn("trips", "additional_time");
	},
};
