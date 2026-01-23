'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('one_way_trip_pricings', 'vehicle_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Vehicles', // Name of the Vehicle table
                key: 'id', // Primary key in the Vehicle table
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },
    down: async (queryInterface, Sequelize) => {
        // Optionally, you can define how to revert the column to its original state
        await queryInterface.changeColumn('one_way_trip_pricings', 'vehicle_id', {
            type: Sequelize.INTEGER,
            allowNull: true, // Revert the `allowNull` to its original state if needed
        });
    },
};
