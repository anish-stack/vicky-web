// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const OneWayTripPricing = sequelize.define(
//   'OneWayTripPricing',
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     vehicle_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     from: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     to: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     price_per_km: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },
//     createdBy: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     updatedBy: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//   },
//   {
//     timestamps: true,
//     tableName: 'one_way_trip_pricings',
//   }
// );

// // OneWayTripPricing.belongsTo(Vehicle, { 
// //   foreignKey: 'vehicle_id', 
// //   as: 'vehicles' 
// // });

// module.exports = OneWayTripPricing;

module.exports = (sequelize, DataTypes) => {
  const OneWayTripPricing = sequelize.define(
    'OneWayTripPricing',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      from: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      to: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price_per_km: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
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
      tableName: 'one_way_trip_pricings',
    }
  );

  OneWayTripPricing.associate = (models) => {
    OneWayTripPricing.belongsTo(models.Vehicle, {
      foreignKey: 'vehicle_id',
      as: 'vehicles',
    });
  };

  return OneWayTripPricing;
};

