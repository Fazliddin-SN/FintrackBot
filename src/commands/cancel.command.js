const { bot } = require("../config/botResource");
const { mainKeyboard } = require("../services/keyboards.service");
//cancel action is handled here
const cancelFunction = () => {
  bot.hears("🚫 Bekor qilish", (ctx) => {
    ctx.conversation.exit();
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. Asosiy menuga qaytish.",
      mainKeyboard
    );
  });
};
