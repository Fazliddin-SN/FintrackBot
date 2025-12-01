const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "💰 Kirim qo‘shish" }, { text: "💸 Chiqim qo‘shish" }],
      [{ text: "📊 Hisobot" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
    selective: true,
  },
};

const cancelKeyboard = {
  reply_markup: {
    keyboard: [["🚫 Bekor qilish"]],
    one_time_keyboard: true,
    resize_keyboard: true,
  },
};

const confirmCancelKeyboard = {
  reply_markup: {
    keyboard: [["✅ Tasdiqlash", "🚫 Bekor qilish"]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

module.exports = {
  mainKeyboard,
  cancelKeyboard,
  confirmCancelKeyboard,
};
