'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      payment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      original_amount: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paid_amount: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      card: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      upi: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      bank: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wallet: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      error_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      error_reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      acquirer_data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      all_details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      places: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      departure_date: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      return_date: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      distance: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trip_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  },
};
