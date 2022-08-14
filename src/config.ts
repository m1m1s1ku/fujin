import { unwrap } from "./utils";

export function configBuilder(): {
    twitter: {
        appKey: string;
        appSecret: string;
        accessToken: string;
        accessSecret: string;
    },
    telegram: {
        botToken: string;
    },
} {
    const variables = ['TWITTER_APP_KEY', 'TWITTER_APP_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET', 'TELEGRAM_BOT_TOKEN'];

    const env = process.env;

    for(const variable of variables) {
        if(!env[variable]) {
            throw new Error('Invalid config');
        }
    }

    return {
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