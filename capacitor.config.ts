import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.carbonbridge.meetlog',
  appName: 'Parley',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  plugins: {
    FirebaseAuthentication: {
      // Use the native Google sign-in flow (system account picker), then sign
      // the credential into the Firebase JS SDK so existing Firestore code works.
      skipNativeAuth: false,
      providers: ['google.com']
    }
  }
};

export default config;
