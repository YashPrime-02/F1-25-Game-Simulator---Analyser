const express = require('express');
const router = express.Router();
const path = require('path');

const raceNewsEngine = require('../services/simulation/raceNewsEngine.js');

router.get('/', async (req, res) => {
  try {
    const news = await raceNewsEngine.generateNews(); // adjust if needed
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate news' });
  }
});

module.exports = router;