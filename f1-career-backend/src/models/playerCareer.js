module.exports = (sequelize, DataTypes) => {
  const PlayerCareer = sequelize.define(
    "PlayerCareer",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      driverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      replacedDriverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      careerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      isCustomDriver: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      reputation: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
    },
    {
      tableName: "player_careers", // ✅ IMPORTANT FIX
      freezeTableName: true,       // ✅ stop pluralization
      underscored: true,           // ✅ snake_case columns
      timestamps: true,
    }
  );

  return PlayerCareer;
};