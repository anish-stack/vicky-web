module.exports = (sequelize, DataTypes) => {
    const DhamStop = sequelize.define(
        'DhamStop',
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
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
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
            tableName: 'dham_stops',
        }
    );

    DhamStop.associate = (models) => {
        DhamStop.belongsTo(models.DhamPickupCity, {
            foreignKey: 'dham_pickup_city_id',
            as: 'dham_pickup_cities',
        });
    };

    return DhamStop;
};

