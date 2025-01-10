import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../store/board-store';
import { useBoardStore } from '../store/board-store';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
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
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const { tagSearch } = useBoardStore();
  const searchTags = tagSearch
    .toLowerCase()
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

  const getTagClassName = (label: string) => {
    const isHighlighted = searchTags.includes(label.toLowerCase());
    return cn(
      "px-2 py-0.5 text-xs rounded-full",
      isHighlighted
        ? "bg-blue-500 text-white dark:bg-blue-600"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    );
  };

  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editedTask, setEditedTask] = React.useState(task);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (!editedTask.title.trim() || !editedTask.description.trim()) {
      return;
    }
    onUpdate(task.id, editedTask);
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-medium">{task.title}</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
            {task.description}
          </p>
        )}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labels.map((label, index) => (
              <span
                key={index}
                className={getTagClassName(label)}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="labels">Etiquetas (separadas por comas)</Label>
              <Input
                id="labels"
                value={editedTask.labels.join(', ')}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    labels: e.target.value.split(',').map((l) => l.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!editedTask.title.trim() || !editedTask.description.trim()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tarea</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que quieres eliminar esta tarea?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}