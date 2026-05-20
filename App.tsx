import './global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { CardManualRegisterScreen } from './src/features/card/screens/CardManualRegisterScreen';

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CardManualRegisterScreen />
    </QueryClientProvider>
  );
}
