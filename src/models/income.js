"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Income extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Income.init(
    {
      amount: DataTypes.DECIMAL,
      category_id: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
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
      staff_id: DataTypes.INTEGER,
      part_num: DataTypes.STRING,
      admin_id: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      checked: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Income",
    }
  );
  return Income;
};
