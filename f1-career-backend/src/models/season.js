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
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      raceCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'seasons',
      timestamps: true,
    }
  );

  return Season;
};