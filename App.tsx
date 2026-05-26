import { SafeAreaView } from 'react-native';

import './global.css';
import { MypageHomeScreen } from './src/features/mypage';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <MypageHomeScreen />
    </SafeAreaView>
  );
}
