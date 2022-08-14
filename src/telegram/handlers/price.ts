import { Context } from "grammy";
import { Message } from "grammy/out/types.node";
import fetchToken from "../../externals/coingecko/price";

export default async function priceMiddleware(ctx: Context): Promise<Message.TextMessage | null> {
    if(!ctx.match) { return null; }

    const message = await fetchToken(ctx.match as string);

    if(!message) { return null; }

    return ctx.reply(message);
}