import React from 'react';
import { ChecklistItem, Id } from '../store/board-store';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChecklistGroup } from './ChecklistGroup';

interface TaskChecklistProps {
  checklist: ChecklistItem[];
  onUpdate: (checklist: ChecklistItem[]) => void;
}

export function TaskChecklist({ checklist, onUpdate }: TaskChecklistProps) {
  const [newItemText, setNewItemText] = React.useState('');

  const getAllItems = (items: ChecklistItem[]): ChecklistItem[] => {
    return items.reduce((acc: ChecklistItem[], item) => {
      if (item.type === 'group' && item.items) {
        return [...acc, ...getAllItems(item.items)];
      }
      return [...acc, item];
    }, []);
  };

  const progress = React.useMemo(() => {
    if (checklist.length === 0) return 0;
    const allItems = getAllItems(checklist);
    if (!allItems.length) return 0;
    
    // Filtrar solo los items que no son grupos
    const regularItems = allItems.filter(item => item.type !== 'group');
    if (!regularItems.length) return 0;
    
    const completed = regularItems.filter(item => item.completed).length;
    // Asegurar que el progreso nunca exceda el 100%
    return Math.min((completed / regularItems.length) * 100, 100);
  }, [checklist]);

  const getProgressColor = (progress: number) => {
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const addGroup = () => {
    if (!newItemText.trim()) return;
    onUpdate([
      ...checklist,
      {
        id: crypto.randomUUID(),
        text: newItemText.trim(),
        completed: false,
        type: 'group',
        items: []
      }
    ]);
    setNewItemText('');
  };

  const updateGroup = (id: Id, updatedGroup: ChecklistItem) => {
    onUpdate(
      checklist.map(item =>
        item.id === id ? updatedGroup : item
      )
    );
  };

  const removeGroup = (id: Id) => {
    onUpdate(checklist.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                getProgressColor(progress)
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto">
        {checklist.map(item => (
          <ChecklistGroup
            key={item.id}
            item={item}
            onUpdate={(updated) => updateGroup(item.id, updated)}
            onDelete={() => removeGroup(item.id)}
          />
        ))}
      </div>

      <div className="flex gap-2 sticky bottom-0 bg-white dark:bg-slate-950 py-2">
        <Input
          placeholder="Nuevo grupo de tareas"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addGroup();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addGroup}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
