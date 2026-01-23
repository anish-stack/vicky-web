module.exports = (sequelize, DataTypes) => {
    const dhamPackages = sequelize.define(
        'dhamPackages',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            dham_category_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            distance: {
                type: DataTypes.STRING,
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
            tableName: 'dham_packages',
        }
    );

    dhamPackages.associate = (models) => {
        dhamPackages.hasMany(models.DhamPackageRoute, {
            foreignKey: 'dham_package_id',
            as: 'dham_package_routes',
        });

        dhamPackages.hasMany(models.DhamPickupCity, {
            foreignKey: 'dham_package_id',
            as: 'dham_pickup_cities',
        });

        dhamPackages.belongsTo(models.DhamCategory, {
            foreignKey: 'dham_category_id',
            as: 'dham_categories',
        });
    };

    return dhamPackages;
};