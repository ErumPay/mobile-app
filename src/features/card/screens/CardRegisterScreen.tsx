import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';

import type { RootStackParamList } from '../../../../App';
import { useManagedCardsStore } from '../../mypage/stores/useManagedCardsStore';
import { registerCard } from '../api/cardApi';
import { getCardRegisterUserId } from '../api/cardApiConfig';
import type { CardRegisterFormValues, RegisteredCard } from '../types/card';
import { onlyDigits } from '../types/cardFormat';
import { CardOcrScreen } from './CardOcrScreen';
import { CardRegisterFormScreen } from './CardRegisterFormScreen';
import { CardRegisterMethodSelectScreen } from './CardRegisterMethodSelectScreen';
import { CardRegisterResultScreen } from './CardRegisterResultScreen';

type RegisterMode = 'select' | 'ocr' | 'manual' | 'success' | 'failure';
type Props = NativeStackScreenProps<RootStackParamList, 'CardRegister'>;

export function CardRegisterScreen({ navigation }: Props) {
  const [mode, setMode] = useState<RegisterMode>('select');
  const [ocrInitialValues, setOcrInitialValues] =
    useState<Partial<CardRegisterFormValues> | null>(null);
  const [registeredCard, setRegisteredCard] = useState<RegisteredCard | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCard = useManagedCardsStore((state) => state.addCard);

  const syncRegisteredCardToStore = (
    nextCard: RegisteredCard,
    values: CardRegisterFormValues,
  ) => {
    try {
      addCard({
        id: String(nextCard.cardId),
        cardProductId: nextCard.cardProductId,
        issuer: nextCard.cardCompany,
        name: nextCard.cardName,
        cardNumber: nextCard.maskedNumber || maskCardNumber(values.cardNumber),
        alias: nextCard.cardAlias ?? undefined,
        isDefault: nextCard.isDefault,
        disabled: isRegisteredCardUnavailable(nextCard),
      });
    } catch (error) {
      console.warn('Failed to sync registered card to local store.', error);
      throw error;
    }
  };

  const handleSubmitManualCard = async (values: CardRegisterFormValues) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextCard = await registerCard({
        userId: getCardRegisterUserId(),
        cardNumber: onlyDigits(values.cardNumber),
        expiryYm: toExpiryYm(values.expiry),
        cvc: onlyDigits(values.cvc),
        cardPassword2: onlyDigits(values.passwordFirstTwo),
        cardAlias: values.cardNickname.trim().slice(0, 10) || undefined,
        isDefault: false,
      });

      if (isRegisteredCardUnavailable(nextCard)) {
        setMode('failure');
        return;
      }

      syncRegisteredCardToStore(nextCard, values);
      setRegisteredCard(nextCard);
      setMode('success');
    } catch {
      setMode('failure');
    } finally {
      setIsSubmitting(false);
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
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitManualCard}
      />
    );
  }

  if (mode === 'success') {
    return (
      <CardRegisterResultScreen
        status="success"
        registeredCard={registeredCard}
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

function maskCardNumber(cardNumber: string) {
  const digits = onlyDigits(cardNumber);
  const first4 = digits.slice(0, 4) || '****';
  const last4 = digits.slice(-4) || '****';

  return `${first4}-****-****-${last4}`;
}

function isRegisteredCardUnavailable(card: RegisteredCard) {
  const status = card.status.toUpperCase();

  return status !== 'ACTIVE';
}

export default CardRegisterScreen;
