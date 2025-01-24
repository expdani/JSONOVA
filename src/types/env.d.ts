declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEEPSEEK_API_KEY: string;
      DEEPSEEK_API_URL: string;
      PORT?: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_REDIRECT_URI: string;
      GOOGLE_ACCESS_TOKEN?: string;
      GOOGLE_REFRESH_TOKEN?: string;
    }
  }
}

export {};
