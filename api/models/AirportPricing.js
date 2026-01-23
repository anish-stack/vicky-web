module.exports = (sequelize, DataTypes) => {
    const AirportPricing = sequelize.define(
        'AirportPricing',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            airport_id: {
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
            tableName: 'airport_pricings',
        }
    );

    AirportPricing.associate = (models) => {
        AirportPricing.belongsTo(models.airports, {
            foreignKey: 'airport_id',
            as: 'airports',
        });
    };

    return AirportPricing;
};

