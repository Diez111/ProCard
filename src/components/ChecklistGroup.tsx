import React from 'react';
import { ChecklistItem, Id } from '../store/board-store';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChecklistGroupProps {
  item: ChecklistItem;
  onUpdate: (updatedItem: ChecklistItem) => void;
  onDelete: () => void;
  level?: number;
}

export function ChecklistGroup({ item, onUpdate, onDelete, level = 0 }: ChecklistGroupProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(item.text);
  const [newItemText, setNewItemText] = React.useState('');

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSaveEdit = () => {
    if (editedText.trim()) {
      onUpdate({
        ...item,
        text: editedText.trim()
      });
      setIsEditing(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
      type: 'item'
    };
    onUpdate({
      ...item,
      items: [...(item.items || []), newItem]
    });
    setNewItemText('');
  };

  const handleAddSubgroup = () => {
    const newGroup: ChecklistItem = {
      id: crypto.randomUUID(),
      text: 'Nuevo Grupo',
      completed: false,
      type: 'group',
      items: []
    };
    onUpdate({
      ...item,
      items: [...(item.items || []), newGroup]
    });
  };

  const handleUpdateSubitem = (subitemId: Id, updatedSubitem: ChecklistItem) => {
    onUpdate({
      ...item,
      items: item.items?.map(subitem =>
        subitem.id === subitemId ? updatedSubitem : subitem
      )
    });
  };

  const handleDeleteSubitem = (subitemId: Id) => {
    onUpdate({
      ...item,
      items: item.items?.filter(subitem => subitem.id !== subitemId)
    });
  };

  const handleToggleComplete = (completed: boolean) => {
    onUpdate({
      ...item,
      completed,
      items: item.items?.map(subitem => ({
        ...subitem,
        completed
      }))
    });
  };

  return (
    <div className={cn("space-y-2", level > 0 && "ml-6")}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleToggleExpand}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <Input
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSaveEdit} size="sm">
              Guardar
            </Button>
          </div>
        ) : (
          <>
            <Checkbox
              checked={item.completed}
              onCheckedChange={handleToggleComplete}
            />
            <span className={cn("flex-1", item.completed && "line-through text-gray-500")}>
              {item.text}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-red-600"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <div className="overflow-y-auto max-h-[200px] space-y-2">
            {item.items?.map((subitem) => (
              <ChecklistGroup
                key={subitem.id}
                item={subitem}
                onUpdate={(updated) => handleUpdateSubitem(subitem.id, updated)}
                onDelete={() => handleDeleteSubitem(subitem.id)}
                level={level + 1}
              />
            ))}
          </div>

          <div className="flex gap-2 sticky bottom-0 bg-white dark:bg-slate-950 py-2">
            <Input
              placeholder="Nueva tarea"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddItem();
                }
              }}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddItem}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddSubgroup}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
