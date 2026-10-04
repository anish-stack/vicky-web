module.exports = (sequelize, DataTypes) => {
  const TourPackageBooking = sequelize.define(
    "TourPackageBooking",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_ref: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      tour_package_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      tour_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tour_slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      pickup_address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      pickup_lat: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      pickup_lng: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
      },
      pickup_place_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pickup_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      pickup_time: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      return_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      return_time: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      adults: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      children: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      luggage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      vehicle_label: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      vehicle_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      hotel_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      hotel_nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      hotel_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      booking_charge_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10,
      },
      advance_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      coupon_code: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      // already deducted from total_amount
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      balance_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      razorpay_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      razorpay_payment_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      razorpay_signature: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "partial", "paid", "failed", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },
      driver_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      driver_mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      vehicle_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      assigned_vehicle_label: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      booking_status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "tour_package_bookings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [
        { unique: true, fields: ["booking_ref"] },
        { fields: ["tour_package_id"] },
        { fields: ["mobile"] },
        { fields: ["user_id"] },
        { fields: ["payment_status"] },
        { fields: ["booking_status"] },
        { fields: ["razorpay_order_id"] },
        { fields: ["coupon_code"] },
      ],
    }
  );

  TourPackageBooking.associate = (models) => {
    if (models.TourPackage) {
      TourPackageBooking.belongsTo(models.TourPackage, {
        foreignKey: "tour_package_id",
        targetKey: "id",
        as: "tourPackage",
      });
    }
    if (models.User) {
      TourPackageBooking.belongsTo(models.User, {
        foreignKey: "user_id",
        targetKey: "id",
        as: "user",
      });
    }
  };

  return TourPackageBooking;
};