import 'dotenv/config';

import { run } from '@grammyjs/runner';

import feeds from './feeds/feeds';
import twitterClient from './twitter';

import create from './telegram/utils';

import { commands } from './bot';

import handleGrammyError from './telegram/handlers/error';

(async () => {
    const bot = await create(commands);
    const feeder = await feeds(twitterClient, bot);

    bot.command(commands.price.actions, commands.price.middleware);
    bot.command(commands.help.actions, commands.help.middleware);

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
