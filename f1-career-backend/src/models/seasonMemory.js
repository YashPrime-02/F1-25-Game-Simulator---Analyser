module.exports = (sequelize, DataTypes) => {
  const SeasonMemory = sequelize.define(
    'SeasonMemory',
    {
      seasonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roundNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'season_memories',   
      timestamps: true,
      underscored: false,
    }
  );

  return SeasonMemory;
};