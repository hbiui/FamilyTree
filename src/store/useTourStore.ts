import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 新手引导步骤
export type TourStep =
  | 'welcome'
  | 'tap_member'
  | 'long_press_add';

export interface TourState {
  // 是否已完成引导
  tourCompleted: boolean;
  // 当前步骤
  currentStep: TourStep | null;
  // 引导是否可见
  isVisible: boolean;
  // 设置引导已完成
  setTourCompleted: () => void;
  // 重置引导状态
  resetTour: () => void;
  // 开始引导
  startTour: () => void;
  // 关闭引导
  closeTour: () => void;
  // 下一步
  nextStep: () => void;
  // 上一步
  prevStep: () => void;
  // 跳转到指定步骤
  goToStep: (step: TourStep) => void;
}

// 引导步骤顺序
export const TOUR_STEPS: TourStep[] = [
  'welcome',
  'tap_member',
  'long_press_add',
];

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      tourCompleted: false,
      currentStep: null,
      isVisible: false,

      setTourCompleted: () =>
        set({
          tourCompleted: true,
          currentStep: null,
          isVisible: false,
        }),

      resetTour: () =>
        set({
          tourCompleted: false,
          currentStep: 'welcome',
          isVisible: true,
        }),

      startTour: () => {
        const state = get();
        if (!state.tourCompleted) {
          set({
            currentStep: 'welcome',
            isVisible: true,
          });
        }
      },

      closeTour: () =>
        set({
          isVisible: false,
        }),

      nextStep: () => {
        const state = get();
        const currentIndex = TOUR_STEPS.indexOf(state.currentStep!);
        
        if (currentIndex < TOUR_STEPS.length - 1) {
          set({
            currentStep: TOUR_STEPS[currentIndex + 1],
          });
        } else {
          set({
            tourCompleted: true,
            currentStep: null,
            isVisible: false,
          });
        }
      },

      prevStep: () => {
        const state = get();
        const currentIndex = TOUR_STEPS.indexOf(state.currentStep!);
        
        if (currentIndex > 0) {
          set({
            currentStep: TOUR_STEPS[currentIndex - 1],
          });
        }
      },

      goToStep: (step: TourStep) =>
        set({
          currentStep: step,
          isVisible: true,
        }),
    }),
    {
      name: 'family-tree-tour-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch {}
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch {}
        },
      })),
    }
  )
);
