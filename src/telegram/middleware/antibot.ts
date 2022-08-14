import { Context, NextFunction } from "grammy";

export default async function silentForBots(ctx: Context, next: NextFunction): Promise<void> {
    if(ctx.message?.from?.is_bot) { return; }

    await next();
}