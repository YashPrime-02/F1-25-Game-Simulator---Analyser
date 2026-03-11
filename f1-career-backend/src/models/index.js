// src/models/index.js

const { Sequelize, DataTypes } = require("sequelize");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required in .env");
  process.exit(1);
}

/* =========================================================
   SEQUELIZE INSTANCE
========================================================= */

const sequelize = new Sequelize(DATABASE_URL, {
  logging:
    process.env.NODE_ENV === "development"
      ? (msg) => {
          if (!msg.includes("SELECT 1+1")) console.log(msg);
        }
      : false,

  pool: {
    max: 20,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },

  define: {
    freezeTableName: true,
    timestamps: true,
  },
});

/* =========================================================
   MODEL IMPORTS
========================================================= */

const User = require("./user")(sequelize, DataTypes);
const Career = require("./career")(sequelize, DataTypes);
const Season = require("./season")(sequelize, DataTypes);
const SeasonCalendar = require("./seasonCalendar")(sequelize, DataTypes);
const RaceWeekend = require("./raceWeekend")(sequelize, DataTypes);
const RaceResult = require("./raceResult")(sequelize, DataTypes);
const Driver = require("./driver")(sequelize, DataTypes);
const Team = require("./team")(sequelize, DataTypes);
const SeasonMemory = require("./seasonMemory")(sequelize, DataTypes);
const NewsFeed = require("./newsFeed")(sequelize, DataTypes);
const PlayerCareer = require("./playerCareer")(sequelize, DataTypes);
const DriverLegacy = require("./DriverLegacy")(sequelize, DataTypes);
const TeamLegacy = require("./TeamLegacy")(sequelize, DataTypes);

/* =========================================================
   MODEL REGISTRY
========================================================= */

const db = {
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
  PlayerCareer,
  DriverLegacy,
  TeamLegacy,
};

/* =========================================================
   ASSOCIATIONS
========================================================= */

/* Career ↔ Season */
Career.hasMany(Season, { foreignKey: "careerId" });
Season.belongsTo(Career, { foreignKey: "careerId" });

/* Season ↔ Calendar */
Season.hasMany(SeasonCalendar, { foreignKey: "seasonId" });
SeasonCalendar.belongsTo(Season, { foreignKey: "seasonId" });

/* Season ↔ RaceWeekend */
Season.hasMany(RaceWeekend, { foreignKey: "seasonId" });
RaceWeekend.belongsTo(Season, { foreignKey: "seasonId" });

/* RaceWeekend ↔ RaceResult */
RaceWeekend.hasMany(RaceResult, { foreignKey: "raceWeekendId" });
RaceResult.belongsTo(RaceWeekend, { foreignKey: "raceWeekendId" });

/* Driver ↔ RaceResult */
Driver.hasMany(RaceResult, { foreignKey: "driverId" });
RaceResult.belongsTo(Driver, { foreignKey: "driverId" });

/* Team ↔ Driver */
Team.hasMany(Driver, { foreignKey: "teamId" });
Driver.belongsTo(Team, { foreignKey: "teamId" });

/* Season ↔ SeasonMemory */
Season.hasMany(SeasonMemory, { foreignKey: "seasonId" });
SeasonMemory.belongsTo(Season, { foreignKey: "seasonId" });

/* Season ↔ NewsFeed */
Season.hasMany(NewsFeed, { foreignKey: "seasonId" });
NewsFeed.belongsTo(Season, { foreignKey: "seasonId" });

/* =========================================================
   PLAYER CAREER RELATIONS
========================================================= */

PlayerCareer.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(PlayerCareer, {
  foreignKey: "userId",
});

PlayerCareer.belongsTo(Driver, {
  foreignKey: "driverId",
});

Driver.hasOne(PlayerCareer, {
  foreignKey: "driverId",
});

PlayerCareer.belongsTo(Team, {
  foreignKey: "teamId",
});

Team.hasMany(PlayerCareer, {
  foreignKey: "teamId",
});

PlayerCareer.belongsTo(Driver, {
  foreignKey: "replacedDriverId",
  as: "ReplacedDriver",
});

/* =========================================================
   DEBUG (DEV ONLY)
========================================================= */

if (process.env.NODE_ENV === "development") {
  console.log("Models loaded:", Object.keys(db));
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = db;