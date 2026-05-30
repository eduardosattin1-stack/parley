import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.carbonbridge.meetlog',
  appName: 'Parley',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
