// src/models/team.js

module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    'Team',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      shortCode: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'teams',
      timestamps: true,
    }
  );

  return Team;
};