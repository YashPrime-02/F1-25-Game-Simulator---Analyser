// src/models/seasonCalendar.js

module.exports = (sequelize, DataTypes) => {
  const SeasonCalendar = sequelize.define(
    'SeasonCalendar',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      seasonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roundNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'season_calendars',
      timestamps: false,
    }
  );

  return SeasonCalendar;
};