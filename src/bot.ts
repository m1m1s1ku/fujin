import helpMiddleware from "./telegram/handlers/help";
import priceMiddleware from "./telegram/handlers/price";

export interface CommandDescriptor {
    actions: string[],
    description: string;
}

export const commands = {
    price: {
        actions: ['p', 'price'],
        description: 'Get price from CoinGecko',
        middleware: priceMiddleware,
    },
    help: {
        actions: ['help'],
        description: 'Get informations about this bot',
        middleware: helpMiddleware
    }
};