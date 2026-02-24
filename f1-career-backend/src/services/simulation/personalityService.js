// src/services/simulation/personalityService.js

const personalities = {
  aggressive: {
    style: 'aggressive, sharp, unapologetic',
    mediaTone: 'confident and confrontational',
  },
  calm: {
    style: 'calm, composed, analytical',
    mediaTone: 'measured and respectful',
  },
  political: {
    style: 'strategic, guarded, media-trained',
    mediaTone: 'careful and diplomatic',
  },
  emotional: {
    style: 'passionate and expressive',
    mediaTone: 'intense and reactive',
  },
};

exports.getDriverPersonality = (driverId) => {
  // Example: hardcoded for now
  if (driverId % 4 === 0) return personalities.aggressive;
  if (driverId % 3 === 0) return personalities.political;
  if (driverId % 2 === 0) return personalities.emotional;
  return personalities.calm;
};