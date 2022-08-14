import pino from 'pino';
import config from './config';

export default pino({
    name: config.name,
    level: config.verbose ? 'trace' : 'info',
});