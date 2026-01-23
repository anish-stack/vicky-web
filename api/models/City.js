module.exports = (sequelize, DataTypes) => {
	const cities = sequelize.define(
		"cities",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			airport_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			distance: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			hotel: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			createdBy: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			updatedBy: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			timestamps: true,
			tableName: "cities",
		}
	);
	cities.associate = function (models) {
		cities.hasMany(models.Pincode, { foreignKey: "city_id" });
		cities.hasMany(models.BookingLimit, {
			foreignKey: "city_id",
			as: "booking_limits",
		});
	};

	return cities;
};
