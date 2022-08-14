import { Context, InlineKeyboard } from "grammy";
import type { Message } from "grammy/out/types.node";
import config from "../../config";
import fetchToken from "../../externals/coingecko/price";
import logger from "../../logger";

export default async function priceMiddleware(ctx: Context): Promise<Message.TextMessage | null> {
    if(!ctx.match) { return null; }

    const coin = await fetchToken(ctx.match as string);
    if(!coin) { return null; }

    if(config.verbose) {
        logger.info({
            context: ctx,
            token: ctx.match,
            reply: coin,
        });
    }

    return ctx.reply(coin.message, {
        parse_mode: 'HTML',
        reply_markup: coin.twitter ? new InlineKeyboard().url('Twitter', coin.twitter) : undefined,
    });
}