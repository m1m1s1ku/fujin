import mimisiku from './externals/mimisiku/constants';
import { unwrap } from "./utils";
import { name, version } from '../package.json';

export type BotConfig = {
    name: string;
    verbose: boolean;
    version: string;
    address: string;
    shortName: string;
    chatID: number;
    refreshInterval: number;
    supabase: {
        url: string;
        anonKey: string;
    }
    urls: {
        website: string;
        twitter: string;
        telegram: string;
    }
    twitter: {
        appKey: string;
        appSecret: string;
        accessToken: string;
        accessSecret: string;
    },
    telegram: {
        botToken: string;
    },
};

export function configBuilder(): BotConfig  {
    const variables = [
        'VERBOSE',
        'TWITTER_APP_KEY',
        'TWITTER_APP_SECRET',
        'TWITTER_ACCESS_TOKEN',
        'TWITTER_ACCESS_SECRET',
        'TELEGRAM_BOT_TOKEN',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'DEV_TIP_ADDRESS'
    ];

    const env = process.env;
    const { chatID, shortName, telegram, twitter } = mimisiku;

    for(const variable of variables) {
        // if(!env[variable]) { throw new Error(`Invalid config value : ${variable}`); }
    }

    return {
        name,
        version,
        chatID,
        shortName,
        urls: {
            website: telegram, // todo : replace by website once done
            twitter: twitter,
            telegram: telegram,
        },
        refreshInterval: mimisiku.refreshInterval,
        verbose: env.VERBOSE === "true" ? true : false,
        address: unwrap(env.DEV_TIP_ADDRESS),
        supabase: {
            url: unwrap(env.SUPABASE_URL),
            anonKey: unwrap(env.SUPABASE_ANON_KEY),
        },
        twitter: {
            appKey: unwrap(env.TWITTER_APP_KEY),
            appSecret: unwrap(env.TWITTER_APP_SECRET),
            accessToken: unwrap(env.TWITTER_ACCESS_TOKEN),
            accessSecret: unwrap(env.TWITTER_ACCESS_SECRET),
        },
        telegram: {
            botToken: unwrap(env.TELEGRAM_BOT_TOKEN),
        }
    };
}

export default configBuilder();