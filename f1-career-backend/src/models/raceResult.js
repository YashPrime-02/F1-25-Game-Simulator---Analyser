// src/models/raceResult.js

module.exports = (sequelize, DataTypes) => {
  const RaceResult = sequelize.define(
    'RaceResult',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      raceWeekendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fastestLap: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      dnf: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // ✅ NEW FIELD
      incident: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: 'race_results',
      timestamps: false,
    }
  );

  return RaceResult;
};