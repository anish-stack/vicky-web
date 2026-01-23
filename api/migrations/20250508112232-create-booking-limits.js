"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("booking_limits", {
			id: {
				type: Sequelize.BIGINT,
				autoIncrement: true,
				primaryKey: true,
			},
			city_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			vehicle_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
			},
			limit_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
			},
			max_limit: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn("NOW"),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn("NOW"),
			},
		});

		await queryInterface.addConstraint("booking_limits", {
			fields: ["city_id", "vehicle_id", "limit_date"],
			type: "unique",
			name: "unique_booking_limit_per_city_vehicle_date",
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("booking_limits");
	},
};
