// src/index.js

require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/auth");
const careerRoutes = require("./routes/careers");
const seasonRoutes = require("./routes/seasons");
const raceRoutes = require("./routes/races");
const playerCareerRoutes = require("./routes/playerCareerRoutes");
const teamRoutes = require("./routes/teams");
const driverRoutes = require("./routes/drivers");
const standingsRoutes = require("./routes/standingRoutes");
const newsRoutes = require("./routes/news");

/* =========================================================
   MODELS
========================================================= */

const models = require("./models");
const { sequelize } = models;

/* =========================================================
   EXPRESS APP
========================================================= */

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/seasons", seasonRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/player-career", playerCareerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/standings", standingsRoutes);
app.use("/api/news", newsRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    time: new Date(),
  });
});

/* =========================================================
   ERROR HANDLING
========================================================= */

const { errorHandler, notFound } = require("./middleware/errorHandler");

app.use(notFound);
app.use(errorHandler);

/* =========================================================
   SERVER START
========================================================= */

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();

    console.log("✅ Database connected");

    if (process.env.NODE_ENV === "development") {
      console.log("DB URL:", process.env.DATABASE_URL);

      const user = await sequelize.query("SELECT current_user");
      console.log("DB USER:", user[0][0].current_user);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await sequelize.close();
  process.exit(0);
});

start();