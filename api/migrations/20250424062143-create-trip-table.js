"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("trips", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      places: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      departure_date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      return_date: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      distance: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trip_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      trip_status: {
        type: Sequelize.ENUM("active", "reserved", "completed", "cancel"),
        allowNull: false,
        defaultValue: "reserved",
      },

      vehicle_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Vehicles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },

      pickup_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      extra_km: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      toll_tax: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      parking_charges: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      driver_charges: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      night_charges: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      fuel_charges: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      local_rental_plan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      airport_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      airport_city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      airport_from_to: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      car_tab: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dham_package_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dham_pickup_city_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dham_package_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dham_pickup_city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dham_package_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      dham_category_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dham_category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("trips");
  },
};
