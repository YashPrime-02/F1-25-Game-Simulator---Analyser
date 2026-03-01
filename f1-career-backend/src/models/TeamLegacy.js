module.exports = (sequelize, DataTypes) => {
  const TeamLegacy = sequelize.define("TeamLegacy", {
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seasons: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    constructorTitles: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return TeamLegacy;
};