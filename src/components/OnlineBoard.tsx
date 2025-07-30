import React from "react";
import * as supabaseApi from '../lib/supabaseApi';
import { getTasks } from '../lib/supabaseApi/task';
import { Column } from "./Column";
import { FloatingChatProvider } from "./FloatingChat";

// Definición de interfaces mínimas
interface Dashboard {
  id: string;
  name: string;
}
interface Column {
  id: string;
  dashboard_id: string;
  title: string;
  order: number;
}
interface Task {
  id: string;
  dashboard_id: string;
  column_id: string;
  title: string;
  description?: string;
  date?: string;
  image_url?: string;
  user_id: string;
}

export default function OnlineBoard({ user }: { user: { id: string; email: string } }) {
  const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = React.useState<string | null>(null);
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditingDashboard, setIsEditingDashboard] = React.useState(false);
  const [dashboardName, setDashboardName] = React.useState('');

  // Cargar tableros del usuario
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabaseApi.getDashboardsByUser(user.id)
      .then(({ data }) => {
        // data: [{dashboard_id, dashboards: {id, name, ...}}, ...]
        const boards = (data?.map((d: any) => d.dashboards).filter(Boolean) || []) as Dashboard[];
        setDashboards(boards);
        if (boards.length > 0) setSelectedDashboard(boards[0].id);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [user]);

  // Edición inline del nombre del dashboard
  React.useEffect(() => {
    if (!selectedDashboard) return;
    const dash = dashboards.find(d => d.id === selectedDashboard);
    setDashboardName(dash?.name || '');
  }, [selectedDashboard, dashboards]);

  // Cargar columnas, tareas al cambiar de tablero
  React.useEffect(() => {
    if (!selectedDashboard) return;
    setLoading(true);
    Promise.all([
      supabaseApi.getColumns(selectedDashboard).then(({ data }) => setColumns((data || []) as Column[])),
      getTasks(selectedDashboard).then(({ data }) => setTasks((data || []) as any[])),
    ]).then(() => setLoading(false))
      .catch(e => { setError(e.message); setLoading(false); });
  }, [selectedDashboard]);

  // Handlers CRUD
  async function handleCreateDashboard(name: string) {
    if (!name.trim()) return;
    const dashboard = await supabaseApi.createDashboard(name, user.id) as Dashboard;
    setDashboards(prev => [...prev, dashboard]);
    setSelectedDashboard(dashboard.id);
  }
  async function handleDeleteDashboard(id: string) {
    if (!id) return;
    await supabaseApi.deleteDashboard(id);
    setDashboards(prev => prev.filter(d => d.id !== id));
    if (selectedDashboard === id && dashboards.length > 1) {
      setSelectedDashboard(dashboards[0].id);
    }
  }
  async function handleAddColumn(title: string) {
    if (!title.trim() || !selectedDashboard) return;
    await supabaseApi.createColumn(selectedDashboard, title, columns.length);
    const { data } = await supabaseApi.getColumns(selectedDashboard);
    setColumns((data || []) as Column[]);
  }
  async function handleUpdateColumn(id: string, title: string) {
    await supabaseApi.updateColumn(id, { title });
    if (!selectedDashboard) return;
    const { data } = await supabaseApi.getColumns(selectedDashboard);
    setColumns((data || []) as Column[]);
  }
  async function handleDeleteColumn(id: string) {
    await supabaseApi.deleteColumn(id);
    if (!selectedDashboard) return;
    const { data } = await supabaseApi.getColumns(selectedDashboard);
    setColumns((data || []) as Column[]);
  }
  async function handleAddTask(columnId: string, task: Omit<Task, 'id' | 'columnId' | 'createdAt'>) {
    if (!selectedDashboard) return;
    await supabaseApi.createTask({
      dashboard_id: selectedDashboard,
      column_id: columnId,
      title: task.title || '',
      description: task.description || '',
      date: task.date,
      image_url: (task as any).imageUrl,
      user_id: user.id,
      // labels y checklist se gestionan aparte
    });
    const { data } = await getTasks(selectedDashboard);
    setTasks((data || []) as any[]);
  }
  async function handleUpdateTask(id: string, updates: Partial<Omit<Task, 'id' | 'columnId'>>) {
    await supabaseApi.updateTask(id, updates);
    if (!selectedDashboard) return;
    const { data } = await getTasks(selectedDashboard);
    setTasks((data || []) as any[]);
  }
  async function handleDeleteTask(id: string) {
    await supabaseApi.deleteTask(id);
    if (!selectedDashboard) return;
    const { data } = await getTasks(selectedDashboard);
    setTasks((data || []) as any[]);
  }
  async function handleMoveTask(taskId: string, sourceColumnId: string, direction: 'left' | 'right') {
    // Buscar el índice de la columna actual
    const colIdx = columns.findIndex(col => col.id === sourceColumnId);
    let targetColId = sourceColumnId;
    if (direction === 'left' && colIdx > 0) targetColId = columns[colIdx - 1].id;
    if (direction === 'right' && colIdx < columns.length - 1) targetColId = columns[colIdx + 1].id;
    await supabaseApi.updateTask(taskId, { column_id: targetColId });
    if (!selectedDashboard) return;
    const { data } = await getTasks(selectedDashboard);
    setTasks((data || []) as any[]);
  }
  async function handleUpdateDashboardName() {
    if (!selectedDashboard) return;
    await supabaseApi.updateDashboard(selectedDashboard, { name: dashboardName });
    // Refrescar dashboards
    const { data } = await supabaseApi.getDashboardsByUser(user.id);
    const boards = (data?.map((d: any) => d.dashboards).filter(Boolean) || []) as Dashboard[];
    setDashboards(boards);
    setIsEditingDashboard(false);
  }

  // Mapeo de tareas de Supabase a Task del store
  function mapTask(supabaseTask: any): import('../store/board-store').Task {
    return {
      id: supabaseTask.id,
      columnId: supabaseTask.column_id,
      title: supabaseTask.title,
      description: supabaseTask.description || '',
      labels: supabaseTask.labels || [],
      createdAt: supabaseTask.created_at ? new Date(supabaseTask.created_at).getTime() : Date.now(),
      date: supabaseTask.date,
      imageUrl: supabaseTask.image_url,
      checklist: supabaseTask.checklist || [],
    };
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando datos online...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  // Si no hay tableros
  if (!dashboards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div>No tienes tableros creados.</div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            const name = prompt('Nombre del tablero') || '';
            if (name.trim()) handleCreateDashboard(name);
          }}
        >Crear tablero</button>
      </div>
    );
  }

  // Si no hay columnas
  if (!columns.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div>No hay columnas en este tablero.</div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            const name = prompt('Nombre de la columna') || '';
            if (name.trim()) handleAddColumn(name);
          }}
        >Crear columna</button>
      </div>
    );
  }

  return (
    <FloatingChatProvider>
      <div className="min-h-screen bg-gray-200 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Selector de tableros y edición de nombre */}
        <div className="flex gap-2 p-2 items-center">
          <select value={selectedDashboard || ''} onChange={e => setSelectedDashboard(e.target.value)}>
            {dashboards.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {isEditingDashboard ? (
            <>
              <input
                className="border rounded px-2 py-1 text-sm"
                value={dashboardName}
                onChange={e => setDashboardName(e.target.value)}
                onBlur={handleUpdateDashboardName}
                onKeyDown={e => { if (e.key === 'Enter') handleUpdateDashboardName(); }}
                autoFocus
                style={{ width: 160 }}
              />
              <button className="ml-1 text-xs text-blue-600" onClick={handleUpdateDashboardName}>Guardar</button>
            </>
          ) : (
            <>
              <span className="font-semibold text-lg ml-2" onClick={() => setIsEditingDashboard(true)} style={{ cursor: 'pointer' }}>{dashboardName}</span>
              <button className="ml-1 text-xs text-blue-600" onClick={() => setIsEditingDashboard(true)}>Editar</button>
            </>
          )}
          <button
            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              const name = prompt('Nombre del tablero') || '';
              if (name.trim()) handleCreateDashboard(name);
            }}
          >Nuevo tablero</button>
          <button
            className="px-2 py-1 bg-red-600 text-white rounded"
            onClick={() => selectedDashboard && handleDeleteDashboard(selectedDashboard)}
            disabled={!selectedDashboard}
          >Eliminar tablero</button>
        </div>
        {/* Render de columnas y tareas */}
        <main className="h-[calc(100vh-4rem)] overflow-hidden">
          <div className="flex flex-col md:flex-row h-full overflow-hidden">
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-custom">
                <div className="flex gap-4 h-full min-w-fit pb-4">
                  {columns.map((col, idx) => (
                    <div key={col.id} className="flex-shrink-0 w-[85vw] md:w-72">
                      <Column
                        column={col}
                        tasks={tasks.filter(t => t.column_id === col.id).map(mapTask) as import('../store/board-store').Task[]}
                        onAddTask={(_colId, task) => handleAddTask(col.id, task as any)}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onUpdateColumn={handleUpdateColumn}
                        onDeleteColumn={handleDeleteColumn}
                        onMoveTask={handleMoveTask}
                        isFirstColumn={idx === 0}
                        isLastColumn={idx === columns.length - 1}
                        columnIndex={idx}
                        totalColumns={columns.length}
                      />
                      {/* Si no hay tareas en la columna, mensaje */}
                      {tasks.filter(t => t.column_id === col.id).length === 0 && (
                        <div className="text-center text-gray-400 mt-2">Sin tareas</div>
                      )}
                    </div>
                  ))}
                  <button className="px-2 py-1 bg-blue-500 text-white rounded h-fit self-start mt-2" onClick={() => {
                    const name = prompt('Nombre de la columna') || '';
                    if (name.trim()) handleAddColumn(name);
                  }}>Añadir columna</button>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* Barra inferior fija para dashboards */}
        <footer className="fixed bottom-0 left-0 w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-800 p-2 flex gap-2 items-center z-50">
          <select value={selectedDashboard || ''} onChange={e => setSelectedDashboard(e.target.value)} className="px-2 py-1 rounded">
            {dashboards.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button
            className="px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              const name = prompt('Nombre del tablero') || '';
              if (name.trim()) handleCreateDashboard(name);
            }}
          >Nuevo tablero</button>
          <button
            className="px-2 py-1 bg-red-600 text-white rounded"
            onClick={() => selectedDashboard && handleDeleteDashboard(selectedDashboard)}
            disabled={!selectedDashboard}
          >Eliminar tablero</button>
          <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">Tableros disponibles: {dashboards.length}</span>
        </footer>
      </div>
    </FloatingChatProvider>
  );
} 