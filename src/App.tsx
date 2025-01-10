import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useBoardStore } from './store/board-store';
import { Column } from './components/Column';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Plus, Moon, Sun, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './components/ui/dialog';
import { Label } from './components/ui/label';

export default function App() {
  const {
    columns,
    darkMode,
    searchQuery,
    tagSearch,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleDarkMode,
    setSearchQuery,
    setTagSearch,
    getFilteredTasks,
  } = useBoardStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const [isNewColumnOpen, setIsNewColumnOpen] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState('');
  const [activeTask, setActiveTask] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    if (isOverAColumn) {
      moveTask(activeId as string, overId as string);
    }
    
    if (isOverATask) {
      const overTask = getFilteredTasks().find(t => t.id === overId);
      if (overTask) {
        moveTask(activeId as string, overTask.columnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsNewColumnOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="max-w-[2000px] mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-3 sm:py-4">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="flex-1 sm:w-64">
                <Input
                  type="search"
                  placeholder="Buscar tareas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1 sm:w-64 flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Filtrar por etiquetas..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="ml-auto sm:ml-0"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)] overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 p-4 h-full min-w-min">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={getFilteredTasks().filter((task) => task.columnId === column.id)}
                  onAddTask={addTask}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onUpdateColumn={updateColumn}
                  onDeleteColumn={deleteColumn}
                />
              ))}
              <div className="flex-shrink-0 w-72">
                <Button
                  variant="outline"
                  className="h-full min-h-[8rem] w-full"
                  onClick={() => setIsNewColumnOpen(true)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Añadir Columna
                </Button>
              </div>
            </div>
          </div>
        </DndContext>
      </main>

      <Dialog open={isNewColumnOpen} onOpenChange={setIsNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Columna</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="columnTitle">Título</Label>
            <Input
              id="columnTitle"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewColumnOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddColumn}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}