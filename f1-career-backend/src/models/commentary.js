module.exports = (sequelize, DataTypes) => {
  const Commentary = sequelize.define(
    "Commentary",
    {
      seasonId: DataTypes.INTEGER,
      round: DataTypes.INTEGER,
      commentator: DataTypes.STRING,
      text: DataTypes.TEXT,
    },
    {
      tableName: "Commentaries", // important
    }
  );

  return Commentary;
};