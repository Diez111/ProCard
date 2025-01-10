import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column as ColumnType, Task } from '../store/board-store';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Props {
  column: ColumnType;
  tasks: Task[];
  onAddTask: (columnId: string, task: Omit<Task, 'id' | 'columnId'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateColumn: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
}

export function Column({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}: Props) {
  const [isNewTaskOpen, setIsNewTaskOpen] = React.useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = React.useState(false);
  const [isDeleteColumnOpen, setIsDeleteColumnOpen] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    labels: [] as string[],
  });
  const [editedTitle, setEditedTitle] = React.useState(column.title);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const handleAddTask = () => {
    onAddTask(column.id, newTask);
    setNewTask({ title: '', description: '', labels: [] });
    setIsNewTaskOpen(false);
  };

  const handleUpdateColumn = () => {
    onUpdateColumn(column.id, editedTitle);
    setIsEditColumnOpen(false);
  };

  const handleDeleteColumn = () => {
    onDeleteColumn(column.id);
    setIsDeleteColumnOpen(false);
  };

  return (
    <>
      <div className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg w-72 flex-shrink-0 h-full">
        <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 truncate">
            {column.title}
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditColumnOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsDeleteColumnOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        <div className="p-3 border-t dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsNewTaskOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Tarea
          </Button>
        </div>
      </div>

      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="labels">Etiquetas (separadas por comas)</Label>
              <Input
                id="labels"
                value={newTask.labels.join(', ')}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    labels: e.target.value.split(',').map((l) => l.trim()),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTask}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditColumnOpen} onOpenChange={setIsEditColumnOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Columna</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="columnTitle">Título</Label>
            <Input
              id="columnTitle"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditColumnOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateColumn}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteColumnOpen} onOpenChange={setIsDeleteColumnOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Columna</DialogTitle>
          </DialogHeader>
          <p>
            ¿Estás seguro de que quieres eliminar esta columna? Se eliminarán
            todas las tareas asociadas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteColumnOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteColumn}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}