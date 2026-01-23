module.exports = (sequelize, DataTypes) => {
    const DiscountVehicle = sequelize.define(
        'DiscountVehicle',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            discount_city_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            trip_type: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            vehicle_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            discount: {
                type: DataTypes.FLOAT,
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
            tableName: 'discount_vehicles',
        }
    );

    DiscountVehicle.associate = (models) => {
        DiscountVehicle.belongsTo(models.DiscountCity, {
            foreignKey: 'discount_city_id',
            as: 'discount_cities',
        });

        DiscountVehicle.belongsTo(models.Vehicle, {
            foreignKey: 'vehicle_id',
            as: 'vehicles',
        });
    };

    return DiscountVehicle;
};

