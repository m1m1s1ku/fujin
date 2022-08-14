import { Context, InlineKeyboard } from "grammy";

import type { Message } from "grammy/out/types.node";

import { commands } from '../../bot';
import config from "../../config";
import logger from "../../logger";

export default function helpMiddleware(ctx: Context): Promise<Message.TextMessage> {
    if(config.verbose) {
        logger.info(ctx);
    }
    
    let helpText = `${config.name} v${config.version}\n\n`;

    for(const [ , commandDescriptor] of Object.entries(commands)) {
        helpText += `/${commandDescriptor.actions[0]} : ${commandDescriptor.description}\n`
    }

    helpText += `\n<b>Tip :</b><pre>${config.address}</pre>`;

    return ctx.reply(helpText, {
        reply_to_message_id: ctx.msg?.message_id ?? undefined,
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().url('Twitter', config.urls.twitter).url('Telegram', config.urls.telegram).url(config.shortName, config.urls.website),
    });
}