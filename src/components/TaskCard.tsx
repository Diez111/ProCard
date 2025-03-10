import React from "react";
import { Task, ChecklistItem } from "../store/board-store";
import { useBoardStore } from "../store/board-store";
import { Button } from "./ui/button";
import {
  MoreHorizontal,
  Trash,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { TaskChecklist } from "./TaskChecklist";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { cn } from "../lib/utils";
import { MediaOrganizer } from "./MediaOptimizer";
import ReactPlayer from "react-player";

interface TaskCardProps {
  task: Task & {
    videoUrl?: string;
  };
  sourceColumnId: string;
  onUpdate: (id: string, task: Partial<Task & { videoUrl?: string }>) => void;
  onDelete: (id: string) => void;
  onMoveTask: (
    taskId: string,
    sourceColumnId: string,
    direction: "left" | "right",
  ) => void;
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
  canMoveRight,
}: TaskCardProps) {
  const { tagSearch } = useBoardStore();
  const searchTags = tagSearch
    .toLowerCase()
    .split(",")
    .map((tag) => tag.trim())
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
  const [editedDescription, setEditedDescription] = React.useState(
    task.description,
  );
  const [editedDate, setEditedDate] = React.useState(task.date || "");
  const [editedLabels, setEditedLabels] = React.useState(
    task.labels.join(", "),
  );
  const [editedChecklist, setEditedChecklist] = React.useState(
    task.checklist || [],
  );

  const [editedImageUrl, setEditedImageUrl] = React.useState(
    task.imageUrl || "",
  );
  const [editedVideoUrl, setEditedVideoUrl] = React.useState(
    task.videoUrl || "",
  );

  const handleSave = () => {
    const updatedTask = {
      title: editedTitle,
      description: editedDescription,
      date: editedDate,
      labels: editedLabels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean),
      imageUrl: editedImageUrl,
      videoUrl: editedVideoUrl,
      checklist: editedChecklist,
    };
    onUpdate(task.id, updatedTask);
    setIsEditing(false);
  };

  const handleDeleteImage = () => {
    setEditedImageUrl("");
  };

  const handleDeleteVideo = () => {
    setEditedVideoUrl("");
  };

  React.useEffect(() => {
    setEditedChecklist(task.checklist || []);
  }, [task.checklist]);

  const getAllItems = React.useCallback(
    (items: ChecklistItem[]): ChecklistItem[] => {
      return items.reduce((acc: ChecklistItem[], item) => {
        if (item.type === "group" && item.items) {
          return [...acc, ...getAllItems(item.items)];
        }
        return [...acc, item];
      }, []);
    },
    [],
  );

  const progress = React.useMemo(() => {
    if (!task.checklist?.length) return 0;
    const allItems = getAllItems(task.checklist);
    if (!allItems.length) return 0;

    const regularItems = allItems.filter((item) => item.type !== "group");
    if (!regularItems.length) return 0;

    const completed = regularItems.filter((item) => item.completed).length;
    return Math.min((completed / regularItems.length) * 100, 100);
  }, [task.checklist, getAllItems]);

  const getProgressColor = (progress: number) => {
    if (progress < 33) return "bg-red-500";
    if (progress < 66) return "bg-orange-500";
    return "bg-green-500";
  };

  const { completedCount, totalCount } = React.useMemo(() => {
    if (!task.checklist?.length) return { completedCount: 0, totalCount: 0 };
    const allItems = task.checklist.reduce((acc: ChecklistItem[], item) => {
      if (item.type === "group" && item.items) {
        return [...acc, ...getAllItems(item.items)];
      }
      return [...acc, item];
    }, []);
    return {
      completedCount: allItems.filter((item) => item.completed).length,
      totalCount: allItems.length,
    };
  }, [task.checklist, getAllItems]);

  return (
    <>
      <div
        className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-600 max-w-[95vw] transition-all duration-300 ease-in-out hover:shadow-xl cursor-pointer transform hover:-translate-y-1"
        onClick={() => setIsEditing(true)}
      >
        <div className="space-y-4">
          {task.imageUrl && (
            <div className="relative rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
              <img
                src={task.imageUrl}
                alt="Task media"
                className="w-full h-48 object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          )}
          {task.videoUrl && (
            <div className="relative rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
              <ReactPlayer
                url={task.videoUrl}
                width="100%"
                height="300px"
                controls={true}
                playing={false}
                light={true}
                className="rounded-xl"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-start gap-4 mt-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            {canMoveLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTask(task.id, sourceColumnId, "left");
                }}
              >
                <ChevronLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            )}
            {canMoveRight && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveTask(task.id, sourceColumnId, "right");
                }}
              >
                <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {task.imageUrl && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage();
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar imagen
                  </DropdownMenuItem>
                )}
                {task.videoUrl && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVideo();
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Eliminar video
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar Tarea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
            {task.description}
          </p>
        )}

        {task.checklist?.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    getProgressColor(progress),
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {completedCount} de {totalCount} completados
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          {task.date && (
            <div className="flex items-center text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              <Calendar className="h-3 w-3 mr-1.5" />
              {task.date}
            </div>
          )}
          {task.labels.map((label, index) => (
            <div
              key={index}
              className={`flex items-center text-xs ${getTagClassName(
                label,
              )} px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-shadow duration-200`}
            >
              <Tag className="h-3 w-3 mr-1.5" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="fixed inset-y-[5vh] left-[50%] translate-x-[-50%] translate-y-[-0%] w-[95vw] sm:w-[600px] max-w-4xl flex flex-col bg-white dark:bg-gray-900 max-h-[90vh] rounded-xl overflow-hidden shadow-2xl border dark:border-gray-700">
          <DialogHeader className="shrink-0 px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Editar Tarea
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-1 px-6 custom-scrollbar">
              <div className="space-y-8 py-6">
                {/* Sección Descripción */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b pb-2">
                    Descripción
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Título
                      </Label>
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Título de la tarea"
                        className="mt-1.5 block w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción
                      </Label>
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Descripción detallada"
                        className="mt-1.5 block w-full resize-none"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha
                      </Label>
                      <Input
                        type="date"
                        value={editedDate}
                        onChange={(e) => setEditedDate(e.target.value)}
                        className="mt-1.5 block w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección Etiquetas */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b pb-2">
                    Etiquetas
                  </h3>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Etiquetas separadas por comas
                    </Label>
                    <Input
                      value={editedLabels}
                      onChange={(e) => setEditedLabels(e.target.value)}
                      placeholder="ejemplo: diseño, frontend, bug"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Sección Multimedia */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b pb-2">
                    Multimedia
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Imagen
                      </Label>
                      <MediaOrganizer
                        mediaUrl={editedImageUrl}
                        onMediaChange={setEditedImageUrl}
                        maxSizeMB={2}
                        maxWidthOrHeight={1920}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Video de YouTube
                      </Label>
                      <MediaOrganizer
                        mediaUrl={editedVideoUrl}
                        onMediaChange={setEditedVideoUrl}
                        maxSizeMB={0}
                        maxWidthOrHeight={0}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección Checklist */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 border-b pb-2">
                    Checklist
                  </h3>
                  <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 shadow-inner">
                    <TaskChecklist
                      checklist={editedChecklist}
                      onUpdate={setEditedChecklist}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
              <DialogFooter className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="px-6 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar cambios
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
