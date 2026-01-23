module.exports = (sequelize, DataTypes) => {
    const airports = sequelize.define(
        'airports',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
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
            tableName: 'airports',
        }
    );

    airports.associate = (models) => {
        airports.hasMany(models.AirportPricing, {
            foreignKey: 'airport_id',
            as: 'airport_pricings',
        });
       
        airports.hasMany(models.Trip, {
					foreignKey: "airport_id",
					as: "trips", 
				});
				
    };

    return airports;
};