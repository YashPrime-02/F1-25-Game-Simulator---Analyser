module.exports = (sequelize, DataTypes) => {
  const NewsFeed = sequelize.define(
    'NewsFeed',
    {
      seasonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roundNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      headline: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'news_feed',   
      underscored: false,
    }
  );

  return NewsFeed;
};