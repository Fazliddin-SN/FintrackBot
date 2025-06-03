const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { mainKeyboard } = require("../services/keyboards.service");
async function loginCommand(conversation, ctx) {
  async function cancel() {
    await ctx.reply("❌ Tizimga kirish bekor qilindi. Qaytadan urining!", {
      reply_markup: {
        keyboard: [["📝 Login"]],
        resize_keyboard: true,
        one_time_keyboard: true,
        selective: true,
      },
    });

    return;
  }

  // 1. Usernameni kiritish
  await ctx.reply(
    "👤 Iltimos, Tizimda ro'yxatdan o'tishda ishlatilgan foydalanuvchi nomini kiriting:"
  );
  let msg = await conversation.wait();
  const username = msg.message.text?.trim();
  if (!username) {
    await ctx.reply("⚠️ Foydalanuvchi nomi kiritilishi kerak!");
    return cancel();
  }

  await ctx.reply("Iltimos parolni kiriting!");

  msg = await conversation.wait();
  const password = msg.message.text?.trim();

  if (!password) {
    await ctx.reply("⚠️ Parol kiritilishi kerak!");
    return cancel();
  }
  const user = await User.findOne({ where: { username } });

  if (!user) {
    await ctx.reply("⚠️ Bu nom bilan foydalanuvchi topilmadi!");
    return cancel();
  }
  // Check password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    await ctx.reply("⚠️ Tizimga kirilmadi. Parol xato");
    return cancel();
  }

  console.log("Chat id ", ctx.message);
  await User.update(
    {
      chatId: ctx.message.chat.id,
    },
    {
      where: {
        username: username, // or shorthand: { username }
      },
    }
  );

  await ctx.reply(
    "Siz muvaffaqiyatli tizimga kirdingiz! Botdan to'liq foydalanishingiz mumkin!",
    mainKeyboard
  );
}

module.exports = loginCommand;
