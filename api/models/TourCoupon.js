module.exports = (sequelize, DataTypes) => {
  const TourCoupon = sequelize.define(
    "TourCoupon",
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      title: { type: DataTypes.STRING(150), allowNull: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
      discount_type: { type: DataTypes.ENUM("percent", "flat"), allowNull: false, defaultValue: "percent" },
      discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      // cap for percent coupons (null = no cap)
      max_discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      // minimum trip total (before discount) needed to use the coupon
      min_order_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      // JSON array of tour package ids; null / [] = every tour
      tour_package_ids: { type: DataTypes.JSON, allowNull: true },
      start_date: { type: DataTypes.DATEONLY, allowNull: true },
      end_date: { type: DataTypes.DATEONLY, allowNull: true },
      // total uses allowed (null / 0 = unlimited)
      usage_limit: { type: DataTypes.INTEGER, allowNull: true },
      // uses allowed per mobile number (0 = unlimited)
      per_mobile_limit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      // public coupons are listed on the summary page; private ones work only when typed
      is_public: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: "tour_package_coupons",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [{ unique: true, fields: ["code"] }, { fields: ["is_active"] }],
    }
  );
  return TourCoupon;
};
