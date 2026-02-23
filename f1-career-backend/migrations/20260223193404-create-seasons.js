'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seasons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      careerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'careers',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      seasonNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      raceCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'completed'),
        allowNull: false,
        defaultValue: 'active',
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

    await queryInterface.addConstraint('seasons', {
      fields: ['careerId', 'seasonNumber'],
      type: 'unique',
      name: 'unique_season_per_career',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('seasons', 'unique_season_per_career');
    await queryInterface.dropTable('seasons');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_seasons_status";');
  },
};