// src/models/driver.js

module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    "Driver",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      nationality: {
        type: DataTypes.STRING,
      },

      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      driverNumber: {
        type: DataTypes.INTEGER,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      morale: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        validate: {
          min: 0,
          max: 100,
        },
      },
    },
    {
      tableName: "drivers",
      timestamps: true,
    }
  );

  return Driver;
};