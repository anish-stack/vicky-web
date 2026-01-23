module.exports = (sequelize, DataTypes) => {
    const advancePayments = sequelize.define(
        'advancePayments',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            percentage: {
                type: DataTypes.FLOAT,
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
            tableName: 'advance_payments',
        }
    );

    return advancePayments;
};