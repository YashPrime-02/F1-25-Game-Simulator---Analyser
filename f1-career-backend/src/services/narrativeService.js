// src/services/narrativeService.js

exports.detectRivalry = (standings) => {
  if (standings.length < 2) return null;

  const gap = standings[0].totalPoints - standings[1].totalPoints;

  if (gap <= 10) {
    return {
      intense: true,
      message: 'Championship fight is extremely tight.',
    };
  }

  if (gap <= 25) {
    return {
      intense: true,
      message: 'Title battle heating up.',
    };
  }

  return {
    intense: false,
    message: 'Leader building comfortable advantage.',
  };
};