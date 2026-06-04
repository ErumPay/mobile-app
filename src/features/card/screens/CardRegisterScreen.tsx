import { useState } from 'react';

import { CardOcrScreen } from './CardOcrScreen';
import { CardRegisterFormScreen } from './CardRegisterFormScreen';
import { CardRegisterMethodSelectScreen } from './CardRegisterMethodSelectScreen';
import { CardRegisterResultScreen } from './CardRegisterResultScreen';
import { registerCard } from '../api/cardApi';
import type { CardRegisterFormValues } from '../types/card';
import { onlyDigits } from '../types/cardFormat';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';

import { useManagedCardsStore } from '../../mypage/stores/useManagedCardsStore';

type RegisterMode = 'select' | 'ocr' | 'manual' | 'success' | 'failure';
type Props = NativeStackScreenProps<RootStackParamList, 'CardRegister'>;
const DEV_USER_ID = 1;

export function CardRegisterScreen({ navigation }: Props) {
  const [mode, setMode] = useState<RegisterMode>('select');
  const [ocrInitialValues, setOcrInitialValues] =
  useState<Partial<CardRegisterFormValues> | null>(null);

  const addCard = useManagedCardsStore((state) => state.addCard);

  const handleSubmitManualCard = async (values: CardRegisterFormValues) => {
    try {
      const registeredCard = await registerCard({
        userId: DEV_USER_ID,
        cardNumber: onlyDigits(values.cardNumber),
        expiryYm: toExpiryYm(values.expiry),
        cvc: onlyDigits(values.cvc),
        cardPassword2: onlyDigits(values.passwordFirstTwo),
        cardAlias: values.cardNickname.trim().slice(0, 10) || undefined,
        isDefault: false,
      });

      addCard({
        id: String(registeredCard.cardId),
        issuer: registeredCard.cardCompany,
        name: registeredCard.cardName,
        cardNumber: registeredCard.maskedNumber,
        alias: registeredCard.cardAlias ?? undefined,
        isDefault: registeredCard.isDefault,
      });

      setMode('success');
    } catch {
      setMode('failure');
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Main');
  };

  const handleGoHome = () => {
    navigation.navigate('Main');
  };

  const handleGoCardManagement = () => {
  navigation.navigate('CardManagementScreen');
};

  

  if (mode === 'ocr') {
    return (
      <CardOcrScreen
        onClose={handleGoBack}
        onConfirmOcrResult={(values) => {
          setOcrInitialValues(values);
          setMode('manual');
        }}
      />
    );
  }

  if (mode === 'manual') {
    return (
      <CardRegisterFormScreen
        onClose={handleGoBack}
        initialValues={ocrInitialValues}
        onSubmit={handleSubmitManualCard}
      />
    );
  }

  if (mode === 'success') {
    return (
      <CardRegisterResultScreen
        status="success"
        onClose={handleGoBack}
        onGoCardManagement={handleGoCardManagement}
        onGoHome={handleGoHome}
      />
    );
  }

  if (mode === 'failure') {
    return (
      <CardRegisterResultScreen
        status="failure"
        onClose={handleGoBack}
        onRetry={() => setMode('manual')}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <CardRegisterMethodSelectScreen
      onClose={handleGoBack}
      onPressOcr={() => setMode('ocr')}
      onPressManual={() => setMode('manual')}
    />
  );
}

function toExpiryYm(expiry: string) {
  const digits = onlyDigits(expiry);
  const month = digits.slice(0, 2);
  const year = digits.slice(2, 4);

  return `20${year}${month}`;
}

export default CardRegisterScreen;
