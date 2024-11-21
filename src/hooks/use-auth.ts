'use client';

import { useQuery } from '@tanstack/react-query';

import { UserSelect } from '@/db/schema';

export const useAuth = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const res = await fetch('/api/auth');
      const json = await res.json();
      if (!res.ok) throw Error(json.error);

      return json.data as UserSelect;
    },
  });
};
