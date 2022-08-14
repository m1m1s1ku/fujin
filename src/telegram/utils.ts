import { Bot } from "grammy";
import { apiThrottler } from '@grammyjs/transformer-throttler';

import config from '../config';
import type { CommandDescriptor } from "../bot";

interface TelegramCommand { 
    command: string; 
    description: string;
}

function _parseCommands(programCommands: Record<string, CommandDescriptor>): TelegramCommand[] {
    const telegramCommands: TelegramCommand[] = [];
    for(const [ , commandDescriptor] of Object.entries(programCommands)) {
        telegramCommands.push({
            command: commandDescriptor.actions[0], 
            description: commandDescriptor.description,
        });
    }
    
    return telegramCommands;
}

export default async function create(commands: Record<string, CommandDescriptor>): Promise<Bot> {
    const bot = new Bot(config.telegram.botToken);
    bot.api.config.use(apiThrottler());

    await bot.api.setMyCommands(_parseCommands(commands));
    
    return bot;
}
