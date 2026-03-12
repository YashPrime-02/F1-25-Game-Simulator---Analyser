const { Driver, Team } = require("../models");

let driverCache = null;
let teamCache = null;

exports.loadCaches = async () => {

  const drivers = await Driver.findAll();

  const teams = await Team.findAll();

  driverCache = {};
  teamCache = {};

  drivers.forEach(d => driverCache[d.id] = d);

  teams.forEach(t => teamCache[t.id] = t);

};

exports.getDriverCache = () => driverCache;

exports.getTeamCache = () => teamCache;