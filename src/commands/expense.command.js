const { createConversation } = require("@grammyjs/conversations");
const { bot } = require("../config/botResource");

const addExpense = require("../services/expense.service");

bot.use(createConversation(addExpense, "addExpense"));

bot.hears("💸 Chiqim qo‘shish", async (ctx) => {
  await ctx.reply("🧾 CHIQIM qo'shish jarayoni boshlandi!", {
    parse_mode: "Markdown",
    reply_markup: {
      remove_keyboard: true,
    },
  });

  await ctx.conversation.enter("addExpense");
});
