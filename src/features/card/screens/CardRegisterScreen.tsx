import { useState } from 'react';

import { CardOcrScreen } from './CardOcrScreen';
import { CardRegisterFormScreen } from './CardRegisterFormScreen';
import { CardRegisterMethodSelectScreen } from './CardRegisterMethodSelectScreen';
import { CardRegisterResultScreen } from './CardRegisterResultScreen';
import type { CardRegisterFormValues} from '../types/card';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../App';

import { useManagedCardsStore } from '../../mypage/stores/useManagedCardsStore';

type RegisterMode = 'select' | 'ocr' | 'manual' | 'success' | 'failure';
type Props = NativeStackScreenProps<RootStackParamList, 'CardRegister'>;

export function CardRegisterScreen({ navigation }: Props) {
  const [mode, setMode] = useState<RegisterMode>('select');
  const [ocrInitialValues, setOcrInitialValues] =
  useState<Partial<CardRegisterFormValues> | null>(null);

  const addCard = useManagedCardsStore((state) => state.addCard);

  const handleSubmitManualCard = (values: CardRegisterFormValues) => {
    addCard({
      cardNumber: values.cardNumber,
      alias: values.cardNickname,
    });

    setMode('success');
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

export default CardRegisterScreen;
