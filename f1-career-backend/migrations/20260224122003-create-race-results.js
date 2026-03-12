'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('race_results', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      raceWeekendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'race_weekends', key: 'id' },
        onDelete: 'CASCADE',
      },
      driverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'drivers', key: 'id' },
        onDelete: 'CASCADE',
      },
      position: Sequelize.INTEGER,
      fastestLap: Sequelize.BOOLEAN,
      dnf: Sequelize.BOOLEAN,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('race_results');
  },
};