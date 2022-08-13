import 'dotenv/config';

import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { run, RunnerHandle } from '@grammyjs/runner';
import RssFeedEmitter from 'rss-feed-emitter';

import { parse } from './opml';
import fetch from 'cross-fetch';
import { bigIntToString } from './utils';
import { TwitterApi } from 'twitter-api-v2';
import TwitterApiBase from 'twitter-api-v2/dist/client.base';

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
} as unknown as TwitterApiBase);
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("BOT_TOKEN is required");
}

const kLBCCURL = "https://lbcc.link";
const kGCAPI = "https://api.coingecko.com/api/v3";
const kRefreshInterval = 3000;

const bot = new Bot(botToken);
bot.api.config.use(apiThrottler());

const feeder = new RssFeedEmitter({ skipFirstLoad: true });
feeder.on('error', (err) => {});

let runner: RunnerHandle | null = null;

const helpText = `/p - get coin data
/help - get help
/donate - get donation address
`;

async function setupFeeds() {
    const items = await parse('../feeds.opml');
    const categories: string[] = [];

    const onFeedEvent = function (item: { link: string; }) { // receive full xml item.
        Promise.all([
            twitterClient.v2.tweet(item.link),
            bot.api.sendMessage(-1001238390870, item.link)
        ]).catch(console.error);
    };
    
    for(const [key, value] of Object.entries(items)) {
        categories.push(key);
        feeder.add({
            url: value.map(feed => feed.feedURL),
            refresh: kRefreshInterval,
            eventName: key
        });

        feeder.on(key, onFeedEvent);
    }
}

async function setupBot() {
    await bot.api.setMyCommands([
        { command: "p", description: "Get price" },
        { command: "help", description: "Get help" },
        { command: "donate", description: "Donate" },
    ]);

    bot.command('donate', async ctx => {
        return ctx.reply('Thanks a lot ! kujira1fygqhejwp6uzcfaf3yuypcwcd662q9u7rrzpna');
    });

    bot.command('p', async ctx => {
        if(!ctx.message) { return; }

        const tokenData = await (await fetch(`${kGCAPI}/search?query=${ctx.match}`)).json();
        if(!tokenData.coins || !tokenData.coins.length) { return; }

        const foundToken = tokenData.coins[0];
        const coingeckoID = foundToken.id;

        const coinData = await (await fetch(`${kGCAPI}/coins/${coingeckoID}`)).json();

        const marketData = coinData.market_data;
        const communityData = coinData.community_data;

        const name: string = coinData.name;
        const symbol: string = coinData.symbol;
        const currentPrice: number = marketData.current_price.usd
        const ath: number = marketData.ath.usd;
        const changeFromATH: number = marketData.ath_change_percentage.usd;
        const marketCap: number = marketData.market_cap.usd;
        const fdv: number = marketData.fully_diluted_valuation.usd;
        const volume: number = marketData.total_volume.usd;
        const rank: number = marketData.market_cap_rank;
        const high: number = marketData.high_24h.usd;
        const low: number = marketData.low_24h.usd;
        const change1h: number = marketData.price_change_percentage_1h_in_currency.usd;
        const change24h: number = marketData.price_change_percentage_24h_in_currency.usd;
        const change7d: number = marketData.price_change_percentage_7d_in_currency.usd;
        const maxSupply: number = marketData.max_supply;
        const followers: number = communityData.twitter_followers;

        return ctx.reply(`${name} ($${symbol.toUpperCase()})
Price : $${currentPrice}
${high && low ? `H|L : $${high}|$${low}` : ''}
${marketCap ? `MC : $${bigIntToString(marketCap)}` : ''}
${fdv ? `FDV : $${bigIntToString(fdv)}` : ''}
${volume ? `Vol : $${bigIntToString(volume)}` : ''}
${change1h ? `1h : ${change1h.toFixed(0)}%` : ''}
${change24h ? `24h : ${change24h.toFixed(0)}%` : ''}
${change7d ? `7d : ${change7d.toFixed(0)}%` : ''}
${maxSupply ? `Max supply : ${maxSupply}` : ''}
${followers ? `Followers : ${followers}` : ''}
${ath && changeFromATH && rank ? `ATH : $${ath} | Change ${changeFromATH.toFixed(0)}% | Rank : ${rank}` : ''}
`.replace(/^\s*\n/gm, ''))
    })

    bot.command('help', ctx => {
        const websiteButton = new InlineKeyboard().url(
            "LBCC",
            kLBCCURL,
        ).url('Telegram', 'https://t.me/LeBonClubCrypto');

        return ctx.reply(helpText, {
            reply_to_message_id: ctx.msg.message_id,
            parse_mode: 'HTML',
            reply_markup: websiteButton,
        });
    });

    bot.catch((err) => {
        const ctx = err.ctx;
        console.error(`Error while handling update ${ctx.update.update_id}:`);
        const e = err.error;
        if (e instanceof GrammyError) {
            console.error("Error in request:", e.description);
        } else if (e instanceof HttpError) {
            console.error("Could not contact Telegram:", e);
        } else {
            console.error("Unknown error:", e);
        }
    });
}

(async () => {
    await setupFeeds();
    await setupBot();

    runner = run(bot);

    console.warn('Bot started');
})();

process.once("SIGINT", () => {
    feeder.destroy();
    runner?.stop();
});

process.once("SIGTERM", () => {
    feeder.destroy();
    runner?.stop();
});
