const { InlineKeyboard } = require("grammy");
const { IncomeCategory, User, Income } = require("../models");
const {
  cancelKeyboard,
  mainKeyboard,
  confirmCancelKeyboard,
} = require("../services/keyboards.service");

async function addIncome(conversation, ctx) {
  const inlineKeyboard = new InlineKeyboard()
    .text("💵 Naqd So'mda", "uzs_cash")
    .row()
    .text("💲 Naqd Dollarda", "usd_cash")
    .row()
    .text("💳 Kartadan", "card")
    .row()
    .text("🏢 Kompaniya hisobiga", "account")
    .row()
    .text("❌ Bekor qilish", "cancel");

  await ctx.reply("💰 Chiqim turini tanlang:", {
    reply_markup: inlineKeyboard,
  });

  // THIS HELP ME TO DEFINE WHICH TYPE OF EXPENSE IS CHOSEN
  const message = await conversation.waitForCallbackQuery(
    /^(uzs_cash|usd_cash|card|account|cancel)$/
  );
  const chosenType = message.update.callback_query.data;

  // IF USER WANT TO STOP THE PROCESS
  if (chosenType === "cancel") {
    await message.answerCallbackQuery();
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. Asosiy menuga qaytish.",
      mainKeyboard
    );
  }

  // HERE WE LET USERS ADD AMOUNT OF EXPENSE
  await ctx.reply(
    "*Kirim miqdorini kiriting!*\n\nIltimos, *faqat raqamlardan* foydalaning. Masalan: `100000`.\n\n_Nuqta yoki vergul ishlatilmasin!_",
    {
      parse_mode: "Markdown",
      ...cancelKeyboard,
    }
  );
  let msg = await conversation.wait();
  const amount = msg.message.text?.trim();

  // IF USER WANT TO STOP THE PROCESS
  if (amount === "🚫 Bekor qilish") {
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. Asosiy menuga qaytish.",
      mainKeyboard
    );
  }
  // Clean up number input (remove dots/commas)
  const cleanAmount = amount.replace(/[.,\s]/g, ""); // removes dots, commas, spaces

  // Check if it's a valid number
  if (!/^\d+$/.test(cleanAmount)) {
    await ctx.reply(
      "❌ Noto‘g‘ri miqdor! Faqat raqam kiriting, masalan: 100000. Jarayonni qaytadan boshlang!",
      mainKeyboard
    );
    return;
  }

  // HERE, WE LET USERS ADD COMMENT FOR EACH NEW EXPENSE
  ctx.reply("📝 Yangi KIRIM uchun izoh kiriting: ", cancelKeyboard);
  msg = await conversation.wait();
  const comment = msg.message.text?.trim();

  // IF USER WANT TO STOP THE PROCESS
  if (comment === "🚫 Bekor qilish") {
    await message.answerCallbackQuery();
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. Asosiy menuga qaytish.",
      mainKeyboard
    );
  }

  // HERE WE LET USERS TO CHOOSE CATEGORIES FOR EACH NEW EXPENSE
  const categories = await IncomeCategory.findAll();
  let catLabels = new InlineKeyboard();

  categories.forEach((cat) => {
    catLabels.text(cat.name, cat.id).row();
  });

  ctx.reply("📂 KIRIM Kategoriyasini tanlang: ", {
    parse_mode: "Markdown",
    reply_markup: catLabels,
  });

  const category = await conversation.waitForCallbackQuery();
  const category_id = category.update.callback_query.data;

  // NOW WE SHOULD DEFINE WHO ADDED THIS NEW EXPENSE,
  const chatId = ctx.message.chat.id;
  const user = await User.findOne({
    where: {
      chatId,
    },
  });
  // THIS DEFINE WHICH TYPE OF EXPENSE IT IS
  let expenseType;
  if (chosenType === "uzs_cash") {
    expenseType = "uzs_cash";
  } else if (chosenType === "usd_cash") {
    expenseType = "usd_cash";
  } else if (chosenType === "card") {
    expenseType = "card";
  } else {
    expenseType = "account";
  }

  // THIS IS THE DATA WHICH IS STORED IN DATABASE
  const date = Date.now();
  const body = {
    [expenseType]: cleanAmount,
    comment,
    admin_id: user.id,
    date,
    category_id,
  };

  await ctx.reply("📝 Yangi CHIQIM qo‘shilsinmi?", confirmCancelKeyboard);
  msg = await conversation.wait();
  const confirmText = msg.message.text?.trim();

  // IF USER WANT TO STOP THE PROCESS
  if (confirmText === "🚫 Bekor qilish") {
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. Asosiy menuga qaytish.",
      mainKeyboard
    );
  }

  if (confirmText === "✅ Tasdiqlash") {
    await Income.create(body);
    return await ctx.reply(
      "✅ Yangi CHIQIM muvaffaqiyatli qo'shildi!",
      mainKeyboard
    );
  }
}

module.exports = addIncome;
