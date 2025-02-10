import React from 'react';
import { Task, ChecklistItem } from '../store/board-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Image as ImageIcon, X } from 'lucide-react';
import { TaskChecklist } from './TaskChecklist';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'columnId' | 'createdAt'>) => void;
}

export function AddTaskDialog({ open, onClose, onAddTask }: AddTaskDialogProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState('');
  const [labels, setLabels] = React.useState<string[]>([]);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>([]);
  const [imageUrl, setImageUrl] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onAddTask({
      title: title || 'Nueva tarea',
      description,
      date,
      labels,
      checklist,
      imageUrl,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setLabels([]);
    setChecklist([]);
    setImageUrl('');
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="fixed inset-y-[5vh] left-[50%] translate-x-[-50%] translate-y-[-0%] w-[90vw] sm:w-[500px] flex flex-col bg-white dark:bg-slate-950 max-h-[90vh] overflow-hidden">
        <DialogHeader className="shrink-0 px-6 py-4 border-b">
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1 px-6">
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la tarea"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de la tarea"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <Input
                  value={labels.join(', ')}
                  onChange={(e) => setLabels(e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
                  placeholder="Etiquetas separadas por comas"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen</Label>
                <div className="flex flex-col gap-2">
                  {imageUrl && (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Task"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Checklist</Label>
                <div className="border rounded-lg p-4 overflow-hidden">
                  <TaskChecklist
                    checklist={checklist}
                    onUpdate={setChecklist}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t px-6 py-4 bg-white dark:bg-slate-950">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Crear tarea
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
