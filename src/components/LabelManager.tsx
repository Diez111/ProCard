import { useState } from "react";
import { useLabelStore } from "../store/label-store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ColorPicker from "./ColorPicker";
import { Star } from "lucide-react";
import { cn } from "../lib/utils";

export default function LabelManager() {
  const [newLabel, setNewLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const { 
    labels, 
    addLabel, 
    updateLabel, 
    deleteLabel, 
    togglePinLabel,
    getPinnedLabels
  } = useLabelStore();

  const pinnedLabels = getPinnedLabels();

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    
    addLabel({
      name: newLabel,
      color: selectedColor
    });
    
    setNewLabel("");
    setSelectedColor("#3b82f6");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Nueva etiqueta"
        />
        <ColorPicker color={selectedColor} onChange={setSelectedColor} />
        <Button onClick={handleAddLabel}>Agregar</Button>
      </div>

      <div className="space-y-2">
        {/* Mostrar etiquetas fijadas primero */}
        {pinnedLabels.map((label) => (
          <LabelItem 
            key={label.name}
            label={label}
            isPinned={true}
            onEdit={(newName, newColor) => updateLabel(label.name, {
              name: newName,
              color: newColor
            })}
            onDelete={() => deleteLabel(label.name)}
            onTogglePin={() => togglePinLabel(label.name)}
          />
        ))}

        {/* Mostrar el resto de las etiquetas */}
        {Object.values(labels)
          .filter(label => !pinnedLabels.includes(label))
          .sort((a, b) => b.usageCount - a.usageCount)
          .map((label) => (
            <LabelItem
              key={label.name}
              label={label}
              isPinned={false}
              onEdit={(newName, newColor) => updateLabel(label.name, {
                name: newName,
                color: newColor
              })}
              onDelete={() => deleteLabel(label.name)}
              onTogglePin={() => togglePinLabel(label.name)}
            />
          ))}
      </div>
    </div>
  );
}

interface LabelItemProps {
  label: {
    name: string;
    color: string;
    usageCount: number;
  };
  isPinned: boolean;
  onEdit: (name: string, color: string) => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

function LabelItem({ label, isPinned, onEdit, onDelete, onTogglePin }: LabelItemProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(label.name);
  const [newColor, setNewColor] = useState(label.color);

  const handleSave = () => {
    onEdit(newName, newColor);
    setEditing(false);
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800",
      isPinned && "bg-gray-50 dark:bg-gray-800"
    )}>
      <div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: label.color }}
      />
      
      {editing ? (
        <div className="flex-1 flex gap-2 items-center">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
          <ColorPicker 
            color={newColor}
            onChange={setNewColor}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-2">
          <span>{label.name}</span>
          <span className="text-sm text-muted-foreground">
            ({label.usageCount} usos)
          </span>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onTogglePin}
      >
        <Star 
          className={cn(
            "w-4 h-4",
            isPinned ? "fill-yellow-400 stroke-yellow-400" : "stroke-gray-400"
          )}
        />
      </Button>

      {editing ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
        >
          Guardar
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
        >
          Editar
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
      >
        Eliminar
      </Button>
    </div>
  );
}
