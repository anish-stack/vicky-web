// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const Vehicle = sequelize.define('Vehicle', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   image: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   priceperkm: {
//     type: DataTypes.DECIMAL(10, 2),
//     allowNull: false,
//   },
//   fuelcharges: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false,
//   },
//   drivercharges: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false,
//   },
//   nightcharges: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false,
//   },
//   terms: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   minimum_price: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   minimum_price_range: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   createdBy: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   updatedBy: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   }
// }, {
//   timestamps: true,
//   tableName: 'vehicles', 
// });

// module.exports = Vehicle;

module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define(
    'Vehicle',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      priceperkm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fuelcharges: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      drivercharges: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      parkingcharges: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      nightcharges: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ac_cab: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      luggage: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      terms: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      minimum_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      minimum_price_range: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      extra_fare_km: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      additional_time_charge: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      driver_expences: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passengers: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      large_size_bag: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }, 
      medium_size_bag: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }, 
      hand_bag: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      perdaystatetaxcharges: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      timestamps: true,
      tableName: 'Vehicles',
    }
  );

  Vehicle.associate = (models) => {
    Vehicle.hasMany(models.OneWayTripPricing, {
      foreignKey: 'vehicle_id',
      as: 'one_way_trip_pricings',
    });

    Vehicle.hasMany(models.Transaction, {
      foreignKey: 'vehicle_id',
      sourceKey: 'id',
      as: 'transactions',
    });

    Vehicle.hasMany(models.LocalRentalPricing, {
      foreignKey: 'vehicle_id',
      as: 'local_rental_pricings',
    });

    Vehicle.hasMany(models.AirportPricing, {
      foreignKey: 'vehicle_id',
      as: 'airport_pricings',
    });

    Vehicle.hasMany(models.DhamPricing, {
      foreignKey: 'vehicle_id',
      as: 'dham_pricings',
    });

    Vehicle.hasMany(models.DiscountVehicle, {
      foreignKey: 'vehicle_id',
      as: 'discount_vehicles',
    });
  };

  return Vehicle;
};


