module.exports = (sequelize, DataTypes) => {
    const DhamCategory = sequelize.define(
        'DhamCategory',
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
            tableName: 'dham_categories',
        }
    );

    DhamCategory.associate = (models) => {
        DhamCategory.hasMany(models.dhamPackages, {
            foreignKey: 'dham_category_id',
            as: 'dham_categories',
        });
    };

    return DhamCategory;
};