module.exports = (sequelize, DataTypes) => {
    const DhamPricing = sequelize.define(
        'DhamPricing',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            dham_pickup_city_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            vehicle_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            price: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            discount:  {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
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
            tableName: 'dham_pricings',
        }
    );

    DhamPricing.associate = (models) => {
        DhamPricing.belongsTo(models.DhamPickupCity, {
            foreignKey: 'dham_pickup_city_id',
            as: 'dham_pickup_cities',
        });

        DhamPricing.belongsTo(models.Vehicle, {
            foreignKey: 'vehicle_id',
            as: 'vehicles',
        });
    };

    return DhamPricing;
};

