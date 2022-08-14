import { TwitterApi } from 'twitter-api-v2';
import config from '../../config';

const twitterClient = new TwitterApi({
    appKey: config.twitter.appKey,
    appSecret: config.twitter.appSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
});

export default twitterClient;