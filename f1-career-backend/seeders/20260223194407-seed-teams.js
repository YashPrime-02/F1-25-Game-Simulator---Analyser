'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('teams', [
      { name: 'Red Bull Racing', shortCode: 'RBR', baseCountry: 'Austria', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ferrari', shortCode: 'FER', baseCountry: 'Italy', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mercedes', shortCode: 'MER', baseCountry: 'Germany', createdAt: new Date(), updatedAt: new Date() },
      { name: 'McLaren', shortCode: 'MCL', baseCountry: 'UK', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Aston Martin', shortCode: 'AST', baseCountry: 'UK', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Alpine', shortCode: 'ALP', baseCountry: 'France', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Williams', shortCode: 'WIL', baseCountry: 'UK', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Haas', shortCode: 'HAA', baseCountry: 'USA', createdAt: new Date(), updatedAt: new Date() },
      { name: 'RB', shortCode: 'RB', baseCountry: 'Italy', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sauber', shortCode: 'SAU', baseCountry: 'Switzerland', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('teams', null, {});
  }
};