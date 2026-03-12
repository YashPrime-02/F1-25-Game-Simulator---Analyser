// src/services/simulation/controversyService.js

exports.detectControversy = (results) => {
  const winner = results.find(r => r.position === 1);
  const teammate = results.find(
    r => r.position === 2 && r.Driver.teamId === winner.Driver.teamId
  );

  if (teammate) {
    return {
      triggered: true,
      type: 'team_orders',
      message: 'Possible team orders controversy emerging.',
    };
  }

  const dnfs = results.filter(r => r.dnf);
  if (dnfs.length >= 5) {
    return {
      triggered: true,
      type: 'chaotic_race',
      message: 'Race marred by multiple retirements.',
    };
  }

  return { triggered: false };
};