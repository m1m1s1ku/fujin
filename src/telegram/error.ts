import { BotError, Context, GrammyError, HttpError } from "grammy";

import logger from "../logger";

export default function handleBotError(err: BotError<Context>) {
    const ctx = err.ctx;
    logger.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        logger.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        logger.error("Could not contact Telegram:", e);
    } else {
        logger.error("Unknown error:", e);
    }
}