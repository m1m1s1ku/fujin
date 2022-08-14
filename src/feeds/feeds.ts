import RssFeedEmitter from 'rss-feed-emitter';
import { Bot } from 'grammy';

import { parse } from './opml';

import lbcc from '../externals/lbcc/constants';
import twitter from '../twitter';

function _onFeedEvent(bot: Bot, item: { link: string; }): void { // receive full xml item.
    Promise.all([
        twitter.v2.tweet(item.link),
        bot.api.sendMessage(lbcc.chatID, item.link)
    ]).catch(console.error);
};

export default async function start(bot: Bot): Promise<RssFeedEmitter> {
    const items = await parse('../../feeds.opml');
    const categories: string[] = [];
    
    const feeder = new RssFeedEmitter({ skipFirstLoad: true });
    for(const [key, value] of Object.entries(items)) {
        categories.push(key);
        feeder.add({
            url: value.map(feed => feed.feedURL),
            refresh: lbcc.refreshInterval,
            eventName: key
        });

        // TODO XXX : By category "rules" + redirect to handler
        feeder.on(key, (item) => _onFeedEvent(bot, item));
    }
    feeder.on('error', (err) => {});

    return feeder;
}
