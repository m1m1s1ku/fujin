import 'dotenv/config';

import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { run, RunnerHandle } from '@grammyjs/runner';

import { TwitterApi } from 'twitter-api-v2';

import fetch from 'cross-fetch';

import type FeedEmitter from 'rss-feed-emitter';

import config from './config';
import feeds from './feeds/feeds';

import { bigIntToString } from './utils';

const kLBCCURL = "https://lbcc.link";
const kGCAPI = "https://api.coingecko.com/api/v3";

const twitterClient = new TwitterApi({
    appKey: config.twitter.appKey,
    appSecret: config.twitter.appSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
});

const bot = new Bot(config.telegram.botToken);
bot.api.config.use(apiThrottler());

let runner: RunnerHandle | null = null;
let feeder: FeedEmitter | null = null;

const helpText = `/p - get coin data
/help - get help
/donate - get donation address
`;

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
    feeder = await feeds(twitterClient, bot);
    await setupBot();

    runner = run(bot);

    console.warn('Bot started');
})();

process.once("SIGINT", () => {
    feeder?.destroy();
    runner?.stop();
});

process.once("SIGTERM", () => {
    feeder?.destroy();
    runner?.stop();
});
