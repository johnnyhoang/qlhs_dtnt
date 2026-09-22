export const WEB_ENV = {
  API_URL: (import.meta.env.VITE_API_URL || 'https://qlhs-dtnt.vercel.app/api').replace(/\/+$/, ''),
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://czngbleeeiljsrpbaksg.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sBExv35CS4s7lgOgQgIzJg_WMAd4E14',
};
