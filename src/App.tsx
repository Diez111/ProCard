// App.tsx
import React from 'react';
import { useBoardStore } from './store/board-store';
import { Column } from './components/Column';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Plus, Moon, Sun, Menu, X } from 'lucide-react';
import { Weather } from './components/Weather';
import DashboardBar from './components/DashboardBar';

export default function App() {
  const selectedDashboard = useBoardStore((state) => state.selectedDashboard);
  const columns = useBoardStore((state) => 
    state.boards[selectedDashboard]?.columns || []
  );

  const {
    darkMode,
    searchQuery,
    googleCalendarUrl,
    setGoogleCalendarUrl,
    removeGoogleCalendarUrl,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleDarkMode,
    setSearchQuery,
    getFilteredTasks,
  } = useBoardStore();

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const [isNewColumnOpen, setIsNewColumnOpen] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState('');

  const [weatherData, setWeatherData] = React.useState<{temp?: string, desc?: string, forecast?: any} | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = React.useState(false);
  const [weatherLocation, setWeatherLocation] = React.useState<string>("");

  React.useEffect(() => {
    const savedLocation = localStorage.getItem('weatherLocation');
    if (savedLocation) {
      setWeatherLocation(savedLocation);
      fetchWeather(savedLocation);
    }
  }, []);

  const [newCalendarUrl, setNewCalendarUrl] = React.useState('');
  const [isWeatherSectionOpen, setIsWeatherSectionOpen] = React.useState(true);
  const [isGoogleCalendarSectionOpen, setIsGoogleCalendarSectionOpen] = React.useState(true);
  const [isMobileSideOpen, setIsMobileSideOpen] = React.useState(false);
  const columnsContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  const fetchWeather = async (location: string) => {
    if (!location.trim()) {
      alert('Por favor ingrese una ubicación');
      return;
    }
    setIsLoadingWeather(true);
    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(location.trim())}?format=j1&lang=es`);
      const data = await response.json();
      setWeatherData({
        temp: data.current_condition[0].temp_C,
        desc: data.current_condition[0].weatherDesc[0].value,
        forecast: data.weather,
      });
      localStorage.setItem('weatherLocation', location);
    } catch (error) {
      console.error('Error fetching weather:', error);
      alert('Error al obtener el clima. Por favor intente de nuevo.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleExport = () => {
    const state = useBoardStore.getState();
    const data = {
      boards: state.boards,
      dashboardNames: state.dashboardNames,
      selectedDashboard: state.selectedDashboard,
      darkMode: state.darkMode,
      searchQuery: state.searchQuery,
      tagSearch: state.tagSearch,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'kanban_data.json');
    a.click();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (
          importedData.boards &&
          importedData.dashboardNames &&
          importedData.selectedDashboard !== undefined &&
          importedData.darkMode !== undefined &&
          importedData.searchQuery !== undefined &&
          importedData.tagSearch !== undefined
        ) {
          useBoardStore.setState(importedData);
        } else {
          alert('Formato incorrecto de importación');
        }
      } catch (err) {
        alert('Error al importar datos');
      }
    };
    reader.readAsText(file);
  };

  const handleMoveTask = (taskId: string, sourceColumnId: string, direction: 'left' | 'right') => {
    const columnIndex = columns.findIndex(col => col.id === sourceColumnId);
    if (columnIndex === -1) return;

    const targetColumnIndex = direction === 'left' ? columnIndex - 1 : columnIndex + 1;
    if (targetColumnIndex < 0 || targetColumnIndex >= columns.length) return;

    const targetColumnId = columns[targetColumnIndex].id;
    const task = getFilteredTasks().find(t => t.id === taskId);
    if (!task) return;

    moveTask(taskId, targetColumnId);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsNewColumnOpen(false);
    }
  };

  const handleGoogleCalendarUrl = (url: string) => {
    if (!url.trim()) {
      alert("Por favor ingrese una URL válida");
      return;
    }

    try {
      // Validar y formatear la URL del calendario
      let formattedUrl = url;
      
      // Si es una URL de calendario público
      if (url.includes('calendar.google.com/calendar/u/0/embed')) {
        formattedUrl = url;
      } 
      // Si es una URL de calendario compartido (formato antiguo)
      else if (url.includes('calendar.google.com/calendar/embed')) {
        formattedUrl = url;
      }
      // Si es una URL de ID de calendario
      else if (url.match(/[\w-]+@group\.calendar\.google\.com/)) {
        formattedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(url)}`;
      }
      // Si es una URL no válida
      else {
        throw new Error('Formato de URL no válido');
      }

      setGoogleCalendarUrl(formattedUrl);
      setNewCalendarUrl('');
    } catch (error) {
      alert("Por favor ingrese una URL válida de Google Calendar. Puede obtenerla desde la configuración de su calendario en 'Integrar calendario' > 'Insertar calendario'");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-10 bg-gray-200 dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        <div className="max-w-[2000px] mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="w-full sm:w-auto flex-grow">
              <Input
                type="search"
                placeholder="Buscar tareas o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-md"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="block md:hidden"
                onClick={() => setIsMobileSideOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button onClick={handleImport} className="px-3 py-1">Importar</Button>
              <Button onClick={handleExport} className="px-3 py-1">Exportar</Button>
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </header>

      <main className="h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden flex flex-col">
            <div ref={columnsContainerRef} className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-4 h-full min-w-fit pb-4">
                {columns.map((column, index) => (
                  <div key={column.id} className="flex-shrink-0 w-[85vw] md:w-72">
                    <Column
                      column={column}
                      tasks={getFilteredTasks().filter((task) => task.columnId === column.id)}
                      onAddTask={addTask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onUpdateColumn={updateColumn}
                      onDeleteColumn={deleteColumn}
                      onMoveTask={handleMoveTask}
                      isFirstColumn={index === 0}
                      isLastColumn={index === columns.length - 1}
                    />
                  </div>
                ))}
                <div className="flex-shrink-0 w-[85vw] md:w-72">
                  <Button
                    variant="outline"
                    className="h-full min-h-[8rem] w-full"
                    onClick={() => setIsNewColumnOpen(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Añadir Columna
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <DashboardBar />
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden md:block w-full md:w-1/3 md:ml-4 mt-4 md:mt-0 h-screen">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg h-full flex flex-col space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2">Clima</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsWeatherSectionOpen(!isWeatherSectionOpen)}>
                  {isWeatherSectionOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
                {isWeatherSectionOpen && (
                  <Weather
                    weatherLocation={weatherLocation}
                    setWeatherLocation={setWeatherLocation}
                    weatherData={weatherData}
                    isLoadingWeather={isLoadingWeather}
                    fetchWeather={fetchWeather}
                    handleClearWeather={() => {
                      setWeatherData(null);
                      setWeatherLocation('');
                    }}
                    getDayName={getDayName}
                  />
                )}
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <h3 className="text-lg font-semibold mb-2">Google Calendar</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsGoogleCalendarSectionOpen(!isGoogleCalendarSectionOpen)}>
                  {isGoogleCalendarSectionOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                </Button>
                {isGoogleCalendarSectionOpen && (
                  <div className="flex flex-col gap-2">
                    {googleCalendarUrl ? (
                      <>
                        <div className="h-[500px] relative">
                          <iframe
                            src={googleCalendarUrl}
                            className="w-full h-full border-0 rounded-lg"
                            frameBorder="0"
                            scrolling="no"
                            title="Google Calendar"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                          ></iframe>
                        </div>
                        <Button 
                          onClick={() => { removeGoogleCalendarUrl(); setNewCalendarUrl(''); }} 
                          className="mt-2 px-3 py-1"
                          variant="destructive"
                        >
                          Eliminar Calendar
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="calendar-url">URL del Calendario</Label>
                          <Input
                            id="calendar-url"
                            type="text"
                            placeholder="Pegue la URL de Google Calendar"
                            value={newCalendarUrl}
                            onChange={(e) => setNewCalendarUrl(e.target.value)}
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Para obtener la URL, vaya a la configuración de su calendario de Google, 
                            seleccione 'Integrar calendario' y copie la URL del iframe.
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleGoogleCalendarUrl(newCalendarUrl)}
                          className="w-full"
                        >
                          Añadir Calendar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar */}
      {isMobileSideOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-200 dark:bg-gray-950 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Clima y Calendario</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSideOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Clima</h3>
                <Weather
                  weatherLocation={weatherLocation}
                  setWeatherLocation={setWeatherLocation}
                  weatherData={weatherData}
                  isLoadingWeather={isLoadingWeather}
                  fetchWeather={fetchWeather}
                  handleClearWeather={() => {
                    setWeatherData(null);
                    setWeatherLocation('');
                  }}
                  getDayName={getDayName}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Google Calendar</h3>
                {googleCalendarUrl ? (
                  <div className="h-[300px]">
                    <iframe
                      src={googleCalendarUrl}
                      className="w-full h-full border-0"
                      frameBorder="0"
                      scrolling="no"
                    ></iframe>
                  </div>
                ) : (
                  <Input
                    type="text"
                    placeholder="URL de Google Calendar"
                    value={newCalendarUrl}
                    onChange={(e) => setNewCalendarUrl(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Column Dialog */}
      <Dialog open={isNewColumnOpen} onOpenChange={setIsNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Columna</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="columnName">Nombre de la columna</Label>
              <Input
                id="columnName"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Ej: En progreso"
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewColumnOpen(false);
                setNewColumnTitle('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddColumn}
              disabled={!newColumnTitle.trim()}
            >
              Crear Columna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}