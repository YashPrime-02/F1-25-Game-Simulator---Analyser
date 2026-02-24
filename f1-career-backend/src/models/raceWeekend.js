// src/models/raceWeekend.js

module.exports = (sequelize, DataTypes) => {
  const RaceWeekend = sequelize.define(
    'RaceWeekend',
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
      roundNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      weather: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'dry',
      },
      safetyCar: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      redFlag: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'race_weekends',
      timestamps: true,
    }
  );

  return RaceWeekend;
};