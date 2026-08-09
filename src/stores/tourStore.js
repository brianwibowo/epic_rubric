import { create } from 'zustand';

/**
 * Zustand store for managing Page Help Modal & Interactive Feature Tour
 */
export const useTourStore = create((set, get) => ({
  isHelpOpen: false,
  isTourActive: false,
  currentStepIndex: 0,
  tourSteps: [],

  // Open Page Help Modal
  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),
  toggleHelp: () => set((state) => ({ isHelpOpen: !state.isHelpOpen })),

  // Start Guided Feature Tour
  startTour: (steps = []) => {
    set({
      isHelpOpen: false,
      isTourActive: true,
      currentStepIndex: 0,
      tourSteps: steps
    });
  },

  // Tour Controls
  nextStep: () => {
    const { currentStepIndex, tourSteps } = get();
    if (currentStepIndex < tourSteps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isTourActive: false, currentStepIndex: 0 });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  endTour: () => {
    set({
      isTourActive: false,
      currentStepIndex: 0
    });
  }
}));
