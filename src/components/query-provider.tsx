'use client';

import { ReactNode } from 'react';

import { experimental_createPersister } from '@tanstack/query-persist-client-core';
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

function makeQueryClient() {
  let storage = undefined;
  try {
    storage = eval(`sessionStorage`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message[0].replace(error.message[0], ''));
    }
  }

  if (storage) {
    return new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 30, // 30 seconds
          // @ts-expect-error i know man
          persister: experimental_createPersister({
            storage: storage,
            maxAge: 1000 * 60 * 60 * 12, // 12 hours
          }),
        },
      },
    });
  } else {
    return new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 30, // 30 seconds
        },
      },
    });
  }
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
