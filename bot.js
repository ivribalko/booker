import TelegramBot from 'node-telegram-bot-api';
import { TOKEN, CHAT_ID } from './secret.js';

const bot = new TelegramBot(TOKEN, { polling: false });

async function sendSuccess(message)
{
    await bot.sendMessage(CHAT_ID, message);
    await bot.sendSticker(CHAT_ID, 'CAACAgIAAxkBAAMRZlvsLQPmoFGd_Xn_-JHGFS8_S2sAAtoCAAJCsUIDb9JKtkcmawg1BA');
}

async function sendFailure(message)
{
    await bot.sendMessage(CHAT_ID, message);
    await bot.sendSticker(CHAT_ID, 'CAACAgIAAxkBAAMOZlvpKV08-DBv809aQPCiwT07u2sAAuICAAJCsUIDFhzVZKiixJA1BA');
}

export { bot, sendSuccess, sendFailure };
