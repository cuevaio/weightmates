'use client';

import { ReactNode } from 'react';

import { AppStoreProvider } from './app';
import { CounterStoreProvider } from './counter';

export const StoreProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AppStoreProvider>
      <CounterStoreProvider>{children}</CounterStoreProvider>
    </AppStoreProvider>
  );
};
