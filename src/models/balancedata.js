"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BalanceData.init(
    {
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      uzs_cash: { type: DataTypes.FLOAT, allowNull: false },
      usd_cash: { type: DataTypes.FLOAT, allowNull: false },
      card: { type: DataTypes.FLOAT, allowNull: false },
      account: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      sequelize,
      modelName: "BalanceData",
    }
  );
  return BalanceData;
};
