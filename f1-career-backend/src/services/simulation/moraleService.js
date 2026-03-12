exports.updateMoraleAfterRace = async (results, Driver) => {
  for (const r of results) {
    const driver = await Driver.findByPk(r.driverId);
    if (!driver) continue;

    let change = 0;

    if (r.position === 1) change = 5;
    else if (r.position <= 3) change = 3;
    else if (r.dnf) change = -5;
    else if (r.position > 15) change = -3;

    driver.morale = Math.max(0, Math.min(100, driver.morale + change));
    await driver.save();
  }
};