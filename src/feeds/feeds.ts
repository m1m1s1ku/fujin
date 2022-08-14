import RssFeedEmitter from 'rss-feed-emitter';
import { TwitterApi } from 'twitter-api-v2';
import { Bot } from 'grammy';

import { parse } from './opml';

const kRefreshInterval = 3000;

function _onFeedEvent(twitterClient: TwitterApi, telegramBot: Bot, item: { link: string; }): void { // receive full xml item.
    Promise.all([
        twitterClient.v2.tweet(item.link),
        telegramBot.api.sendMessage(-1001238390870, item.link)
    ]).catch(console.error);
};

export default async function start(twitterClient: TwitterApi, telegramBot: Bot): Promise<RssFeedEmitter> {
    const items = await parse('../feeds.opml');
    const categories: string[] = [];
    
    const feeder = new RssFeedEmitter({ skipFirstLoad: true });
    for(const [key, value] of Object.entries(items)) {
        categories.push(key);
        feeder.add({
            url: value.map(feed => feed.feedURL),
            refresh: kRefreshInterval,
            eventName: key
        });

        feeder.on(key, (item) => _onFeedEvent(twitterClient, telegramBot, item));
    }
    feeder.on('error', (err) => {});

    return feeder;
}
