import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.jawib.trivia',
  appName: 'جاوب',
  webDir: 'dist/client',
  // When set, Capacitor loads the remote URL instead of the local bundle.
  // Remove `server` entirely before building a release IPA / APK.
  server: {
    url: process.env['CAPACITOR_SERVER_URL'] ?? 'https://jawib.app',
    cleartext: false,
  },
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
