import { create } from 'zustand';

import type { CommuteFrequency } from '@/types/database';

interface OnboardingState {
  homeStationId: string | null;
  homeStationName: string | null;
  destinationStationId: string | null;
  destinationStationName: string | null;
  metroLineId: string | null;
  startTime: string; // "HH:MM"
  endTime: string;
  frequency: CommuteFrequency | null;
  interestIds: string[];
  setHomeStation: (id: string, name: string) => void;
  setDestinationStation: (id: string, name: string) => void;
  setMetroLine: (id: string) => void;
  setTimeWindow: (startTime: string, endTime: string) => void;
  setFrequency: (frequency: CommuteFrequency) => void;
  toggleInterest: (id: string) => void;
  reset: () => void;
}

const initial = {
  homeStationId: null,
  homeStationName: null,
  destinationStationId: null,
  destinationStationName: null,
  metroLineId: null,
  startTime: '07:30',
  endTime: '09:00',
  frequency: null,
  interestIds: [] as string[],
};

/** Holds in-progress onboarding answers until the final save — nothing here touches the network until screen 10 commits it. */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setHomeStation: (id, name) => set({ homeStationId: id, homeStationName: name }),
  setDestinationStation: (id, name) => set({ destinationStationId: id, destinationStationName: name }),
  setMetroLine: (id) => set({ metroLineId: id }),
  setTimeWindow: (startTime, endTime) => set({ startTime, endTime }),
  setFrequency: (frequency) => set({ frequency }),
  toggleInterest: (id) =>
    set((state) => ({
      interestIds: state.interestIds.includes(id)
        ? state.interestIds.filter((x) => x !== id)
        : [...state.interestIds, id],
    })),
  reset: () => set(initial),
}));
