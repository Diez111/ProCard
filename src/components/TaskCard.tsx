import React from 'react';
import { Task, ChecklistItem } from '../store/board-store';
import { useBoardStore } from '../store/board-store';
import { Button } from './ui/button';
import { MoreHorizontal, Trash, Tag, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon, X, Plus, Check } from 'lucide-react';
import { TaskChecklist } from './TaskChecklist';
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
  const [editedChecklist, setEditedChecklist] = React.useState(task.checklist || []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const updatedTask = {
      title: editedTitle,
      description: editedDescription,
      date: editedDate,
      labels: editedLabels.split(',').map(label => label.trim()).filter(Boolean),
      imageUrl: task.imageUrl,
      checklist: editedChecklist,
    };
    onUpdate(task.id, updatedTask);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(task.id, {
          ...task,
          imageUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onUpdate(task.id, {
      ...task,
      imageUrl: undefined,
    });
  };

  React.useEffect(() => {
    setEditedChecklist(task.checklist || []);
  }, [task.checklist]);

  const getAllItems = (items: ChecklistItem[]): ChecklistItem[] => {
    return items.reduce((acc: ChecklistItem[], item) => {
      if (item.type === 'group' && item.items) {
        return [...acc, ...getAllItems(item.items)];
      }
      return [...acc, item];
    }, []);
  };

  const progress = React.useMemo(() => {
    if (!task.checklist?.length) return 0;
    const allItems = getAllItems(task.checklist);
    if (!allItems.length) return 0;
    
    const regularItems = allItems.filter(item => item.type !== 'group');
    if (!regularItems.length) return 0;
    
    const completed = regularItems.filter(item => item.completed).length;
    return Math.min((completed / regularItems.length) * 100, 100);
  }, [task.checklist]);

  const getProgressColor = (progress: number) => {
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const { completedCount, totalCount } = React.useMemo(() => {
    if (!task.checklist?.length) return { completedCount: 0, totalCount: 0 };
    const allItems = task.checklist.reduce((acc: ChecklistItem[], item) => {
      if (item.type === 'group' && item.items) {
        return [...acc, ...getAllItems(item.items)];
      }
      return [...acc, item];
    }, []);
    return {
      completedCount: allItems.filter(item => item.completed).length,
      totalCount: allItems.length
    };
  }, [task.checklist]);

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600 max-w-[95vw]"
        onClick={() => setIsEditing(true)}
      >
        {task.imageUrl && (
          <div className="mb-3">
            <img
              src={task.imageUrl}
              alt="Task"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}
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

        {task.checklist?.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    getProgressColor(progress)
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {completedCount} de {totalCount} completados
            </div>
          </div>
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
        <DialogContent className="fixed inset-y-[5vh] left-[50%] translate-x-[-50%] translate-y-[-0%] w-[90vw] sm:w-[600px] flex flex-col bg-white dark:bg-slate-950 max-h-[90vh] overflow-hidden">
          <DialogHeader className="shrink-0 px-6 py-4 border-b">
            <DialogTitle>Editar Tarea</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-1 px-6">
              <div className="space-y-6 py-4">
                {/* Sección Descripción */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Descripción</h3>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      placeholder="Título de la tarea"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Descripción detallada"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sección Etiquetas */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Etiquetas</h3>
                  <div className="space-y-2">
                    <Label>Etiquetas separadas por comas</Label>
                    <Input
                      value={editedLabels}
                      onChange={(e) => setEditedLabels(e.target.value)}
                      placeholder="ejemplo: diseño, frontend, bug"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center border rounded">
                        {task.imageUrl && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm">Subir imagen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {task.imageUrl ? 'Cambiar imagen' : 'Seleccionar archivo'}
                      </Button>
                      {task.imageUrl && (
                        <Button
                          variant="destructive"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                    {task.imageUrl && (
                      <img
                        src={task.imageUrl}
                        alt="Previsualización"
                        className="w-full h-32 object-contain rounded-lg border"
                      />
                    )}
                  </div>
                </div>

                {/* Sección Checklist */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm">Checklist</h3>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <TaskChecklist
                      checklist={editedChecklist}
                      onUpdate={setEditedChecklist}
                      showProgress={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t px-6 py-4 bg-white dark:bg-slate-950">
              <DialogFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Guardar cambios</Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}