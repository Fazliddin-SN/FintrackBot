const dayjs = require("dayjs");
const { bot } = require("../config/botResource");

const { User } = require("../models");

const {
  fetchReportData,
  showTextSummary,
  sendPieChart,
  sendExcelReport,
  fetchCurrentBalance,
} = require("../middlewares/report.middleware");

bot.hears("📊 Hisobot", async (ctx) => {
  const user = await User.findOne({
    where: { chatId: ctx.from.id },
  });

  if (!user.role_id === 1) {
    return ctx.reply("Sizga bu amalni bajarish uchun ruxsat berilmagan!!!");
  }

  await ctx.reply("Qaysi turdagi hisobotni ko‘rmoqchisiz?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📥 Daromad", callback_data: "report_income" }],
        [{ text: "📤 Xarajat", callback_data: "report_expense" }],
      ],
    },
  });
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (["report_income", "report_expense"].includes(data)) {
    ctx.session = ctx.session || {};
    ctx.session.reportType = data === "report_income" ? "income" : "expense";
    ctx.session.awaitingExchangeRate = true;

    await ctx.reply(
      "💱 Iltimos, 1 USD uchun UZS kursni kiriting (masalan: 12500)"
    );
    return;
  }

  if (data.startsWith("range_")) {
    const now = dayjs();
    let fromDate;

    switch (data) {
      case "range_today":
        fromDate = now.startOf("day");
        break;
      case "range_week":
        fromDate = now.startOf("week");
        break;
      case "range_month":
        fromDate = now.startOf("month");
        break;
      case "range_year":
        fromDate = now.startOf("year");
        break;
      default:
        return console.log("Invalid date range");
    }

    const toDate = now;
    const type = ctx.session?.reportType;

    if (!ctx.session?.usdToUzsRate) {
      await ctx.reply(
        "❌ USD kurs aniqlanmadi. Iltimos, /main dan qayta urinib ko'ring."
      );
      return;
    }

    try {
      const { raw, categories } = await fetchReportData({
        type,
        fromDate,
        toDate,
        usdToUzsRate: ctx.session.usdToUzsRate, // Pass the exchange rate
      });

      if (!raw.length) {
        await ctx.reply("🚫 Ushbu davrda ma'lumot topilmadi.");
        return;
      }

      await showTextSummary(ctx, type, categories, ctx.session.usdToUzsRate);
      await sendPieChart(ctx, categories);
      await sendExcelReport(ctx, raw, type);

      const { balance, total } = await fetchCurrentBalance(
        ctx.session.usdToUzsRate
      );
      if (balance) {
        await ctx.reply(
          `💼 Joriy balans:\n• UZS: ${balance.uzs_cash.toLocaleString(
            "en-US"
          )}\n• USD: ${balance.usd_cash.toLocaleString(
            "en-US"
          )}\n• Kartadagi: ${balance.card.toLocaleString(
            "en-US"
          )}\n• Kopmaniya Hisobida: ${balance.account.toLocaleString(
            "en-US"
          )}\n\n≈ Umumiy: ${total.toLocaleString("en-US")} UZS`
        );
      }

      // Reset exchange rate after report
      ctx.session.usdToUzsRate = undefined;
      ctx.session.awaitingExchangeRate = false;
    } catch (err) {
      console.error("Hisobotda xatolik:", err);
      await ctx.reply("❌ Hisobotni olishda xatolik yuz berdi.");
    }
  }
});

bot.on("message", async (ctx) => {
  if (ctx.session?.awaitingExchangeRate) {
    const input = ctx.message.text?.trim();
    const rate = parseFloat(input);

    if (isNaN(rate) || rate < 1000 || rate > 20000) {
      await ctx.reply(
        "❌ Noto‘g‘ri kurs. Iltimos, faqat raqam kiriting (masalan: 12500)"
      );
      return;
    }

    ctx.session.usdToUzsRate = rate;
    ctx.session.awaitingExchangeRate = false;

    await ctx.reply("🕒 Qaysi davr uchun hisobot kerak?", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📅 Bugun", callback_data: "range_today" }],
          [{ text: "📅 Bu hafta", callback_data: "range_week" }],
          [{ text: "📆 Bu oy", callback_data: "range_month" }],
          [{ text: "📈 Bu yil", callback_data: "range_year" }],
        ],
      },
    });
  }
});
