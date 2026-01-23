module.exports = (sequelize, DataTypes) => {
    const DhamPickupCity = sequelize.define(
        'DhamPickupCity',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            dham_package_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            days: {
                type: DataTypes.INTEGER,
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
            tableName: 'dham_pickup_cities',
        }
    );

    DhamPickupCity.associate = (models) => {
        DhamPickupCity.belongsTo(models.dhamPackages, {
            foreignKey: 'dham_package_id',
            as: 'dham_packages',
        });
    };

    DhamPickupCity.associate = (models) => {
        DhamPickupCity.hasMany(models.DhamStop, {
            foreignKey: 'dham_pickup_city_id',
            as: 'dham_stops',
        });
        DhamPickupCity.hasMany(models.DhamPricing, {
            foreignKey: 'dham_pickup_city_id',
            as: 'dham_pricings',
        });
    };

    return DhamPickupCity;
};

