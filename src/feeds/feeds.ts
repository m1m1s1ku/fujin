import RssFeedEmitter from 'rss-feed-emitter';
import { Bot } from 'grammy';
import { groupBy } from 'ramda';

import { parse } from './opml';

import config from '../config';
import twitter from '../twitter';
import client from '../database/client';
import logger from '../logger';

const kImportIntoDatabase = false;

function _onFeedEvent(bot: Bot, item: { link: string; }): void { // receive full xml item.
    logger.info(`Sending ${item.link}`);
    Promise.all([
        twitter.v2.tweet(item.link),
        bot.api.sendMessage(config.chatID, item.link)
    ]).catch(logger.error);
};

type FeedSource = 'local' | 'remote';

type Feed = {
    id: number;
    created_at: string;
    title: string;
    xmlURL: string;
    htmlURL: string;
    type: 'rss';
    category: string;
}  

/**
 * @param bot : Grammy bot
 * @param source : Where to get feeds
 * @returns Emitter handle
 */
export default async function start(bot: Bot, source: FeedSource = 'remote'): Promise<RssFeedEmitter> {
    if(config.verbose) {
        logger.info(`Getting feeds from ${source}`);
    }

    const feeder = new RssFeedEmitter({ skipFirstLoad: true });

    switch(source) {
        case 'local':
            const opmlItems = await parse('../../feeds.opml');
            const feeds = [];

            for(const [category, value] of Object.entries(opmlItems)) {
                feeder.add({
                    url: value.map(feed => feed.feedURL),
                    refresh: config.refreshInterval,
                    eventName: category
                });
                feeder.on(category, (item) => _onFeedEvent(bot, item));
                if(kImportIntoDatabase){ feeds.push(...value); }
            }
    
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
            break;
        case 'remote':
            const databaseItems = await client.from<Feed>('feeds').select('*');
            if(!databaseItems.data) {
                throw new Error('Empty database');
            }

            const grouped = groupBy<Feed, string>(function(feed) {
                return feed.category;
            }, databaseItems.data);

            for(const [category, value] of Object.entries(grouped)) {
                feeder.add({
                    url: value.map(feed => feed.xmlURL),
                    refresh: config.refreshInterval,
                    eventName: category
                });
                feeder.on(category, (item) => _onFeedEvent(bot, item));
            }

            break;
    }
    
    // TODO XXX : Improve error handling
    feeder.on('error', (err) => {});

    return feeder;
}
