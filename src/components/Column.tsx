import React from 'react';
import { Task } from '../store/board-store';
import { TaskCard } from './TaskCard';
import { Button } from '../components/ui/button';
import { MoreHorizontal, Trash, Plus } from 'lucide-react';
import { AddTaskDialog } from './AddTaskDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface ColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: Task[];
  onAddTask: (columnId: string, task: Omit<Task, 'id' | 'columnId' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'columnId'>>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateColumn: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
  onMoveTask: (taskId: string, sourceColumnId: string, direction: 'left' | 'right') => void;
  isFirstColumn: boolean;
  isLastColumn: boolean;
  columnIndex: number;
  totalColumns: number;
}

export function Column({
  column,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
  onMoveTask,
  isFirstColumn,
  isLastColumn,
  columnIndex,
  totalColumns,
}: ColumnProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(column.title);
  const [isAddingTask, setIsAddingTask] = React.useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleUpdate = () => {
    onUpdateColumn(column.id, title);
    setIsEditing(false);
  };

  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col overflow-hidden"
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        maxHeight: 'calc(100vh - 8rem)',
      }}
    >
      <div className="p-3 font-semibold flex items-center justify-between flex-shrink-0">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleUpdate}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        ) : (
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 truncate" onClick={() => setIsEditing(true)}>
            {column.title}
          </h2>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDeleteColumn(column.id)}>
              <Trash className="h-4 w-4 mr-2" />
              Eliminar Columna
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              sourceColumnId={column.id}
              onMoveTask={onMoveTask}
              canMoveLeft={columnIndex > 0}
              canMoveRight={columnIndex < totalColumns - 1}
            />
          ))}
        </div>
      </div>

      <div className="p-3 border-t dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-500 dark:text-gray-400"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar tarea
        </Button>

        <AddTaskDialog
          open={isAddingTask}
          onClose={() => setIsAddingTask(false)}
          onAddTask={(task) => onAddTask(column.id, task)}
        />
      </div>
    </div>
  );
}