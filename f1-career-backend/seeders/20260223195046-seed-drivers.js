'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const teams = await queryInterface.sequelize.query(
      `SELECT id, name FROM teams;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const getTeamId = (teamName) =>
      teams.find((t) => t.name === teamName)?.id;

    const now = new Date();

    await queryInterface.bulkInsert('drivers', [

      // Red Bull
      { firstName: 'Max', lastName: 'Verstappen', nationality: 'Netherlands', teamId: getTeamId('Red Bull Racing'), driverNumber: 1, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Yuki', lastName: 'Tsunoda', nationality: 'Japan', teamId: getTeamId('Red Bull Racing'), driverNumber: 22, isActive: true, createdAt: now, updatedAt: now },

      // Ferrari
      { firstName: 'Charles', lastName: 'Leclerc', nationality: 'Monaco', teamId: getTeamId('Ferrari'), driverNumber: 16, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Lewis', lastName: 'Hamilton', nationality: 'UK', teamId: getTeamId('Ferrari'), driverNumber: 44, isActive: true, createdAt: now, updatedAt: now },

      // Mercedes
      { firstName: 'George', lastName: 'Russell', nationality: 'UK', teamId: getTeamId('Mercedes'), driverNumber: 63, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Andrea Kimi', lastName: 'Antonelli', nationality: 'Italy', teamId: getTeamId('Mercedes'), driverNumber: 12, isActive: true, createdAt: now, updatedAt: now },

      // McLaren
      { firstName: 'Lando', lastName: 'Norris', nationality: 'UK', teamId: getTeamId('McLaren'), driverNumber: 4, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Oscar', lastName: 'Piastri', nationality: 'Australia', teamId: getTeamId('McLaren'), driverNumber: 81, isActive: true, createdAt: now, updatedAt: now },

      // Aston Martin
      { firstName: 'Fernando', lastName: 'Alonso', nationality: 'Spain', teamId: getTeamId('Aston Martin'), driverNumber: 14, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Lance', lastName: 'Stroll', nationality: 'Canada', teamId: getTeamId('Aston Martin'), driverNumber: 18, isActive: true, createdAt: now, updatedAt: now },

      // Alpine
      { firstName: 'Pierre', lastName: 'Gasly', nationality: 'France', teamId: getTeamId('Alpine'), driverNumber: 10, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Jack', lastName: 'Doohan', nationality: 'Australia', teamId: getTeamId('Alpine'), driverNumber: 7, isActive: true, createdAt: now, updatedAt: now },

      // Williams
      { firstName: 'Alexander', lastName: 'Albon', nationality: 'Thailand', teamId: getTeamId('Williams'), driverNumber: 23, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Carlos', lastName: 'Sainz', nationality: 'Spain', teamId: getTeamId('Williams'), driverNumber: 55, isActive: true, createdAt: now, updatedAt: now },

      // Haas
      { firstName: 'Esteban', lastName: 'Ocon', nationality: 'France', teamId: getTeamId('Haas'), driverNumber: 31, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Oliver', lastName: 'Bearman', nationality: 'UK', teamId: getTeamId('Haas'), driverNumber: 87, isActive: true, createdAt: now, updatedAt: now },

      // RB
      { firstName: 'Isack', lastName: 'Hadjar', nationality: 'France', teamId: getTeamId('RB'), driverNumber: 6, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Liam', lastName: 'Lawson', nationality: 'New Zealand', teamId: getTeamId('RB'), driverNumber: 30, isActive: true, createdAt: now, updatedAt: now },

      // Sauber
      { firstName: 'Nico', lastName: 'Hulkenberg', nationality: 'Germany', teamId: getTeamId('Sauber'), driverNumber: 27, isActive: true, createdAt: now, updatedAt: now },
      { firstName: 'Gabriel', lastName: 'Bortoleto', nationality: 'Brazil', teamId: getTeamId('Sauber'), driverNumber: 5, isActive: true, createdAt: now, updatedAt: now },


      // ------------------------------
      // Reserve / Development Drivers
      // ------------------------------

      { firstName: 'Franco', lastName: 'Colapinto', nationality: 'Argentina', teamId: getTeamId('Williams'), driverNumber: 43, isActive: false, createdAt: now, updatedAt: now },

      { firstName: 'Isack', lastName: 'Hadjar', nationality: 'France', teamId: getTeamId('RB'), driverNumber: 6, isActive: false, createdAt: now, updatedAt: now },

    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('drivers', null, {});
  },
};