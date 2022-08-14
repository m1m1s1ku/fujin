import 'dotenv/config';

import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { run, RunnerHandle } from '@grammyjs/runner';

import { TwitterApi } from 'twitter-api-v2';

import type FeedEmitter from 'rss-feed-emitter';

import config from './config';
import feeds from './feeds/feeds';
import fetchToken from './coingecko/price';
import lbcc from './lbcc/constants';

const twitterClient = new TwitterApi({
    appKey: config.twitter.appKey,
    appSecret: config.twitter.appSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
});

const bot = new Bot(config.telegram.botToken);
bot.api.config.use(apiThrottler());

let runner: RunnerHandle | null = null;
let feeder: FeedEmitter | null = null;

(async () => {
    feeder = await feeds(twitterClient, bot);

    await bot.api.setMyCommands([
        { command: "p", description: "Get price" },
        { command: "help", description: "Get help" },
    ]);

    bot.command('p', async ctx => {
        if(!ctx.match) { return; }

        const message = await fetchToken(ctx.match);

        if(!message) { return; }

        return ctx.reply(message);
    })

    bot.command('help', ctx => {
        return ctx.reply(`/p - get coin data
/help - get help

Donate : kujira1fygqhejwp6uzcfaf3yuypcwcd662q9u7rrzpna
`, {
            reply_to_message_id: ctx.msg.message_id,
            parse_mode: 'HTML',
            reply_markup: new InlineKeyboard().url("LBCC", lbcc.website).url('Telegram', lbcc.telegram),
        });
    });

    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);
        const e = err.error;
        if (e instanceof GrammyError) {
            console.error("Error in request:", e.description);
        } else if (e instanceof HttpError) {
            console.error("Could not contact Telegram:", e);
        } else {
            console.error("Unknown error:", e);
        }
    });

    runner = run(bot);

    console.warn('Bot started');
})();

process.once("SIGINT", () => {
    feeder?.destroy();
    runner?.stop();
});

process.once("SIGTERM", () => {
    feeder?.destroy();
    runner?.stop();
});
