const { createConversation } = require("@grammyjs/conversations");
const { bot } = require("../config/botResource");

const loginCommand = require("../services/login.service");

bot.use(createConversation(loginCommand, "login"));
bot.hears("📝 Login", async (ctx) => {
  await ctx.conversation.enter("login");
});
