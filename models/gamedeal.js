'use strict';
module.exports = function(sequelize, DataTypes) {
  var gamedeal = sequelize.define('gamedeal', {
    name: DataTypes.STRING,
    boxart: DataTypes.STRING,
    link: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return gamedeal;
};