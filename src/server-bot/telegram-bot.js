
const TelegramBot = require('node-telegram-bot-api');

// Initialize Telegram bot with environment variables
const initTelegramBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const authorizedUsers = process.env.TELEGRAM_AUTHORIZED_USERS 
    ? process.env.TELEGRAM_AUTHORIZED_USERS.split(',').map(id => parseInt(id.trim())) 
    : [];

  if (!token) {
    console.warn('Telegram Bot Token not provided. Skipping Telegram bot initialization.');
    return null;
  }

  const bot = new TelegramBot(token, { polling: true });

  // Basic error handling
  bot.on('polling_error', (error) => {
    console.error('Telegram bot polling error:', error);
  });

  // Optional: Add a simple start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // Check if user is authorized
    if (authorizedUsers.length === 0 || authorizedUsers.includes(chatId)) {
      bot.sendMessage(chatId, 'Welcome to the Job Application Bot!');
    } else {
      bot.sendMessage(chatId, 'You are not authorized to use this bot.');
    }
  });

  return bot;
};

module.exports = initTelegramBot;
