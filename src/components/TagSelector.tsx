import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useLabelStore } from "../store/label-store";

interface TagSelectorProps {
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagChange }: TagSelectorProps) {
  const { labels } = useLabelStore();
  const [open, setOpen] = useState(false);

  const handleTagToggle = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter((name) => name !== tagName)
      : [...selectedTags, tagName];
    onTagChange(newTags);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <span>Etiquetas</span>
          {selectedTags.length > 0 && (
            <span className="ml-2 text-muted-foreground">
              ({selectedTags.length} seleccionadas)
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4">
        <Label>Seleccionar etiquetas</Label>
        <div className="space-y-2">
          {Object.values(labels).map((label) => (
            <div key={label.name} className="flex items-center gap-3">
              <Checkbox
                id={label.name}
                checked={selectedTags.includes(label.name)}
                onCheckedChange={() => handleTagToggle(label.name)}
              />
              <div className="flex-1 flex items-center gap-2">
                <div 
                  className="h-5 w-5 rounded-full" 
                  style={{ backgroundColor: label.color }}
                />
                <label
                  htmlFor={label.name}
                  className="text-sm font-medium leading-none"
                >
                  {label.name}
                </label>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
