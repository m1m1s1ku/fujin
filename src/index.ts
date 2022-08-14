import 'dotenv/config';

import { run } from '@grammyjs/runner';

import feeds from './feeds/feeds';
import twitterClient from './twitter';

import create, { CommandDescriptor } from './telegram/utils';

import priceMiddleware from './telegram/handlers/price';
import helpMiddleware from './telegram/handlers/help';
import handleGrammyError from './telegram/handlers/error';

(async () => {
    const commands: Record<string, CommandDescriptor> = {
        price: {
            actions: ['p', 'price'],
            description: 'Get price from CoinGecko',
        },
        help: {
            actions: ['help'],
            description: 'Get informations about this bot',
        }
    };

    const bot = await create(commands);
    const feeder = await feeds(twitterClient, bot);

    bot.command(commands.price.actions, priceMiddleware);
    bot.command(commands.help.actions, ctx => helpMiddleware(ctx, commands));

    bot.catch(handleGrammyError);

    const runner = run(bot);

    console.warn('Started');

    process.once("SIGINT", function() {
        feeder.destroy();
        if(runner.isRunning()) { runner.stop(); }
    });
    
    process.once("SIGTERM", function() {
        feeder.destroy();
        if(runner.isRunning()) { runner.stop(); }
    });
})();
