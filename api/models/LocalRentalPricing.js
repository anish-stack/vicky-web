module.exports = (sequelize, DataTypes) => {
    const LocalRentalPricing = sequelize.define(
        'LocalRentalPricing',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            local_rental_plan_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            city_id: {
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
            tableName: 'local_rental_pricings',
        }
    );

    LocalRentalPricing.associate = (models) => {
        LocalRentalPricing.belongsTo(models.localrentalplans, {
            foreignKey: 'local_rental_plan_id',
            as: 'localrentalplans',
        });

        LocalRentalPricing.belongsTo(models.Vehicle, {
            foreignKey: 'vehicle_id',
            as: 'vehicles',
        });
    };

    return LocalRentalPricing;
};

