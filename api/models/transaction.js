module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
		"Transaction",
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			invoice_id: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			payment_id: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			user_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			trip_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			vehicle_id: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			pickup_address: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			vehicle_name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			extra_km: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			additional_kilometers: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			additional_time: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			additional_time_charge: {
				type: DataTypes.DECIMAL(8, 2),
				allowNull: false,
				defaultValue: 0.0,
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
			original_amount: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			paid_amount: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			order_id: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			method: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			card: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			upi: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			bank: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			wallet: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			contact: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			error_description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			error_reason: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			acquirer_data: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			all_details: {
				type: DataTypes.JSON,
				allowNull: true,
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
			tableName: "transactions",
		}
	);

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "users",
    });

    Transaction.belongsTo(models.Vehicle, {
      foreignKey: "vehicle_id",
      targetKey: "id",
    });

    Transaction.belongsTo(models.Trip, {
      foreignKey: "trip_id",
      targetKey: "id",
    });

    Transaction.belongsTo(models.Trip, {
      foreignKey: "trip_id",
      targetKey: "id",
    });
  };

  return Transaction;
};
