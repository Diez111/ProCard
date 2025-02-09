import React from 'react';
import { Task } from '../store/board-store';
import { useBoardStore } from '../store/board-store';
import { Button } from './ui/button';
import { MoreHorizontal, Trash, Tag, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  sourceColumnId: string;
  onUpdate: (id: string, task: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onMoveTask: (taskId: string, sourceColumnId: string, direction: 'left' | 'right') => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

export function TaskCard({ 
  task, 
  sourceColumnId, 
  onUpdate, 
  onDelete,
  onMoveTask,
  canMoveLeft,
  canMoveRight 
}: TaskCardProps) {
  const { tagSearch } = useBoardStore();
  const searchTags = tagSearch
    .toLowerCase()
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

  const getTagClassName = (label: string) => {
    const isHighlighted = searchTags.includes(label.toLowerCase());
    return `px-2 py-0.5 text-xs rounded-full ${
      isHighlighted
        ? "bg-blue-500 text-white dark:bg-blue-600"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
    }`;
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(task.title);
  const [editedDescription, setEditedDescription] = React.useState(task.description);
  const [editedDate, setEditedDate] = React.useState(task.date || '');
  const [editedLabels, setEditedLabels] = React.useState(task.labels.join(', '));

  const handleSave = () => {
    onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription,
      date: editedDate,
      labels: editedLabels.split(',').map(label => label.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };



  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 max-w-[95vw]"
        onClick={() => setIsEditing(true)}
      >
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-gray-700 dark:text-gray-200">
            {task.title}
          </h3>
          <div className="flex items-center gap-1">
            {canMoveLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTask(task.id, sourceColumnId, 'left');
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canMoveRight && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTask(task.id, sourceColumnId, 'right');
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}>
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar Tarea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          {task.date && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {task.date}
            </div>
          )}
          {task.labels.map((label, index) => (
            <div
              key={index}
              className={`flex items-center text-xs ${getTagClassName(label)} px-2 py-1 rounded`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labels">Etiquetas (separadas por coma)</Label>
              <Input
                id="labels"
                value={editedLabels}
                onChange={(e) => setEditedLabels(e.target.value)}
                placeholder="diseño, frontend, bug"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}