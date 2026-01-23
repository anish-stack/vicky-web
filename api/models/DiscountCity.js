module.exports = (sequelize, DataTypes) => {
	const DiscountCity = sequelize.define(
		"DiscountCity",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			discount_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			city_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			pickup_city_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			pickup_city_place_id: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			drop_city_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			drop_city_place_id: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			is_bidirectional: {
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
			tableName: "discount_cities",
		}
	);

	DiscountCity.associate = (models) => {
		DiscountCity.belongsTo(models.Discount, {
			foreignKey: "discount_id",
			as: "discounts",
		});

		DiscountCity.hasMany(models.DiscountVehicle, {
			foreignKey: "discount_city_id",
			as: "discount_vehicles",
		});
	};

	return DiscountCity;
};
