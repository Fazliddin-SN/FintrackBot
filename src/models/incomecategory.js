"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class IncomeCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  IncomeCategory.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "IncomeCategory",
    }
  );
  return IncomeCategory;
};
