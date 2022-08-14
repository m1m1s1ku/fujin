import { Context, InlineKeyboard } from "grammy";
import type { Message } from "grammy/out/types.node";
import config from "../../config";
import lbcc from '../../externals/lbcc/constants';

import { CommandDescriptor } from "../utils";

export default function helpMiddleware(ctx: Context, commands:Record<string, CommandDescriptor>): Promise<Message.TextMessage> {
    let helpText = `${config.name} v${config.version}\n\n`;

    for(const [ , commandDescriptor] of Object.entries(commands)) {
        helpText += `/${commandDescriptor.actions[0]} : ${commandDescriptor.description}\n`
    }

    helpText += `\n<b>Tip :</b><pre>${config.address}</pre>`;

    return ctx.reply(helpText, {
        reply_to_message_id: ctx.msg?.message_id ?? undefined,
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().url('Telegram', lbcc.telegram).url("LBCC", lbcc.website),
    });
}