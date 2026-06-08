import Constants from 'expo-constants';

function getDevHost(): string {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? (Constants as any).manifest?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
}

export const NOTIFICATION_API_BASE_URL =
  process.env.EXPO_PUBLIC_NOTIFICATION_API_BASE_URL ?? `http://${getDevHost()}:8085`;
