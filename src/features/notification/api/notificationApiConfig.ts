import Constants from 'expo-constants';

function getDevHost(): string {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? (Constants as any).manifest?.debuggerHost;

  if (!debuggerHost) {
    return 'localhost';
  }

  if (debuggerHost.startsWith('[')) {
    const endBracketIndex = debuggerHost.indexOf(']');
    if (endBracketIndex > 0) {
      return debuggerHost.slice(0, endBracketIndex + 1);
    }
  }

  const lastColonIndex = debuggerHost.lastIndexOf(':');
  if (lastColonIndex > -1) {
    return debuggerHost.slice(0, lastColonIndex);
  }

  return debuggerHost;
}

export const NOTIFICATION_API_BASE_URL =
  process.env.EXPO_PUBLIC_NOTIFICATION_API_BASE_URL ?? `http://${getDevHost()}:8085`;
