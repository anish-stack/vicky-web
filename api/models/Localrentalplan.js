module.exports = (sequelize, DataTypes) => {
    const localrentalplans = sequelize.define(
        'localrentalplans',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            hours: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            km: {
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
            tableName: 'localrentalplans',
        }
    );

    localrentalplans.associate = (models) => {
        localrentalplans.hasMany(models.LocalRentalPricing, {
          foreignKey: 'local_rental_plan_id',
          as: 'local_rental_pricings',
        });
      };
    return localrentalplans;
};


