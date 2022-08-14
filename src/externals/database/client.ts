import { createClient } from '@supabase/supabase-js';

import config from '../../config';

const client = createClient(config.supabase.url, config.supabase.anonKey);

export default client;
