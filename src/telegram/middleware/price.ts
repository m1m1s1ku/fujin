import { Context } from "grammy";
import type { Message } from "grammy/out/types.node";
import config from "../../config";
import fetchToken from "../../externals/coingecko/price";
import logger from "../../logger";

export default async function priceMiddleware(ctx: Context): Promise<Message.TextMessage | null> {
    if(!ctx.match) { return null; }

    const message = await fetchToken(ctx.match as string);

    if(!message) { return null; }

    if(config.verbose) {
        logger.info({
            context: ctx,
            token: ctx.match,
            reply: message,
        });
    }

    return ctx.reply(message);
}