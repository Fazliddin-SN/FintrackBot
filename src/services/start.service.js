const startCommand = async (ctx) => {
  ctx.reply(
    "👋 Assalomu alaykum! Bu bot yordamida daromad va xarajatlaringizni nazorat qilishingiz mumkin."
  );
  // REPLY WITH MESSAGE
  ctx.reply("❗️ Botdan to'liq foydalanishdan oldin login qiling!", {
    reply_markup: {
      keyboard: [["📝 Login"]],
      resize_keyboard: true,
      one_time_keyboard: true,
      selective: true,
    },
  });
  return;
};

module.exports = startCommand;
