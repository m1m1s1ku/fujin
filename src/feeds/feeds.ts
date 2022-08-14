import RssFeedEmitter from 'rss-feed-emitter';
import { Bot } from 'grammy';

import { parse } from './opml';

import lbcc from '../externals/lbcc/constants';
import twitter from '../twitter';
import client from '../database/client';

const kImportIntoDatabase = false;

function _onFeedEvent(bot: Bot, item: { link: string; }): void { // receive full xml item.
    Promise.all([
        twitter.v2.tweet(item.link),
        bot.api.sendMessage(lbcc.chatID, item.link)
    ]).catch(console.error);
};

export default async function start(bot: Bot): Promise<RssFeedEmitter> {
    const items = await parse('../../feeds.opml');
    
    const feeder = new RssFeedEmitter({ skipFirstLoad: true });
    const feeds = [];
    for(const [category, value] of Object.entries(items)) {
        feeder.add({
            url: value.map(feed => feed.feedURL),
            refresh: lbcc.refreshInterval,
            eventName: category
        });

        // TODO XXX : Implement by category "rules"
        feeder.on(category, (item) => _onFeedEvent(bot, item));
        feeds.push(...value);
    }

    // TODO XXX : Improve error handling
    feeder.on('error', (err) => {});

    if(kImportIntoDatabase) {
        await client.from('feeds').insert(feeds.map(feed => {
            return {
                title: feed.title,
                xmlURL: feed.feedURL,
                htmlURL: feed.url,
                type: feed.feedType,
                category: feed.feedCategory,
            };
        }));
    }

    return feeder;
}
