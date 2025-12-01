const dayjs = require("dayjs");
const { InputFile } = require("grammy");

const {
  Income,
  Spending,
  CurrentBalance,
  IncomeCategory,
  SpendingCategory,
} = require("../models");
const { Op } = require("sequelize");

const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");

const ExcelJS = require("exceljs");

exports.fetchReportData = async ({ type, fromDate, toDate, usdToUzsRate }) => {
  const Model = type === "income" ? Income : Spending;
  const Category = type === "income" ? IncomeCategory : SpendingCategory;

  const entries = await Model.findAll({
    where: {
      date: {
        [Op.between]: [fromDate.toDate(), toDate.toDate()],
      },
    },
    include: [{ model: Category, as: "category" }],
  });

  // // Merge all currencies to total UZS (USD estimated conversion optional)
  const categoryTotals = {};
  for (let item of entries) {
    const category = item.category.name;
    const uzs = Number(item.uzs_cash || 0);
    const card = Number(item.card || 0);
    const usd = Number(item.usd_cash || 0);
    const account = Number(item.account || 0);

    const total = uzs + card + account + usd * usdToUzsRate;

    categoryTotals[category] = (categoryTotals[category] || 0) + total;
  }

  return { raw: entries, categories: categoryTotals };
};

exports.fetchCurrentBalance = async (currencExch) => {
  const balance = await CurrentBalance.findOne({ where: { id: 1 } });

  if (!balance) return null;
  const total =
    (balance.uzs_cash || 0) +
    (balance.card || 0) +
    (balance.account || 0) +
    (balance.usd_cash || 0) * currencExch;

  return {
    balance,
    total,
  };
};

exports.showTextSummary = async (ctx, type, categories) => {
  // console.log("categories ", categories);
  const modelName = type === "income" ? "Kirim" : "Chiqim";
  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

  const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  const lines = sorted.map(
    ([cat, val]) => `• ${cat}: ${val.toLocaleString("en-US")} UZS`
  );

  const emoji = type === "income" ? "📈" : "📉";

  await ctx.reply(
    `${emoji} ${modelName} bayoni.\nUmumiy: ${total.toLocaleString(
      "en-US"
    )} UZS\n\n${lines.join("\n")}`
  );
};

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

exports.sendPieChart = async (ctx, categories) => {
  const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 800 });

  const total = Object.values(categories).reduce((sum, val) => sum + val, 0);

  const labels = Object.entries(categories).map(([category, value]) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return `${category} (${percentage}%)`;
  });

  const values = Object.values(categories);

  const image = await chartCanvas.renderToBuffer({
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map(() => getRandomColor()),
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Category BreakDown",
        },
      },
    },
  });

  // Wrap the buffer as InputFile
  const inputFile = new InputFile(image, "chart.png");

  // Send the image
  await ctx.replyWithPhoto(inputFile, {
    caption: "📊 Kategoriya bo'yicha hisobot",
  });
};

exports.sendExcelReport = async (ctx, data, type) => {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet(`${type.toUpperCase()} Report`);

  sheet.columns = [
    { header: "Sanasi", key: "date", width: 30 },
    { header: "Kategoriyasi", key: "category.name", width: 40 },
    { header: "Naqd So'mda", key: "uzs_cash", width: 30 },
    { header: "Naqd Dollarda", key: "usd_cash", width: 30 },
    { header: "Kartada", key: "card", width: 30 },
    { header: "Kompaniya Hisobida", key: "account", width: 30 },
  ];

  // Add rows
  for (const entry of data) {
    sheet.addRow([
      entry.date.toISOString().split("T")[0],
      entry.category.name,
      entry.uzs_cash || 0,
      entry.usd_cash || 0,
      entry.card || 0,
      entry.account || 0,
    ]);
  }
  // ✅ Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date();
  const [datePart, timePart] = date.toISOString().split("T");

  await ctx.replyWithDocument(
    new InputFile(buffer, `hisobot-${datePart}.xlsx`)
  );
};

// exports.getDataRange = async (rangeKey) => {
//   const row = new Date();

//   let start;

//   switch (rangeKey) {
//     case "today":
//       start = new Date(now.setHours(0, 0, 0, 0));
//       break;
//     case "week":
//       start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//       break;
//     case "month":
//       start = new Date(now.getFullYear(), now.getMonth(), 1);
//       break;
//     case "year":
//       start = new Date(now.getFullYear(), 0, 1);
//       break;
//   }

//   return { startDate: start, endDate: new Date() };
// };

// function formatDate(date) {
//   return dayjs(date).format("DD.MM.YYYY HH:mm");
// }

// exports.generateExcel = async (records, type) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Hisobot");

//   worksheet.columns = [
//     { header: "Sana", key: "date", width: 10 },
//     { header: "Naqd So'mda", key: "uzs_cash", width: 32 },
//     { header: "Naqd Dollarda", key: "usd_cash", width: 15 },
//     { header: "Kartada", key: "card", width: 15 },
//     { header: "Izoh", key: "comment", width: 15 },
//     { header: "Kategoriyasi", key: "category", width: 15 },
//   ];

//   records.forEach((rec) => {
//     worksheet.addRow({
//       date: formatDate(rec.date),
//       uzs_cash: rec.uzs_cash,
//       usd_cash: rec.usd_cash,
//       card: rec.card,
//       comment: rec.comment,
//       category: rec.category.name,
//     });
//   });
//   return await workbook.xlsx.writeBuffer();
// };
