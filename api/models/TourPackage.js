module.exports = (sequelize, DataTypes) => {
  const TourPackage = sequelize.define(
    "TourPackage",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      from_city_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      to_city_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      from_city_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },

      cover_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      gallery: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      days: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      nights: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      duration_label: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      trip_type: {
        type: DataTypes.ENUM("roundTrip", "oneWay"),
        allowNull: false,
        defaultValue: "roundTrip",
      },

      short_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
      },

      description: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        defaultValue: "",
      },

      highlights: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      hotel_optional: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      itinerary: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      places_covered: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      inclusions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      exclusions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      important_notes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      faqs: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      vehicle_options: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      hotel_options: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },

      booking_charge_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10,
      },

      rating: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 4.8,
      },

      review_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      is_featured: {
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

      // live = visible, new = visible with "New" badge, duplicate = draft copy (hidden until finalised)
      status: {
        type: DataTypes.ENUM("live", "new", "duplicate"),
        allowNull: false,
        defaultValue: "live",
      },

      // max bookings accepted per pickup date (0 = unlimited)
      daily_booking_limit: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      // minimum hours between "now" and pickup (0 = no restriction)
      min_advance_hours: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      seo: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },

      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },

      updated_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      tableName: "tour_packages",

      timestamps: true,

      createdAt: "created_at",
      updatedAt: "updated_at",

      underscored: true,

      indexes: [
        {
          unique: true,
          fields: ["slug"],
        },
        {
          fields: ["from_city_id"],
        },
        {
          fields: ["is_featured"],
        },
        {
          fields: ["is_active"],
        },
        {
          fields: ["sort_order"],
        },
        {
          fields: ["status"],
        },
      ],

      hooks: {
        beforeValidate: (tourPackage) => {
          if (
            !tourPackage.duration_label &&
            tourPackage.days != null &&
            tourPackage.nights != null
          ) {
            tourPackage.duration_label =
              `${tourPackage.days} Days / ${tourPackage.nights} Night Tour`;
          }
        },
      },
    }
  );

  /*
   * MongoDB startingPrice virtual equivalent.
   *
   * vehicle_options structure:
   * [
   *   {
   *     vehicle: 1,
   *     label: "Sedan",
   *     image: "/uploads/vehicles/dzire.webp",
   *     price: 11999,
   *     isActive: true
   *   }
   * ]
   */
  Object.defineProperty(TourPackage.prototype, "startingPrice", {
    get() {
      const options = Array.isArray(this.vehicle_options)
        ? this.vehicle_options
        : [];

      const active = options.filter(
        (item) => item && item.isActive !== false
      );

      if (!active.length) {
        return 0;
      }

      const prices = active
        .map((item) => Number(item.price))
        .filter((price) => Number.isFinite(price));

      return prices.length ? Math.min(...prices) : 0;
    },
  });

  return TourPackage;
};