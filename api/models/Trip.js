module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define(
		"Trip",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: DataTypes.INTEGER,
				references: {
					model: "Users",
					key: "id",
				},
				allowNull: false,
			},
			vehicle_id: {
				type: DataTypes.INTEGER,
				references: {
					model: "Vehicles",
					key: "id",
				},
				allowNull: false,
			},
			pickup_address: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			extra_km: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			toll_tax: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			parking_charges: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			driver_charges: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			night_charges: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			fuel_charges: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			places: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			departure_date: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			return_date: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			distance: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			trip_type: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			trip_status: {
				type: DataTypes.ENUM("active", "reserved", "completed", "cancel"),
				allowNull: false,
				defaultValue: "reserved",
			},
			category: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			city_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			local_rental_plan_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			airport_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			airport_city_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			airport_from_to: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			car_tab: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dham_package_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dham_pickup_city_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dham_package_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			dham_pickup_city_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			dham_package_days: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			dham_category_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dham_category_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			pincode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			// createdBy: {
			//   type: DataTypes.STRING,
			//   allowNull: true,
			// },
			// updatedBy: {
			//   type: DataTypes.STRING,
			//   allowNull: true,
			// },
		},
		{
			timestamps: true,
			tableName: "trips",
		}
	);

  Trip.associate = (models) => {
    Trip.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "users",
    });

    Trip.belongsTo(models.Vehicle, {
      foreignKey: "vehicle_id",
      targetKey: "id",
    });

    Trip.hasMany(models.Transaction, {
      foreignKey: "trip_id",
      sourceKey: "id",
    });

    Trip.hasMany(models.otp, {
      foreignKey: "trip_id",
      sourceKey: "id",
    });
    Trip.belongsTo(models.Pincode, {
			foreignKey: "pincode",
			targetKey: "pincode",
			as: "pincode_details",
		});
	Trip.belongsTo(models.airports, {
		foreignKey: "airport_id",
		targetKey: "id",
		as: "airport_detail",
	});

	Trip.belongsTo(models.cities, {
		foreignKey: "city_id",
		as: "trip_city",
	});

	Trip.belongsTo(models.localrentalplans, {
		foreignKey: "local_rental_plan_id",
		as: "local_rental_plan",
	});

	Trip.belongsTo(models.DhamPackageRoute, {
		foreignKey: "dham_package_id",
		as: "dham_package",
	});

	Trip.belongsTo(models.DhamPickupCity, {
		foreignKey: "dham_pickup_city_id",
		as: "dham_pickup_city",
	});

	Trip.belongsTo(models.DhamCategory, {
		foreignKey: "dham_category_id",
		as: "dham_category",
	});
  };

  return Trip;
};
