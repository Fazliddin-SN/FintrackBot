require("dotenv").config();

const connectDB = require("./config/db");
const { bot } = require("./config/botResource");
const { conversations } = require("@grammyjs/conversations");

bot.use(conversations());
require("./commands/start.command");
require("./commands/login.command");
require("./commands/expense.command");
require("./commands/cancel.command");
require("./commands/income.command");
require("./commands/records.command");
// DB CONNECTION
connectDB();
// RUNNING THE BOT
bot.api
  .getMe()
  .then((botInfo) => {
    console.log(`🤖 Bot @${botInfo.username} is up and running.`);
  })
  .catch((err) => console.error("Bot startup failed:", err));

bot.start();
