// src/models/index.js

const { Sequelize, DataTypes } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required in .env');
  process.exit(1);
}

const sequelize = new Sequelize(DATABASE_URL, {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// 🔥 Import models
const User = require('./user')(sequelize, DataTypes);
const Career = require('./career')(sequelize, DataTypes);
const Season = require('./season')(sequelize, DataTypes);
const SeasonCalendar = require('./seasonCalendar')(sequelize, DataTypes);

// Optional: confirm registration during dev
console.log(
  'Models loaded:',
  Object.keys({ User, Career, Season, SeasonCalendar })
);

module.exports = {
  sequelize,
  Sequelize,
  User,
  Career,
  Season,
  SeasonCalendar,
};