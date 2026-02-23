// src/models/index.js
const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required in .env');
  process.exit(1);
}

const sequelize = new Sequelize(DATABASE_URL, {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {},
});

// import models
const User = require('./user')(sequelize);

module.exports = {
  sequelize,
  Sequelize,
  User,
};