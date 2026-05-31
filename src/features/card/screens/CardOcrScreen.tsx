import { View } from 'react-native';

import { Header } from '../../../shared/components/Header';
import { PageWrap } from '../../../shared/components/PageWrap';

interface CardOcrScreenProps {
  onClose?: () => void;
}

export function CardOcrScreen({ onClose }: CardOcrScreenProps) {
  return (
    <PageWrap
      scroll={false}
      padded={false}
      backgroundClassName="bg-black"
      header={
        <Header
          title="카드 촬영"
          type="close"
          tone="dark"
          onPressRight={onClose}
        />
      }
    >
      <View className="flex-1 bg-black" />
    </PageWrap>
  );
}

export default CardOcrScreen;
