module.exports = (sequelize, DataTypes) => {
  const otp = sequelize.define(
    "otp",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trip_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otp_type: {
        type: DataTypes.ENUM("start_trip", "end_trip", "login"),
        allowNull: false,
        defaultValue: "login",
      },
      expires_at: {
        type: DataTypes.DATE,
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
      tableName: "otp",
    }
  );

  otp.associate = (models) => {
    otp.belongsTo(models.Trip, {
      foreignKey: "trip_id",
      targetKey: "id",
    });
  };

  return otp;
};
