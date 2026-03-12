module.exports = (sequelize, DataTypes) => {
  const DriverLegacy = sequelize.define(
    "DriverLegacy",
    {
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      seasons: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      championships: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      wins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      podiums: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      totalPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "driver_legacy",  
      freezeTableName: true,      
      timestamps: true,
    }
  );

  return DriverLegacy;
};