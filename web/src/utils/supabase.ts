import { createClient } from '@supabase/supabase-js';
import { WEB_ENV } from '../config/env';

export const supabase = createClient(WEB_ENV.SUPABASE_URL, WEB_ENV.SUPABASE_ANON_KEY);
