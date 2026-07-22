import type { CapacitorConfig } from '@capacitor/cli';

// CAPACITOR_DEV=true → loads local dev server (never set this in a release build)
const isDev = process.env['CAPACITOR_DEV'] === 'true';

const config: CapacitorConfig = {
  appId: 'app.jawib.trivia',
  appName: 'جاوب',
  webDir: 'dist/client',
  ...(isDev && {
    server: {
      url: process.env['CAPACITOR_SERVER_URL'] ?? 'http://localhost:3000',
      cleartext: true,
    },
  }),
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#06060F',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#06060F',
    },
  },
};

export default config;
