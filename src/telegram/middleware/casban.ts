import fetch from 'cross-fetch';
import { Context, NextFunction } from "grammy";

export async function checkCAS(userId: number) {
    try {
      const result = await fetch(`https://api.cas.chat/check?user_id=${userId}`);
      return !result.ok;
    } catch (err) {
      return true
    }
}

export default async function checkCASBan(ctx: Context, next: NextFunction): Promise<void> {
    const userId = ctx.message?.from?.id;

    if(userId) {
        const isCasBanned = await checkCAS(userId);
    }

    await next();
}