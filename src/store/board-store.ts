import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export type Id = string;

export type Column = {
  id: Id;
  title: string;
};

export type Task = {
  id: Id;
  columnId: Id;
  title: string;
  description: string;
  labels: string[];
  createdAt: number;
  date?: string;
};

interface BoardState {
  columns: Column[];
  tasks: Task[];
  darkMode: boolean;
  searchQuery: string;
  tagSearch: string;
  googleCalendarUrl: string;
  weatherLocation: string;
  addColumn: (title: string) => void;
  updateColumn: (id: Id, title: string) => void;
  deleteColumn: (id: Id) => void;
  addTask: (columnId: Id, task: Omit<Task, 'id' | 'columnId' | 'createdAt'>) => void;
  updateTask: (id: Id, updates: Partial<Omit<Task, 'id' | 'columnId'>>) => void;
  deleteTask: (id: Id) => void;
  moveTask: (taskId: Id, toColumnId: Id) => void;
  reorderTasks: (activeId: Id, overId: Id) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  setTagSearch: (tags: string) => void;
  setGoogleCalendarUrl: (url: string) => void;
  removeGoogleCalendarUrl: () => void;
  setWeatherLocation: (location: string) => void;
  getFilteredTasks: () => Task[];
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      columns: [
        { id: '1', title: 'Por hacer' },
        { id: '2', title: 'En progreso' },
        { id: '3', title: 'Completado' },
      ],
      tasks: [],
      darkMode: true,
      searchQuery: '',
      tagSearch: '',
      googleCalendarUrl: '',
      weatherLocation: '',

      addColumn: (title) =>
        set((state) => ({
          columns: [...state.columns, { id: generateId(), title }],
        })),

      updateColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, title } : col
          ),
        })),

      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id),
          tasks: state.tasks.filter((task) => task.columnId !== id),
        })),

      addTask: (columnId, task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              columnId,
              createdAt: Date.now(),
              date: task.date ? task.date : undefined,
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      moveTask: (taskId, toColumnId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, columnId: toColumnId } : task
          ),
        })),

      reorderTasks: (activeId, overId) =>
        set((state) => {
          const tasks = [...state.tasks];
          const activeTask = tasks.find((t) => t.id === activeId);
          const overTask = tasks.find((t) => t.id === overId);

          if (!activeTask || !overTask || activeTask.columnId !== overTask.columnId) {
            return state;
          }

          const activeIndex = tasks.indexOf(activeTask);
          const overIndex = tasks.indexOf(overTask);

          tasks.splice(activeIndex, 1);
          tasks.splice(overIndex, 0, activeTask);

          return { tasks };
        }),

      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      setSearchQuery: (query) =>
        set(() => ({
          searchQuery: query,
        })),

      setTagSearch: (tags) =>
        set(() => ({
          tagSearch: tags,
        })),

      setGoogleCalendarUrl: (url: string) =>
        set(() => ({
          googleCalendarUrl: url,
        })),

      removeGoogleCalendarUrl: () =>
        set(() => ({
          googleCalendarUrl: "",
        })),

      setWeatherLocation: (location: string) =>
        set(() => ({
          weatherLocation: location,
        })),

      getFilteredTasks: () => {
        const state = get();
        const searchLower = state.searchQuery.toLowerCase();
        const searchTags = state.tagSearch
          .toLowerCase()
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

        return state.tasks
          .filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(searchLower);
            const matchesTags =
              searchTags.length === 0 ||
              task.labels.some((label) => searchTags.includes(label.toLowerCase()));
            return matchesSearch && matchesTags;
          })
          .sort((a, b) => b.createdAt - a.createdAt);
      },
    }),
    {
      name: 'kanban-storage',
    }
  )
);

export const reorderTasks = useBoardStore.getState().reorderTasks;