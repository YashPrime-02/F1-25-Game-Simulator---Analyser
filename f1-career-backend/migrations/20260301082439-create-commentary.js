"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Commentaries", {
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
          model: "seasons",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      round: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      commentator: {
        type: Sequelize.STRING,
      },

      text: {
        type: Sequelize.TEXT,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Commentaries");
  },
};