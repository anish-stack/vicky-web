"use strict";
module.exports = (sequelize, DataTypes) => {
	const Pincode = sequelize.define(
		"Pincode",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			city_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			pincode: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
				validate: {
					min: 100000,
					max: 999999,
				},
			},
			area_name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
		},
		{
			tableName: "pincodes",
			timestamps: true,
		}
	);

	Pincode.associate = function (models) {
		Pincode.belongsTo(models.cities, { foreignKey: "city_id" });
	};

	return Pincode;
};
