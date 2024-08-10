'use server';

export async function getConfig() {
  const result = {
    APP_LOCALE: process.env.APP_LOCALE || 'en-US',
    APP_CURRENCY: process.env.APP_CURRENCY || 'USD',
    APP_NAME: process.env.APP_NAME || 'Dashboard',
  };

  return result;
}
