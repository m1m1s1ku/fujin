import { createClient } from '@supabase/supabase-js';

const kSupabaseURL = "https://jjpjussnfjtdeqrnovyg.supabase.co";
const kPublicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqcGp1c3NuZmp0ZGVxcm5vdnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA0NzI5MTgsImV4cCI6MTk3NjA0ODkxOH0.spEyDLxBskL2DHVf20FfsTFSFYgVY0GjZy7nkD5hqEM";

const client = createClient(kSupabaseURL, kPublicAnonKey);

export default client;
