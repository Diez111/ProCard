// App.tsx
import React from "react";
import { useBoardStore } from "./store/board-store";
import { Column } from "./components/Column";
import { FloatingChatProvider } from "./components/FloatingChat";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabaseClient";
import OnlineBoard from './components/OnlineBoard';

export default function App() {
  const selectedDashboard = useBoardStore((state) => state.selectedDashboard);
  const columns = useBoardStore((state) => state.boards[selectedDashboard]?.columns || []);
  const dashboardNames = useBoardStore((state) => state.dashboardNames);
  const dashboards = Object.keys(dashboardNames);
  const tasks = useBoardStore((state) => state.boards[selectedDashboard]?.tasks || []);
  const {
    getFilteredTasks,
    mode,
    setMode,
    createDashboard,
    selectDashboard,
    editDashboardName,
    deleteDashboard,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoardStore();

  const [user, setUser] = React.useState<any>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [isEditingDashboard, setIsEditingDashboard] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState('');

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoadingUser(false);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    setDashboardName(dashboardNames[selectedDashboard] || '');
  }, [selectedDashboard, dashboardNames]);

  if (loadingUser) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  if (!user) return <Auth onAuth={() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }} />;

  if (mode === 'online') {
    return <OnlineBoard user={user} />;
  }

  // Handlers locales
  const handleCreateDashboard = () => {
    const name = prompt('Nombre del tablero') || '';
    if (name.trim()) createDashboard(name);
  };
  const handleEditDashboardName = () => {
    if (!selectedDashboard) return;
    editDashboardName(selectedDashboard, dashboardName);
    setIsEditingDashboard(false);
  };
  const handleDeleteDashboard = () => {
    if (!selectedDashboard) return;
    if (window.confirm('¿Seguro que quieres eliminar este tablero?')) {
      deleteDashboard(selectedDashboard);
    }
  };
  const handleAddColumn = () => {
    const name = prompt('Nombre de la columna') || '';
    if (name.trim()) addColumn(name);
  };

  // Render local Trello-like
  return (
    <FloatingChatProvider>
      <div className="min-h-screen bg-gray-200 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Barra superior */}
        <header className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-800 sticky top-0 z-50">
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="px-2 py-1 rounded">
            <option value="local">Local</option>
            <option value="online">Online</option>
          </select>
          <select value={selectedDashboard || ''} onChange={e => selectDashboard(e.target.value)} className="px-2 py-1 rounded">
            {dashboards.map(id => (
              <option key={id} value={id}>{dashboardNames[id]}</option>
            ))}
          </select>
          {isEditingDashboard ? (
            <>
              <input
                className="border rounded px-2 py-1 text-sm"
                value={dashboardName}
                onChange={e => setDashboardName(e.target.value)}
                onBlur={handleEditDashboardName}
                onKeyDown={e => { if (e.key === 'Enter') handleEditDashboardName(); }}
                autoFocus
                style={{ width: 160 }}
              />
              <button className="ml-1 text-xs text-blue-600" onClick={handleEditDashboardName}>Guardar</button>
            </>
          ) : (
            <>
              <span className="font-semibold text-lg ml-2" onClick={() => setIsEditingDashboard(true)} style={{ cursor: 'pointer' }}>{dashboardName}</span>
              <button className="ml-1 text-xs text-blue-600" onClick={() => setIsEditingDashboard(true)}>Editar</button>
            </>
          )}
          <button className="ml-2 px-2 py-1 bg-blue-600 text-white rounded" onClick={handleCreateDashboard}>Nuevo tablero</button>
          <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={handleDeleteDashboard} disabled={!selectedDashboard}>Eliminar tablero</button>
          <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={handleAddColumn}>Añadir columna</button>
        </header>
        {/* Render principal */}
        <main className="h-[calc(100vh-4rem)] overflow-hidden">
          {/* Si no hay tableros */}
          {dashboards.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <div>No tienes tableros creados.</div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCreateDashboard}>Crear tablero</button>
            </div>
          )}
          {/* Si no hay columnas */}
          {dashboards.length > 0 && columns.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
              <div>No hay columnas en este tablero.</div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAddColumn}>Crear columna</button>
            </div>
          )}
          {/* Render de columnas y tareas */}
          {columns.length > 0 && (
            <div className="flex flex-col md:flex-row h-full overflow-hidden">
              <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-custom">
                  <div className="flex gap-4 h-full min-w-fit pb-4">
                    {columns.map((column: any, index: number) => (
                      <div key={column.id} className="flex-shrink-0 w-[85vw] md:w-72">
                        <Column
                          column={column}
                          tasks={tasks.filter((task: any) => task.columnId === column.id)}
                          onAddTask={(colId, task) => addTask(colId, task)}
                          onUpdateTask={updateTask}
                          onDeleteTask={deleteTask}
                          onUpdateColumn={updateColumn}
                          onDeleteColumn={deleteColumn}
                          onMoveTask={moveTask}
                          isFirstColumn={index === 0}
                          isLastColumn={index === columns.length - 1}
                          columnIndex={index}
                          totalColumns={columns.length}
                        />
                        {/* Si no hay tareas en la columna, mensaje */}
                        {tasks.filter((task: any) => task.columnId === column.id).length === 0 && (
                          <div className="text-center text-gray-400 mt-2">Sin tareas</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </FloatingChatProvider>
  );
}
