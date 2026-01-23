"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("pincodes", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			city_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			pincode: {
				allowNull: false,
				unique: true,
				type: Sequelize.INTEGER,
				validate: {
					min: 100000,
					max: 999999,
				},
			},
			area_name: {
				type: Sequelize.STRING(100), // max 100 chars
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("pincodes");
	},
};
