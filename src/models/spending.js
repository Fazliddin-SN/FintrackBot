"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Spending extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Spending.init(
    {
      amount: DataTypes.DECIMAL,
      category_id: DataTypes.INTEGER,
      usd_cash: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      uzs_cash: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      card: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      account: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comment: DataTypes.STRING,
      staff_id: DataTypes.INTEGER,
      admin_id: DataTypes.INTEGER,
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Spending",
    }
  );
  return Spending;
};
