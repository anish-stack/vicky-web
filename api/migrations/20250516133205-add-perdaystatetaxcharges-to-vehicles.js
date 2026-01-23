"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("vehicles", "perdaystatetaxcharges", {
			type: Sequelize.FLOAT,
			allowNull: false,
			defaultValue: 0,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("vehicles", "perdaystatetaxcharges");
	},
};
