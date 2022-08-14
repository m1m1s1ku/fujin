import pino from 'pino';
import SonicBoom from 'sonic-boom';
import config from './config';

export default pino({
    name: config.name,
    level: config.verbose ? 'trace' : 'info',
}, new SonicBoom({ fd: process.stdout.fd }));