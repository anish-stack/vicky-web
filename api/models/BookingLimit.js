module.exports = (sequelize, DataTypes) => {
	const BookingLimit = sequelize.define(
		"BookingLimit",
		{
			id: {
				type: DataTypes.BIGINT,
				primaryKey: true,
				autoIncrement: true,
			},
			city_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			vehicle_id: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			limit_date: {
				type: DataTypes.DATEONLY, // NULL means fallback to city-vehicle only
				allowNull: true,
			},
			max_limit: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: "booking_limits",
			timestamps: true,
			indexes: [
				{
					unique: true,
					fields: ["city_id", "vehicle_id", "limit_date"],
				},
			],
		}
	);
	BookingLimit.associate = function (models) {
		BookingLimit.belongsTo(models.cities, {
			foreignKey: "city_id",
			as: "city",
		});
	};

	return BookingLimit;
};
