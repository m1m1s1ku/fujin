import fetch from 'cross-fetch';
import { bigIntToString, formatPercentage, localizeNumber, trendingIcon } from '../../utils';

const kGCAPI = "https://api.coingecko.com/api/v3";

export default async function fetchToken(token: string) {
    const tokenData = await (await fetch(`${kGCAPI}/search?query=${token}`)).json();
    if(!tokenData.coins || !tokenData.coins.length) { return null; }

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

    const twitter: string = coinData.links.twitter_screen_name;

    const message = `${name} ($${symbol.toUpperCase()})
Price : $${currentPrice}
${high && low ? `H|L : $${high}|$${low}` : ''}
${marketCap ? `MC : $${bigIntToString(marketCap)}` : ''}
${fdv ? `FDV : $${bigIntToString(fdv)}` : ''}
${volume ? `Vol : $${bigIntToString(volume)}` : ''}
${change1h ? `${trendingIcon(change1h)} 1h : ${formatPercentage(change1h)}%` : ''}
${change24h ? `${trendingIcon(change24h)} 24h : ${formatPercentage(change24h)}%` : ''}
${change7d ? `${trendingIcon(change7d)} 7d : ${formatPercentage(change7d)}%` : ''}
${maxSupply ? `Max supply : ${localizeNumber(maxSupply)}` : ''}
${followers ? `Followers : ${localizeNumber(followers)}` : ''}
${ath && changeFromATH && rank ? `ATH : $${ath} | Change ${formatPercentage(changeFromATH)}% | Rank : ${rank}` : ''}`.replace(/^\s*\n/gm, '')

return {
    message,
    twitter,
};
}