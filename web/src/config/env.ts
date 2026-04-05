const requireEnv = (value: string | undefined, name: string) => {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} is not defined`);
  }
  return normalized;
};

export const WEB_ENV = {
  API_URL: requireEnv(import.meta.env.VITE_API_URL, 'VITE_API_URL'),
  GOOGLE_CLIENT_ID: requireEnv(import.meta.env.VITE_GOOGLE_CLIENT_ID, 'VITE_GOOGLE_CLIENT_ID'),
};
