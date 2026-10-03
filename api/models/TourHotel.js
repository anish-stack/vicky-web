module.exports = (sequelize, DataTypes) => {
  const TourHotel = sequelize.define(
    "TourHotel",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
      // default price per room / night (a tour can override it)
      price_per_night: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      // pre-added to every NEW tour package
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "tour_hotels",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [{ fields: ["is_active"] }, { fields: ["is_default"] }],
    }
  );

  return TourHotel;
};
