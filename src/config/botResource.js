const { Bot, session } = require("grammy");

require("dotenv").config();

// initialize the new bot
const bot = new Bot(process.env.BOT_TOKEN);
// <<< THIS MUST HAPPEN FIRST >>>
bot.use(
  session({
    initial: () => ({
      flow: null,
      step: 0,
      data: {},
    }),
  })
);

module.exports = { bot };
