import {
  BookOpen,
  ChartColumnDecreasing,
  LifeBuoy,
  MailOpen,
  Send,
  Settings2,
  Users,
} from 'lucide-react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { TeamSelect, TeamUserRelationsSelect, UserSelect } from '@/db/schema';

import { NavbarItem } from '@/components/app-sidebar';

export type navState = {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  navMain: NavbarItem[];
  navSecondary: NavbarItem[];
  navTeam: NavbarItem[];
};

export type navActions = {
  setUser: (
    user: UserSelect & {
      teamUserRelations: (TeamUserRelationsSelect & {
        team: TeamSelect;
      })[];
    },
  ) => void;
  setTeam: (teamId: string) => void;
};

export type navStore = navState & navActions;

const default_nav: navState = {
  user: null,
  navMain: [
    {
      name: 'Your Progress',
      url: '#',
      icon: ChartColumnDecreasing,
    },
    {
      name: 'Teams',
      url: '#',
      icon: BookOpen,
    },
    {
      name: 'Invites',
      url: '#',
      icon: MailOpen,
    },
    {
      name: 'Settings',
      url: '#',
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      name: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      name: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  navTeam: [
    {
      name: 'Team Progress',
      url: '/teams/[id]',
      icon: ChartColumnDecreasing,
    },
    {
      name: 'Members',
      url: '/teams/[id]/members',
      icon: Users,
    },
    {
      name: 'Invites',
      url: '/teams/[id]/invites',
      icon: MailOpen,
    },
    {
      name: 'Settings',
      url: '/teams/[id]/settings',
      icon: Settings2,
    },
  ],
};

export const initnavStore = (): navState => {
  return default_nav;
};

export const defaultInitState: navState = default_nav;

export const createnavStore = (initState: navState = defaultInitState) => {
  return createStore<navStore>()(
    persist(
      (set) => ({
        ...initState,
        setUser: (user) =>
          set((state) => ({
            ...state,
            user: {
              id: user.id,
              name: user.name,
              email: user.email ?? '',
            },
          })),
        setTeam: (teamId) =>
          set((state) => {
            return {
              ...state,
              navTeam: state.navTeam.map((n) => ({
                ...n,
                url: n.url.replace('[id]', teamId),
              })),
            };
          }),
      }),
      {
        name: 'nav-storage', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      },
    ),
  );
};
