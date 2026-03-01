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

// ==========================
// MODEL IMPORTS
// ==========================

const User = require('./user')(sequelize, DataTypes);
const Career = require('./career')(sequelize, DataTypes);
const Season = require('./season')(sequelize, DataTypes);
const SeasonCalendar = require('./seasonCalendar')(sequelize, DataTypes);
const RaceWeekend = require('./raceWeekend')(sequelize, DataTypes);
const RaceResult = require('./raceResult')(sequelize, DataTypes);
const Driver = require('./driver')(sequelize, DataTypes);
const Team = require('./team')(sequelize, DataTypes);
const SeasonMemory = require('./seasonMemory')(sequelize, DataTypes);
const NewsFeed = require('./newsFeed')(sequelize, DataTypes); 
const Commentary = require("./commentary")(sequelize, DataTypes);
const DriverLegacy = require("./DriverLegacy")(sequelize, DataTypes);
const TeamLegacy = require("./TeamLegacy")(sequelize, DataTypes);


// ==========================
// ASSOCIATIONS
// ==========================

// Career ↔ Season
Career.hasMany(Season, { foreignKey: 'careerId' });
Season.belongsTo(Career, { foreignKey: 'careerId' });

// Season ↔ SeasonCalendar
Season.hasMany(SeasonCalendar, { foreignKey: 'seasonId' });
SeasonCalendar.belongsTo(Season, { foreignKey: 'seasonId' });

// Season ↔ RaceWeekend
Season.hasMany(RaceWeekend, { foreignKey: 'seasonId' });
RaceWeekend.belongsTo(Season, { foreignKey: 'seasonId' });

// RaceWeekend ↔ RaceResult
RaceWeekend.hasMany(RaceResult, { foreignKey: 'raceWeekendId' });
RaceResult.belongsTo(RaceWeekend, { foreignKey: 'raceWeekendId' });

// Driver ↔ RaceResult
Driver.hasMany(RaceResult, { foreignKey: 'driverId' });
RaceResult.belongsTo(Driver, { foreignKey: 'driverId' });

// Team ↔ Driver
Team.hasMany(Driver, { foreignKey: 'teamId' });
Driver.belongsTo(Team, { foreignKey: 'teamId' });

// Season ↔ SeasonMemory  ✅ ADDED
Season.hasMany(SeasonMemory, { foreignKey: 'seasonId' });
SeasonMemory.belongsTo(Season, { foreignKey: 'seasonId' });

// Season ↔ NewsFeed  ✅ ADDED
Season.hasMany(NewsFeed, { foreignKey: 'seasonId' });
NewsFeed.belongsTo(Season, { foreignKey: 'seasonId' });

// Season ↔ Commentary  ✅ ADDED
Season.hasMany(Commentary, { foreignKey: 'seasonId' });
Commentary.belongsTo(Season, { foreignKey: 'seasonId' });

// Season ↔ TeamLegacy  ✅ ADDED
Season.hasMany(TeamLegacy, { foreignKey: 'seasonId' });
TeamLegacy.belongsTo(Season, { foreignKey: 'seasonId' });

// Season ↔ DriverLegacy  ✅ ADDED
// Season.hasMany(DriverLegacy, { foreignKey: 'seasonId' });
// DriverLegacy.belongsTo(Season, { foreignKey: 'seasonId' });



// ==========================
// DEBUG (DEV ONLY)
// ==========================

if (process.env.NODE_ENV === 'development') {
  console.log(
    'Models loaded:',
    Object.keys({
      User,
      Career,
      Season,
      SeasonCalendar,
      RaceWeekend,
      RaceResult,
      Driver,
      Team,
      SeasonMemory,
      NewsFeed, 
      Commentary,
      DriverLegacy,
      TeamLegacy,
    })
  );
}

// ==========================
// EXPORT
// ==========================

module.exports = {
  sequelize,
  Sequelize,
  User,
  Career,
  Season,
  SeasonCalendar,
  RaceWeekend,
  RaceResult,
  Driver,
  Team,
  SeasonMemory,
  NewsFeed,
  Commentary, 
  DriverLegacy,
  TeamLegacy,
};