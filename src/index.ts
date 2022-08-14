import 'dotenv/config';

import { run } from '@grammyjs/runner';

import feeds from './feeds/feeds';
import create from './telegram/utils';

import { commands } from './bot';

import handleBotError from './telegram/error';

(async () => {
    const bot = await create(commands);
    const feeder = await feeds(bot);

    for (const [, command] of Object.entries(commands)) {
        bot.command(command.actions, command.middleware);
    }

    bot.catch(handleBotError);

    const runner = run(bot);

    console.warn('Started');

    function cleanup() {
        feeder.destroy();
        if(runner.isRunning()) { runner.stop(); }
    }

    process.once("SIGINT", cleanup);
    process.once("SIGTERM", cleanup);
})();
