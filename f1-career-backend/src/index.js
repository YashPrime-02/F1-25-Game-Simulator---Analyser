// src/index.js
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const seasonRoutes = require('./routes/seasons');
const raceRoutes = require('./routes/races');
const playerCareerRoutes = require("./routes/playerCareerRoutes");
const teamRoutes = require("./routes/teams");
const driverRoutes = require("./routes/drivers");

// 🔎 DEBUG: check which models file is actually loaded
const models = require('./models');
console.log('LOADED MODELS PATH:', require.resolve('./models'));
console.log('MODELS KEYS:', Object.keys(models));

const { sequelize } = models;

const authRoutes = require('./routes/auth');
const careerRoutes = require('./routes/careers');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/races', raceRoutes);
app.use("/api/player-career", playerCareerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/standings",require("./routes/standingRoutes"));
app.use("/api/season", require("./routes/seasons"));

// Health check
app.get('/health', (req, res) =>
  res.json({ ok: true, time: new Date() })
);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    console.log("DB URL:", process.env.DATABASE_URL);
    await sequelize.query("SELECT current_user").then(r => {
  console.log("DB USER:", r[0][0].current_user);
});
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();