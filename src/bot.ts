import helpMiddleware from "./telegram/middleware/help";
import priceMiddleware from "./telegram/middleware/price";

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