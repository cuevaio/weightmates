'use client';

import { useQuery } from '@tanstack/react-query';

import { TeamSelect, TeamUserRelationsSelect } from '@/db/schema';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      const json = await res.json();
      if (!res.ok) throw Error(json.error);

      return json.data as (TeamUserRelationsSelect & {
        team: TeamSelect;
      })[];
    },
  });
};
