import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "../lib/utils";

export type Id = string;

export type Column = {
  id: Id;
  title: string;
};

export type ChecklistItem = {
  id: Id;
  text: string;
  completed: boolean;
  type: "item" | "group";
  items?: ChecklistItem[];
};

export type Label = {
  name: string;
  color: string;
  usageCount: number;
};

export type LabelConfig = {
  [labelName: string]: {
    color: string;
    pinned: boolean;
  };
};

export type Task = {
  id: Id;
  columnId: Id;
  title: string;
  description: string;
  labels: Label[];
  createdAt: number;
  date?: string;
  imageUrl?: string;
  checklist: ChecklistItem[];
};

export type BoardData = {
  columns: Column[];
  tasks: Task[];
  googleCalendarUrl: string;
  weatherLocation: string;
  labelConfig: LabelConfig;
};

interface BoardState {
  boards: Record<string, BoardData>;
  dashboardNames: Record<string, string>;
  selectedDashboard: string;
  darkMode: boolean;
  searchQuery: string;
  tagSearch: string;
  googleCalendarUrl: string | null;
  chatMessages: {
    id: string;
    sender: "user" | "ai";
    content: string;
    timestamp: number;
  }[];

  // Dashboard management
  createDashboard: (name: string) => void;
  selectDashboard: (id: string) => void;
  editDashboardName: (id: string, name: string) => void;
  deleteDashboard: (id: string) => void;

  // Board operations
  addColumn: (title: string) => void;
  updateColumn: (id: Id, title: string) => void;
  deleteColumn: (id: Id) => void;
  addTask: (
    columnId: Id,
    task: Omit<Task, "id" | "columnId" | "createdAt">,
  ) => void;
  updateTask: (id: Id, updates: Partial<Omit<Task, "id" | "columnId">>) => void;
  deleteTask: (id: Id) => void;
  moveTask: (taskId: Id, toColumnId: Id) => void;
  reorderTasks: (activeId: Id, overId: Id) => void;
  
  // Chat operations
  addChatMessage: (message: { sender: "user" | "ai"; content: string }) => void;
  getChatContext: () => {
    dashboardName: string;
    columns: {
      id: string;
      title: string;
      tasks: {
        id: string;
        title: string;
        description: string;
        date?: string;
        labels: string[];
        checklist: {
          total: number;
          completed: number;
        };
        createdAt: number;
      }[];
    }[];
  };

  // UI state
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  setTagSearch: (tags: string) => void;
  setGoogleCalendarUrl: (url: string) => void;
  removeGoogleCalendarUrl: () => void;
  setWeatherLocation: (location: string) => void;
  getFilteredTasks: () => Task[];
}

const DEFAULT_COLUMNS = [
  { id: "1", title: "Por hacer" },
  { id: "2", title: "En progreso" },
  { id: "3", title: "Completado" },
];

const createEmptyBoardData = (): BoardData => ({
  columns: DEFAULT_COLUMNS,
  tasks: [],
  googleCalendarUrl: "",
  weatherLocation: "",
  labelConfig: {},
});

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      boards: {
        default: createEmptyBoardData(),
      },
      dashboardNames: {
        default: "Principal",
      },
      selectedDashboard: "default",
      darkMode: true,
      searchQuery: "",
      tagSearch: "",
      googleCalendarUrl: localStorage.getItem("googleCalendarUrl"),
      chatMessages: [],

      createDashboard: (name) => {
        const id = generateId();
        set((state) => ({
          boards: {
            ...state.boards,
            [id]: createEmptyBoardData(),
          },
          dashboardNames: {
            ...state.dashboardNames,
            [id]: name,
          },
          selectedDashboard: id,
        }));
      },

      selectDashboard: (id) => {
        set({ selectedDashboard: id });
      },

      editDashboardName: (id, name) => {
        set((state) => ({
          dashboardNames: {
            ...state.dashboardNames,
            [id]: name,
          },
        }));
      },

      deleteDashboard: (id) => {
        if (id === "default") return;

        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _unused1, ...remainingBoards } = state.boards;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _unused2, ...remainingNames } = state.dashboardNames;

          return {
            boards: remainingBoards,
            dashboardNames: remainingNames,
            selectedDashboard:
              state.selectedDashboard === id
                ? "default"
                : state.selectedDashboard,
          };
        });
      },

      addColumn: (title) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              columns: [
                ...state.boards[state.selectedDashboard].columns,
                { id: generateId(), title },
              ],
            },
          },
        })),

      updateColumn: (id, title) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              columns: state.boards[state.selectedDashboard].columns.map(
                (col) => (col.id === id ? { ...col, title } : col),
              ),
            },
          },
        })),

      deleteColumn: (id) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              columns: state.boards[state.selectedDashboard].columns.filter(
                (col) => col.id !== id,
              ),
              tasks: state.boards[state.selectedDashboard].tasks.filter(
                (task) => task.columnId !== id,
              ),
            },
          },
        })),

      addTask: (columnId, task) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              tasks: [
                ...state.boards[state.selectedDashboard].tasks,
                {
                  ...task,
                  id: generateId(),
                  columnId,
                  createdAt: Date.now(),
                  date: task.date ? task.date : undefined,
                  checklist: task.checklist || [],
                  imageUrl: task.imageUrl || "",
                },
              ],
            },
          },
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              tasks: state.boards[state.selectedDashboard].tasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task,
              ),
            },
          },
        })),

      deleteTask: (id) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              tasks: state.boards[state.selectedDashboard].tasks.filter(
                (task) => task.id !== id,
              ),
            },
          },
        })),

      moveTask: (taskId, toColumnId) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              tasks: state.boards[state.selectedDashboard].tasks.map((task) =>
                task.id === taskId ? { ...task, columnId: toColumnId } : task,
              ),
            },
          },
        })),

      reorderTasks: (activeId, overId) =>
        set((state) => {
          const tasks = [...state.boards[state.selectedDashboard].tasks];
          const activeTask = tasks.find((t) => t.id === activeId);
          const overTask = tasks.find((t) => t.id === overId);

          if (
            !activeTask ||
            !overTask ||
            activeTask.columnId !== overTask.columnId
          ) {
            return state;
          }

          const activeIndex = tasks.indexOf(activeTask);
          const overIndex = tasks.indexOf(overTask);

          tasks.splice(activeIndex, 1);
          tasks.splice(overIndex, 0, activeTask);

          return {
            boards: {
              ...state.boards,
              [state.selectedDashboard]: {
                ...state.boards[state.selectedDashboard],
                tasks,
              },
            },
          };
        }),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              id: crypto.randomUUID(),
              ...message,
              timestamp: Date.now(),
            },
          ],
        })),

      getChatContext: () => {
        const state = get();
        const currentBoard = state.boards[state.selectedDashboard];
        const dashboardName = state.dashboardNames[state.selectedDashboard];

        return {
          dashboardName,
          columns: currentBoard.columns.map((column) => ({
            id: column.id,
            title: column.title,
            tasks: currentBoard.tasks
              .filter((task) => task.columnId === column.id)
              .map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                date: task.date,
                labels: task.labels.map(label => label.name),
                checklist: {
                  total: task.checklist.length,
                  completed: task.checklist.filter((item) => item.completed)
                    .length,
                },
                createdAt: task.createdAt,
              })),
          })),
        };
      },

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      setSearchQuery: (query) =>
        set(() => ({
          searchQuery: query,
        })),

      setTagSearch: (tags: string) =>
        set(() => ({
          tagSearch: tags,
        })),

      // Label management
      addLabel: (label: { name: string; color: string; usageCount: number }) =>
        set((state) => {
          const currentBoard = state.boards[state.selectedDashboard];
          const existingLabel = currentBoard.labelConfig[label.name];
          
          return {
            boards: {
              ...state.boards,
              [state.selectedDashboard]: {
                ...currentBoard,
                labelConfig: {
                  ...currentBoard.labelConfig,
                  [label.name]: {
                    color: label.color,
                    pinned: existingLabel?.pinned || false
                  }
                }
              }
            }
          };
        }),

      pinLabel: (labelName: string) =>
        set((state) => {
          const currentBoard = state.boards[state.selectedDashboard];
          const existingLabel = currentBoard.labelConfig[labelName];
          
          if (!existingLabel) return state;

          return {
            boards: {
              ...state.boards,
              [state.selectedDashboard]: {
                ...currentBoard,
                labelConfig: {
                  ...currentBoard.labelConfig,
                  [labelName]: {
                    ...existingLabel,
                    pinned: true
                  }
                }
              }
            }
          };
        }),

      unpinLabel: (labelName: string) =>
        set((state) => {
          const currentBoard = state.boards[state.selectedDashboard];
          const existingLabel = currentBoard.labelConfig[labelName];
          
          if (!existingLabel) return state;

          return {
            boards: {
              ...state.boards,
              [state.selectedDashboard]: {
                ...currentBoard,
                labelConfig: {
                  ...currentBoard.labelConfig,
                  [labelName]: {
                    ...existingLabel,
                    pinned: false
                  }
                }
              }
            }
          };
        }),

      updateLabel: (labelName: string, updates: { color?: string; name?: string }) =>
        set((state) => {
          const currentBoard = state.boards[state.selectedDashboard];
          const existingLabel = currentBoard.labelConfig[labelName];
          
          if (!existingLabel) return state;

          // Handle label name change
          if (updates.name && updates.name !== labelName) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [labelName]: _unused3, ...remainingLabels } = currentBoard.labelConfig;
            return {
              boards: {
                ...state.boards,
                [state.selectedDashboard]: {
                  ...currentBoard,
                  labelConfig: {
                    ...remainingLabels,
                    [updates.name]: {
                      ...existingLabel,
                      color: updates.color || existingLabel.color
                    }
                  }
                }
              }
            };
          }

          return {
            boards: {
              ...state.boards,
              [state.selectedDashboard]: {
                ...currentBoard,
                labelConfig: {
                  ...currentBoard.labelConfig,
                  [labelName]: {
                    ...existingLabel,
                    color: updates.color || existingLabel.color
                  }
                }
              }
            }
          };
        }),

      deleteLabel: (labelName: string) =>
        set((state) => {
          const currentBoard = state.boards[state.selectedDashboard];
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [labelName]: _unused4, ...remainingLabels } = currentBoard.labelConfig;
          
          return {
            boards: {
              ...state.boards,
              [state.selectedDashboard]: {
                ...currentBoard,
                labelConfig: remainingLabels,
                tasks: currentBoard.tasks.map(task => ({
                  ...task,
                  labels: task.labels.filter(label => label.name !== labelName)
                }))
              }
            }
          };
        }),

      setGoogleCalendarUrl: (url: string) => {
        localStorage.setItem("googleCalendarUrl", url);
        set({ googleCalendarUrl: url });
      },

      removeGoogleCalendarUrl: () => {
        localStorage.removeItem("googleCalendarUrl");
        set({ googleCalendarUrl: null });
      },

      setWeatherLocation: (location: string) =>
        set((state) => ({
          boards: {
            ...state.boards,
            [state.selectedDashboard]: {
              ...state.boards[state.selectedDashboard],
              weatherLocation: location,
            },
          },
        })),

      getFilteredTasks: () => {
        const state = get();
        const searchLower = state.searchQuery.toLowerCase();
        const searchTags = state.tagSearch
          .toLowerCase()
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        return state.boards[state.selectedDashboard].tasks
          .filter((task) => {
            const matchesSearch = task.title
              .toLowerCase()
              .includes(searchLower);
            const matchesTags =
              searchTags.length === 0 ||
              task.labels.some((label) =>
                searchTags.includes(label.name.toLowerCase()),
              );
            return matchesSearch && matchesTags;
          })
          .sort((a, b) => b.createdAt - a.createdAt);
      },
    }),
    {
      name: "kanban-storage",
    },
  ),
);

export const reorderTasks = useBoardStore.getState().reorderTasks;
