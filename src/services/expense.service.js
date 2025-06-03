const { InlineKeyboard } = require("grammy");
const { SpendingCategory, User, Spending } = require("../models");
const {
  cancelKeyboard,
  mainKeyboard,
  confirmCancelKeyboard,
} = require("../services/keyboards.service");

async function addExpense(conversation, ctx) {
  const inlineKeyboard = new InlineKeyboard()
    .text("💵 Naqd So'mda", "uzs_cash")
    .row()
    .text("💲 Naqd Dollarda", "usd_cash")
    .row()
    .text("💳 Kartadan", "card")
    .row()
    .text("🏢 Kompaniya hisobidan", "account")
    .row()
    .text("❌ Bekor qilish", "cancel");

  await ctx.reply("📌 Chiqim turini tanlang! ", {
    parse_mode: "Markdown",
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
    "*Chiqim miqdorini kiriting!*\n\nIltimos, *faqat raqamlardan* foydalaning. Masalan: `100000`.\n\n_Nuqta yoki vergul ishlatilmasin!_",
    {
      parse_mode: "Markdown",
      ...cancelKeyboard,
    }
  );

  let msg = await conversation.wait();
  const amount = msg.message.text?.trim();

  // IF USER WANT TO STOP THE PROCESS
  if (amount === "🚫 Bekor qilish") {
    await message.answerCallbackQuery();
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. 🏠 Asosiy menuga qaytish.",
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
  ctx.reply("📝 *Iltimos, yangi chiqim uchun izoh kiriting:*", {
    parse_mode: "Markdown",
    ...cancelKeyboard,
  });

  msg = await conversation.wait();
  const comment = msg.message.text?.trim();

  // IF USER WANT TO STOP THE PROCESS
  if (comment === "🚫 Bekor qilish") {
    await message.answerCallbackQuery();
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. 🏠  Asosiy menuga qaytish.",
      mainKeyboard
    );
  }

  // HERE WE LET USERS TO CHOOSE CATEGORIES FOR EACH NEW EXPENSE
  const users = await User.findAll();
  let userList = new InlineKeyboard();

  users.forEach((user, index) => {
    userList.text(user.username, user.id).row();
  });

  userList.text("Keyingi", "next").row();
  userList.text("❌ Bekor qilish", "cancel");

  ctx.reply("📂 Xodimlardan birini tanlang: ", {
    parse_mode: "Markdown",
    reply_markup: userList,
  });

  const userData = await conversation.waitForCallbackQuery();
  let user_id = userData.update.callback_query.data;

  // IF USER WANT TO STOP THE PROCESS
  if (user_id === "🚫 Bekor qilish") {
    await message.answerCallbackQuery();
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. 🏠  Asosiy menuga qaytish.",
      mainKeyboard
    );
  }

  if (user_id === "next") {
    user_id = null;
  }

  // HERE WE LET USERS TO CHOOSE CATEGORIES FOR EACH NEW EXPENSE
  const categories = await SpendingCategory.findAll();
  let catLabels = new InlineKeyboard();

  categories.forEach((cat, index) => {
    catLabels.text(cat.name, cat.id).row();
  });

  ctx.reply("📂 Chiqim kategoriyasini tanlang: ", {
    parse_mode: "Markdown",
    reply_markup: catLabels,
  });

  const category = await conversation.waitForCallbackQuery();
  let category_id = category.update.callback_query.data;

  // NOW WE SHOULD DEFINE WHO ADDED THIS NEW EXPENSE,
  const chatId = ctx.message.chat.id;
  const user = await User.findOne({
    where: {
      chatId,
    },
  });

  //
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
    staff_id: user_id,
    date,
    category_id,
  };
  console.log("body ", body);

  await ctx.reply("❓ *Yangi CHIQIM qoshilsinmi?*", {
    parse_mode: "Markdown",
    ...confirmCancelKeyboard,
  });

  msg = await conversation.wait();
  const confirmText = msg.message.text?.trim();
  // console.log("Confirm ", confirmText);

  // IF USER WANT TO STOP THE PROCESS
  if (confirmText === "🚫 Bekor qilish") {
    return ctx.reply(
      "✖️ Jarayon bekor qilindi. Asosiy menuga qaytish.",
      mainKeyboard
    );
  }

  if (confirmText === "✅ Tasdiqlash") {
    await Spending.create(body);
    return await ctx.reply(
      "✅ Yangi CHIQIM muvaffaqiyatli qo'shildi!",
      mainKeyboard
    );
  }
}

module.exports = addExpense;
