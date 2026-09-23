const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const WEB_ENV = {
  API_URL: (import.meta.env.VITE_API_URL || 'https://dtnt.minkoi.org/api').replace(/\/+$/, ''),
  SUPABASE_URL: rawUrl.trim() || 'https://msozshwatonyxnkaqjfs.supabase.co',
  SUPABASE_ANON_KEY:
    rawKey.trim() ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zb3pzaHdhdG9ueXhua2FxamZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjU5MzYsImV4cCI6MjA4ODIwMTkzNn0.lbfHxn4YxXNLHB0uVBDInrHh8wsCbusDr1_SroACHgk',
};
