// src/models/season.js

module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define(
    'Season',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      careerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seasonNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      calendarLength: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'seasons',
      timestamps: true,
    }
  );

  return Season;
};