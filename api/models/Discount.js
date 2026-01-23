module.exports = (sequelize, DataTypes) => {
    const Discount = sequelize.define(
        'Discount',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            overall_discount: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            apply_overall_discount: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            apply_citywise_discount: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
            tableName: 'discounts',
        }
    );

    Discount.associate = (models) => {
        Discount.hasMany(models.DiscountCity, {
            foreignKey: 'discount_id',
            as: 'discount_cities',
        });
    };

    return Discount;
};

