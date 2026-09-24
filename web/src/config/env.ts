export const WEB_ENV = {
  API_URL: (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, ''),
  // Public URL + anon key of Supabase "Data 02" (same project as the API's DB/auth).
  // One pair on purpose: env URL + fallback key from another project broke login.
  SUPABASE_URL: 'https://czngbleeeiljsrpbaksg.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bmdibGVlZWlsanNycGJha3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDQ5NjAsImV4cCI6MjA4ODI4MDk2MH0.31agxcZHEkcymaL_Ox5wOfB4zwivv961QHrn6E4tErM',
};
