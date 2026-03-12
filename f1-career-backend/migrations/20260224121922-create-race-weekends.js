'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('race_weekends', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      seasonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE',
      },
      roundNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      weather: Sequelize.STRING,
      safetyCar: Sequelize.BOOLEAN,
      redFlag: Sequelize.BOOLEAN,
      notes: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('race_weekends');
  },
};