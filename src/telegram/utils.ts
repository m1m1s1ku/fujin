interface TelegramCommand { 
    command: string; 
    description: string;
}

export interface CommandDescriptor {
    actions: string[],
    description: string;
}

export function parseCommands(programCommands: Record<string, CommandDescriptor>): TelegramCommand[] {
    const telegramCommands: TelegramCommand[] = [];
    for(const [ , commandDescriptor] of Object.entries(programCommands)) {
        telegramCommands.push({
            command: commandDescriptor.actions[0], 
            description: commandDescriptor.description,
        });
    }
    
    return telegramCommands;
} 