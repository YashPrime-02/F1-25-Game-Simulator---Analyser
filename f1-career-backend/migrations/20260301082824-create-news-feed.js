"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("news_feed", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      seasonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "seasons", // ✅ lowercase
          key: "id",
        },
        onDelete: "CASCADE",
      },

      roundNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      headline: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("news_feed");
  },
};