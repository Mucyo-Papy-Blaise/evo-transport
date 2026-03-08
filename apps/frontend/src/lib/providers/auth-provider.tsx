'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient as defaultClient } from '@/lib/query/query-client';
import { AuthProvider } from '@/lib/auth/auth-context';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [client] = useState(() => defaultClient);

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        {children}
      </AuthProvider>

      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}