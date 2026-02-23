'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('season_calendars', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      seasonId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'seasons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      trackId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tracks',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      roundNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Prevent duplicate rounds in same season
    await queryInterface.addConstraint('season_calendars', {
      fields: ['seasonId', 'roundNumber'],
      type: 'unique',
      name: 'unique_round_per_season',
    });

    // Prevent same track appearing twice in same season
    await queryInterface.addConstraint('season_calendars', {
      fields: ['seasonId', 'trackId'],
      type: 'unique',
      name: 'unique_track_per_season',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('season_calendars', 'unique_round_per_season');
    await queryInterface.removeConstraint('season_calendars', 'unique_track_per_season');
    await queryInterface.dropTable('season_calendars');
  },
};