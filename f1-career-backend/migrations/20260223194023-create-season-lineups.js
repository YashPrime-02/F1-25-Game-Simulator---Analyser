'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('season_lineups', {
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
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      driverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id',
        },
        onDelete: 'CASCADE',
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

    await queryInterface.addConstraint('season_lineups', {
      fields: ['seasonId', 'driverId'],
      type: 'unique',
      name: 'unique_driver_per_season',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('season_lineups', 'unique_driver_per_season');
    await queryInterface.dropTable('season_lineups');
  },
};