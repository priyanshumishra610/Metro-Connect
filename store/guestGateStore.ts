import { create } from 'zustand';

export type ConversionReason = 'connection' | 'message' | 'dating' | 'community' | 'profile' | 'default';

interface GuestGateState {
  visible: boolean;
  reason: ConversionReason;
  open: (reason?: ConversionReason) => void;
  close: () => void;
}

export const useGuestGateStore = create<GuestGateState>((set) => ({
  visible: false,
  reason: 'default',
  open: (reason = 'default') => set({ visible: true, reason }),
  close: () => set({ visible: false }),
}));
