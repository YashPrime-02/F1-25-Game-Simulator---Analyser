'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('tracks', [
      { name: 'Bahrain Grand Prix', country: 'Bahrain', code: 'BHR', laps: 57, defaultOrder: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Saudi Arabian Grand Prix', country: 'Saudi Arabia', code: 'JED', laps: 50, defaultOrder: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Australian Grand Prix', country: 'Australia', code: 'AUS', laps: 58, defaultOrder: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Japanese Grand Prix', country: 'Japan', code: 'JPN', laps: 53, defaultOrder: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Chinese Grand Prix', country: 'China', code: 'CHN', laps: 56, defaultOrder: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Miami Grand Prix', country: 'USA', code: 'MIA', laps: 57, defaultOrder: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Emilia Romagna Grand Prix', country: 'Italy', code: 'EMR', laps: 63, defaultOrder: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Monaco Grand Prix', country: 'Monaco', code: 'MON', laps: 78, defaultOrder: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Canadian Grand Prix', country: 'Canada', code: 'CAN', laps: 70, defaultOrder: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Spanish Grand Prix', country: 'Spain', code: 'ESP', laps: 66, defaultOrder: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Austrian Grand Prix', country: 'Austria', code: 'AUT', laps: 71, defaultOrder: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'British Grand Prix', country: 'UK', code: 'GBR', laps: 52, defaultOrder: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hungarian Grand Prix', country: 'Hungary', code: 'HUN', laps: 70, defaultOrder: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Belgian Grand Prix', country: 'Belgium', code: 'BEL', laps: 44, defaultOrder: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dutch Grand Prix', country: 'Netherlands', code: 'NED', laps: 72, defaultOrder: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Italian Grand Prix', country: 'Italy', code: 'ITA', laps: 53, defaultOrder: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Singapore Grand Prix', country: 'Singapore', code: 'SIN', laps: 62, defaultOrder: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'United States Grand Prix', country: 'USA', code: 'USA', laps: 56, defaultOrder: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mexico City Grand Prix', country: 'Mexico', code: 'MEX', laps: 71, defaultOrder: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Brazilian Grand Prix', country: 'Brazil', code: 'BRA', laps: 71, defaultOrder: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Las Vegas Grand Prix', country: 'USA', code: 'LVE', laps: 50, defaultOrder: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Qatar Grand Prix', country: 'Qatar', code: 'QAT', laps: 57, defaultOrder: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Abu Dhabi Grand Prix', country: 'UAE', code: 'ABD', laps: 58, defaultOrder: 23, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tracks', null, {});
  }
};