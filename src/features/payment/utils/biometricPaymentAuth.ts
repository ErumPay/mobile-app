import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_PAYMENT_ENABLED_KEY = 'erumpay.biometricPayment.enabled';
const BIOMETRIC_PAYMENT_PIN_KEY = 'erumpay.biometricPayment.pin';

const secureStoreAuthOptions = {
  requireAuthentication: true,
  authenticationPrompt: '생체 인증으로 간편비밀번호를 확인합니다.',
};

export async function canUseBiometricPaymentAuth() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();

  if (!hasHardware) {
    return false;
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  return isEnrolled;
}

export async function isBiometricPaymentEnabled() {
  const enabled = await SecureStore.getItemAsync(BIOMETRIC_PAYMENT_ENABLED_KEY);

  return enabled === 'true';
}

export async function enableBiometricPayment(pin: string) {
  const canUseBiometric = await canUseBiometricPaymentAuth();

  if (!canUseBiometric) {
    throw new Error('사용 가능한 생체 인증이 없습니다.');
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: '생체 인증을 등록해주세요.',
    cancelLabel: '취소',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    throw new Error('생체 인증 등록이 취소되었습니다.');
  }

  await SecureStore.setItemAsync(
    BIOMETRIC_PAYMENT_PIN_KEY,
    pin,
    secureStoreAuthOptions,
  );
  await SecureStore.setItemAsync(BIOMETRIC_PAYMENT_ENABLED_KEY, 'true');
}

export async function disableBiometricPayment() {
  await SecureStore.deleteItemAsync(BIOMETRIC_PAYMENT_PIN_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_PAYMENT_ENABLED_KEY);
}

export async function getBiometricPaymentPin() {
  const enabled = await isBiometricPaymentEnabled();

  if (!enabled) {
    return null;
  }

  const canUseBiometric = await canUseBiometricPaymentAuth();

  if (!canUseBiometric) {
    await disableBiometricPayment();
    return null;
  }

  return SecureStore.getItemAsync(
    BIOMETRIC_PAYMENT_PIN_KEY,
    secureStoreAuthOptions,
  );
}
