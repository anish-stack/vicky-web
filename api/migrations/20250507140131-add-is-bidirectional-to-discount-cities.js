"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn("discount_cities", "is_bidirectional", {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			after: "drop_city_place_id", // adjust position if needed
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn("discount_cities", "is_bidirectional");
	},
};
