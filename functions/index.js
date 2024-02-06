const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {Telegraf} = require("telegraf");
const qrcode = require("qrcode");
require("dotenv").config();

const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient(process.env.BITLY_APIKEY);
const validurl = require("valid-url");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
bot.start((ctx) => ctx.reply("Hello i am bot"));
bot.help((ctx) =>
  ctx.reply("/shorten for URL shortening\n/qrcode for QR code generation"));

bot.command("qrcode", async (ctx) => {
  const data = ctx.message.text.split(" ").slice(1).join(" ");

  if (!data) {
    ctx.reply("Please provide data for qr code. Example: /qrcode data");
    return;
  }

  const qr = await qrcode.toDataURL(data);
  ctx.replyWithPhoto({source: Buffer.from(qr.split(",")[1], "base64")});
});

bot.command("shorten", async (ctx) => {
  const originalUrl = ctx.message.text.split(" ").slice(1).join(" ");

  if (!validurl.isUri(originalUrl)) {
    ctx.reply("Please provide a valid URL");
    return;
  }

  try {
    const response = await bitly.shorten(originalUrl);
    const shortenedUrl = response.link;
    ctx.reply(`Shortened URL: ${shortenedUrl}`);
  } catch (error) {
    console.error("Bitly API Error:", error);
    ctx.reply("Error while shortening the URL");
  }
});

bot.launch();
