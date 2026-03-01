"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("team_legacy", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "teams", // ✅ existing table
          key: "id",
        },
        onDelete: "CASCADE",
      },

      seasons: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      constructorTitles: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      wins: {
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

    await queryInterface.addIndex("team_legacy", ["teamId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("team_legacy");
  },
};