const { CurrentBalance } = require("../models");

exports.updateCurrentBalance = async (entry, isIncome = true) => {
  const balanaces = await CurrentBalance.findOne({ where: { id: 1 } });

  const sign = isIncome ? 1 : -1;

  balanaces.uzs_cash += sign * parseFloat(entry.uzs_cash || 0);
  balanaces.usd_cash += sign * parseFloat(entry.usd_cash || 0);
  balanaces.card += sign * parseFloat(entry.card || 0);
  balanaces.account += sign * parseFloat(entry.account || 0);

  await balanaces.save();
};
