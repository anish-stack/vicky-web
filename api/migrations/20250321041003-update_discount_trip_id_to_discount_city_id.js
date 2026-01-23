'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('discount_vehicles', 'discount_trip_id');

    await queryInterface.addColumn('discount_vehicles', 'discount_city_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'discount_cities',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('discount_vehicles', 'trip_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE discount_vehicles MODIFY COLUMN discount_city_id INT NOT NULL AFTER id;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE discount_vehicles MODIFY COLUMN trip_type VARCHAR(255) NULL AFTER discount_city_id;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('discount_vehicles', 'discount_city_id');
    await queryInterface.removeColumn('discount_vehicles', 'trip_type');

    await queryInterface.addColumn('discount_vehicles', 'discount_trip_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'discount_trip_types',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  }
};
