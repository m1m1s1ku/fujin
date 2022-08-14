import { Bot } from "grammy";
import { apiThrottler } from '@grammyjs/transformer-throttler';

import config from '../config';

interface TelegramCommand { 
    command: string; 
    description: string;
}

export interface CommandDescriptor {
    actions: string[],
    description: string;
}

export default async function create(commands: Record<string, CommandDescriptor>): Promise<Bot> {
    const bot = new Bot(config.telegram.botToken);
    bot.api.config.use(apiThrottler());

    await bot.api.setMyCommands(_parseCommands(commands));
    
    return bot;
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