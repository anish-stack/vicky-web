module.exports = (sequelize, DataTypes) => {
    const DhamPackageRoute = sequelize.define(
        'DhamPackageRoute',
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
            place_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            place_id: {
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
            tableName: 'dham_package_routes',
        }
    );

    DhamPackageRoute.associate = (models) => {
        DhamPackageRoute.belongsTo(models.dhamPackages, {
            foreignKey: 'dham_package_id',
            as: 'dham_packages',
        });
    };

    return DhamPackageRoute;
};

