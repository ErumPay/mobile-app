import { useState } from 'react';

import { CardOcrScreen } from './CardOcrScreen';
import { CardRegisterFormScreen } from './CardRegisterFormScreen';
import { CardRegisterMethodSelectScreen } from './CardRegisterMethodSelectScreen';
import { CardRegisterResultScreen } from './CardRegisterResultScreen';
import { mockRegisteredCard } from '../mocks/cardMockData';
import type { CardRegisterFormValues, RegisteredCard } from '../types/card';
import { onlyDigits } from '../types/cardFormat';

type RegisterMode = 'select' | 'ocr' | 'manual' | 'success' | 'failure';

interface CardRegisterScreenProps {
  onClose?: () => void;
  onCardRegistered?: (card: RegisteredCard) => void;
}

export function CardRegisterScreen({
  onClose,
  onCardRegistered,
}: CardRegisterScreenProps) {
  const [mode, setMode] = useState<RegisterMode>('select');
  const [ocrInitialValues, setOcrInitialValues] =
  useState<Partial<CardRegisterFormValues> | null>(null);

  const handleSubmitManualCard = (values: CardRegisterFormValues) => {
    const digits = onlyDigits(values.cardNumber);

    onCardRegistered?.({
      ...mockRegisteredCard,
      id: `card-${Date.now()}`,
      last4: digits.slice(-4),
      cardNickname: values.cardNickname || mockRegisteredCard.cardNickname,
    });

    setMode('success');
  };

  const handleGoCardManagement = () => {
    // TODO: 카드 관리 화면으로 이동
  };

  const handleGoHome = () => {
    onClose?.();
  };

  if (mode === 'ocr') {
    return (
      <CardOcrScreen
        onClose={onClose}
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
        onClose={onClose}
        initialValues={ocrInitialValues}
        onSubmit={handleSubmitManualCard}
      />
    );
  }

  if (mode === 'success') {
    return (
      <CardRegisterResultScreen
        status="success"
        onClose={onClose}
        onGoCardManagement={handleGoCardManagement}
        onGoHome={handleGoHome}
      />
    );
  }

  if (mode === 'failure') {
    return (
      <CardRegisterResultScreen
        status="failure"
        onClose={onClose}
        onRetry={() => setMode('manual')}
        onGoHome={handleGoHome}
      />
    );
  }

  return (
    <CardRegisterMethodSelectScreen
      onClose={onClose}
      onPressOcr={() => setMode('ocr')}
      onPressManual={() => setMode('manual')}
    />
  );
}

export default CardRegisterScreen;
