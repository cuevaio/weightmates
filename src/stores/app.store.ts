import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type AppState = {
  teamId: string | undefined;
};

export type AppActions = {
  setTeamId: (teamId?: string) => void;
};

export type AppStore = AppState & AppActions;

export const initAppStore = (): AppState => {
  return { teamId: undefined };
};

export const defaultInitState: AppState = {
  teamId: undefined,
};

export const createAppStore = (initState: AppState = defaultInitState) => {
  return createStore<AppStore>()(
    persist(
      (set) => ({
        ...initState,
        setTeamId: (teamId) => set((state) => ({ ...state, teamId })),
      }),
      {
        name: 'app-store-storage', // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      },
    ),
  );
};
