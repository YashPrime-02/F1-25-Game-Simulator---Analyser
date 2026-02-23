'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('careers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('solo', 'myteam'),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('careers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_careers_type";');
  },
};