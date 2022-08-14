import 'dotenv/config';

import { Bot } from 'grammy';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { run, RunnerHandle } from '@grammyjs/runner';

import { TwitterApi } from 'twitter-api-v2';

import type FeedEmitter from 'rss-feed-emitter';

import config from './config';
import feeds from './feeds/feeds';

import { CommandDescriptor, parseCommands } from './telegram/utils';

import priceMiddleware from './telegram/handlers/price';
import helpMiddleware from './telegram/handlers/help';
import handleGrammyError from './telegram/handlers/error';

(async () => {
    const twitterClient = new TwitterApi({
        appKey: config.twitter.appKey,
        appSecret: config.twitter.appSecret,
        accessToken: config.twitter.accessToken,
        accessSecret: config.twitter.accessSecret,
    });

    const bot = new Bot(config.telegram.botToken);
    bot.api.config.use(apiThrottler());

    const feeder: FeedEmitter = await feeds(twitterClient, bot);

    const commands: Record<string, CommandDescriptor> = {
        price: {
            actions: ['p', 'price'],
            description: 'Get price from CoinGecko',
        },
        help: {
            actions: ['help'],
            description: 'Get informations about this bot'
        }
    };

    await bot.api.setMyCommands(parseCommands(commands));

    bot.command(commands.price.actions, priceMiddleware);
    bot.command(commands.help.actions, ctx => helpMiddleware(ctx, commands));

    bot.catch(handleGrammyError);

    const runner = run(bot);

    console.warn('Started');

    process.once("SIGINT", () => {
        feeder.destroy();
        runner.stop();
    });
    
    process.once("SIGTERM", () => {
        feeder.destroy();
        runner.stop();
    });
})();
