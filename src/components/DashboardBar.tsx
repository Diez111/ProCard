import React, { useState } from "react";
import { useBoardStore } from "../store/board-store";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Pencil, Trash2, Plus, Check } from "lucide-react";
import "./DashboardBar.css";

const DashboardBar: React.FC = () => {
  const [newDashboardName, setNewDashboardName] = useState("");
  const [editName, setEditName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const {
    dashboardNames,
    selectedDashboard,
    createDashboard,
    selectDashboard,
    editDashboardName,
    deleteDashboard,
  } = useBoardStore();

  const handleAddDashboard = () => {
    if (newDashboardName.trim() === "") return;
    createDashboard(newDashboardName.trim());
    setNewDashboardName("");
  };

  const startEditing = (id: string, name: string) => {
    setEditId(id);
    setEditName(name);
  };

  const finishEditing = (id: string) => {
    if (editName.trim() !== "") {
      editDashboardName(id, editName.trim());
    }
    setEditId(null);
    setEditName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      finishEditing(id);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-custom">
        {Object.entries(dashboardNames).map(([id, name]) => (
          <div
            key={id}
            className={`
              group flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer
              transition-all duration-200 min-w-[150px] relative
              ${
                selectedDashboard === id
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              }
            `}
            onClick={() => selectDashboard(id)}
          >
            {editId === id ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => finishEditing(id)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  className="h-8 text-gray-900 dark:text-white bg-opacity-90"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => finishEditing(id)}
                  className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 font-medium truncate">{name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute right-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(id, name);
                    }}
                    className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {id !== "default" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDashboard(id);
                      }}
                      className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Nombre del nuevo dashboard"
          value={newDashboardName}
          onChange={(e) => setNewDashboardName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddDashboard();
          }}
          className="flex-1 h-10"
        />
        <Button
          onClick={handleAddDashboard}
          className="gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Agregar
        </Button>
      </div>
    </div>
  );
};

export default DashboardBar;
