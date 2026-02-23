// src/index.js
require('dotenv').config();
require('express-async-errors'); // to allow throwing errors in async handlers
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true, time: new Date() }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    // For day 1: sync models. In production use migrations later.
    // await sequelize.sync({ alter: true }); 
    // console.log('✅ Models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();