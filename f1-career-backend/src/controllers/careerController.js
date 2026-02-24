// src/controllers/careerController.js

const { Career } = require('../models');

exports.createCareer = async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' });
  }

  if (!['solo', 'myteam'].includes(type)) {
    return res.status(400).json({ message: 'Invalid career type' });
  }

  const career = await Career.create({
    userId: req.user.id,
    name,
    type,
  });

  res.status(201).json(career);
};

exports.getMyCareers = async (req, res) => {
  const careers = await Career.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.json(careers);
};