import { Context, NextFunction } from "grammy";


export default async function mentionEveryoneInGroupMiddleware(ctx: Context, next: NextFunction): Promise<void> {
    await ctx.reply('@m1m1s1ku @WolveBan @abel59 @Jacques_Sparreau @Byteoku');

    await next();
}