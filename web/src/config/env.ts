const requireEnv = (value: string | undefined, name: string) => {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} is not defined`);
  }
  return normalized;
};

export const WEB_ENV = {
  API_URL: requireEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL').replace(/\/+$/, ''),
  SUPABASE_URL: requireEnv(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv(import.meta.env.VITE_SUPABASE_ANON_KEY, 'VITE_SUPABASE_ANON_KEY'),
};
