// Default master for NEW tour packages (Admin > Tours > Default master).
// One row per default line:
//   highlight       -> icon, title, content (description)
//   inclusion       -> title
//   exclusion       -> title
//   important_note  -> title
//   faq             -> title (question), content (answer)
module.exports = (sequelize, DataTypes) => {
  const TourDefault = sequelize.define(
    "TourDefault",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("highlight", "inclusion", "exclusion", "important_note", "faq"),
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "tour_package_defaults",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      underscored: true,
      indexes: [{ fields: ["type", "sort_order"] }],
    }
  );

  return TourDefault;
};
