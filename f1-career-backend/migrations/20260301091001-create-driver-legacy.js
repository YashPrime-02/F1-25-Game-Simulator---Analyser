"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("driver_legacy", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      driverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "drivers", // ✅ existing table
          key: "id",
        },
        onDelete: "CASCADE",
      },

      seasons: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      championships: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      wins: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      podiums: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      totalPoints: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // optional performance index
    await queryInterface.addIndex("driver_legacy", ["driverId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("driver_legacy");
  },
};