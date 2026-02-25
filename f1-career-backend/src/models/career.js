module.exports = (sequelize, DataTypes) => {
  const Career = sequelize.define(
    "Career",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM("solo", "myteam"),
        allowNull: false,
      },
    },
    {
      tableName: "careers",
      timestamps: true,
    }
  );

  return Career;
};