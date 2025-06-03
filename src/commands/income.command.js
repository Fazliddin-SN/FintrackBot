const { createConversation } = require("@grammyjs/conversations");
const { bot } = require("../config/botResource");

const addIncome = require("../services/income.service");

bot.use(createConversation(addIncome, "addIncome"));

bot.hears("💰 Kirim qo‘shish", async (ctx) => {
  await ctx.reply("🧾 KIRIM qo'shish jarayoni boshlandi!", {
    parse_mode: "Markdown",
    reply_markup: {
      remove_keyboard: true,
    },
  });
  await ctx.conversation.enter("addIncome");
});
