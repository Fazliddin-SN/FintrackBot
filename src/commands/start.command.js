const { bot } = require("../config/botResource");
const { mainKeyboard } = require("../services/keyboards.service");
const startCommand = require("../services/start.service");

bot.command("start", startCommand);

bot.command("main", async (ctx) => {
  await ctx.reply("🏠 Asosiy Menuga qaytish", {
    parse_mode: "Markdown",
    ...mainKeyboard,
  });
});
