import 'dotenv/config';

import { run } from '@grammyjs/runner';

// import feeds from './feeds/feeds';
import create from './telegram/utils';

import { commands } from './bot';

import handleBotError from './telegram/error';
// import checkCASBan from './telegram/middleware/casban';

(async () => {
    const bot = await create(commands);
    // const feeder = await feeds(bot);

    // bot.on(':new_chat_members', checkCASBan)

    for (const [, command] of Object.entries(commands)) {
        bot.command(command.actions, command.middleware);
    }

    bot.catch(handleBotError);

    const runner = run(bot);

    function cleanup() {
        // feeder.destroy();
        if(runner.isRunning()) { runner.stop(); }
    }

    process.once("SIGINT", cleanup);
    process.once("SIGTERM", cleanup);
})();
