"use strict";

module.exports = (sequelize, DataTypes) => {
	const Setting = sequelize.define(
		"Setting",
		{
			key: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			value: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			tableName: "settings",
			timestamps: true,
		}
	);

	return Setting;
};
