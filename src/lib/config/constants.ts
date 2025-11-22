export const env = {
  AUTH_TOKEN: '______Up@TickLMS____TOKEN___',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  API_V1: '/api/v1/',
};

export const urls = {
  LOGIN: `${env.API_V1}auth/login`,
  SUBMIT_ASSESSMENT: (id: string) => `${env.API_V1}assessment/submit/${id}`,
};

export const queryKeys = {};

