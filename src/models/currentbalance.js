"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CurrentBalance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CurrentBalance.init(
    {
      uzs_cash: { type: DataTypes.FLOAT, allowNull: false },
      usd_cash: { type: DataTypes.FLOAT, allowNull: false },
      card: { type: DataTypes.FLOAT, allowNull: false },
      account: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      sequelize,
      modelName: "CurrentBalance",
    }
  );
  return CurrentBalance;
};
