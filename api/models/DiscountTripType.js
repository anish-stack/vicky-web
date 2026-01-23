module.exports = (sequelize, DataTypes) => {
    const DiscountTripType = sequelize.define(
        'DiscountTripType',
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
            tableName: 'discount_trip_types',
        }
    );

    // DiscountTripType.associate = (models) => {
    //     DiscountTripType.belongsTo(models.DiscountCity, {
    //         foreignKey: 'discount_city_id',
    //         as: 'discount_cities',
    //     });
    // };

    // DiscountTripType.associate = (models) => {
    //     DiscountTripType.hasMany(models.DiscountVehicle, {
    //         foreignKey: 'discount_trip_id',
    //         as: 'discount_vehicles',
    //     });
    // };

    // DiscountTripType.associate = (models) => {
    //     DiscountTripType.belongsTo(models.DiscountCity, {
    //         foreignKey: 'discount_city_id',
    //         as: 'discount_cities',
    //     });

    //     DiscountTripType.hasMany(models.DiscountVehicle, {
    //         foreignKey: 'discount_trip_id',
    //         as: 'discount_vehicles',
    //     });
    // };




    return DiscountTripType;
};

