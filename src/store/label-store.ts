import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Label = {
  name: string;
  color: string;
  usageCount: number;
  pinned: boolean;
};

interface LabelState {
  labels: Record<string, Label>;
  pinnedLabels: string[];
  
  // Métodos para gestionar etiquetas
  addLabel: (label: Omit<Label, 'usageCount' | 'pinned'>) => void;
  updateLabel: (name: string, updates: Partial<Label>) => void;
  deleteLabel: (name: string) => void;
  togglePinLabel: (name: string) => void;
  incrementUsage: (name: string) => void;
  getPinnedLabels: () => Label[];
}

export const useLabelStore = create<LabelState>()(
  persist(
    (set, get) => ({
      labels: {},
      pinnedLabels: [],

      addLabel: (label) => {
        const existingLabel = get().labels[label.name];
        
        set((state) => ({
          labels: {
            ...state.labels,
            [label.name]: {
              ...label,
              usageCount: existingLabel?.usageCount || 0,
              pinned: existingLabel?.pinned || false
            }
          }
        }));
      },

      updateLabel: (name, updates) => {
        const existingLabel = get().labels[name];
        if (!existingLabel) return;

        // Si se cambia el nombre, crear nueva entrada y eliminar la anterior
        if (updates.name && updates.name !== name) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _unused, ...remainingLabels } = get().labels;
          
          set((state) => ({
            labels: {
              ...remainingLabels,
              [updates.name as string]: {
                ...existingLabel,
                ...updates
              }
            },
            pinnedLabels: state.pinnedLabels.includes(name)
              ? [...state.pinnedLabels.filter(l => l !== name), updates.name as string]
              : state.pinnedLabels
          }));
          return;
        }

        set((state) => ({
          labels: {
            ...state.labels,
            [name]: {
              ...existingLabel,
              ...updates
            }
          }
        }));
      },

      deleteLabel: (name) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _unused, ...remainingLabels } = state.labels;
          return {
            labels: remainingLabels,
            pinnedLabels: state.pinnedLabels.filter(l => l !== name)
          };
        });
      },

      togglePinLabel: (name) => {
        set((state) => ({
          pinnedLabels: state.pinnedLabels.includes(name)
            ? state.pinnedLabels.filter(l => l !== name)
            : [...state.pinnedLabels, name]
        }));
      },

      incrementUsage: (name) => {
        const existingLabel = get().labels[name];
        if (!existingLabel) return;

        set((state) => ({
          labels: {
            ...state.labels,
            [name]: {
              ...existingLabel,
              usageCount: existingLabel.usageCount + 1
            }
          }
        }));
      },

      getPinnedLabels: () => {
        return get().pinnedLabels
          .map(name => get().labels[name])
          .filter(Boolean)
          .sort((a, b) => b.usageCount - a.usageCount);
      }
    }),
    {
      name: 'label-storage',
    }
  )
);
