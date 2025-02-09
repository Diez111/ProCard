import React from 'react';
import { useBoardStore } from './store/board-store';
import { Column } from './components/Column';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { CaretDownIcon, CaretUpIcon, CaretRightIcon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Plus, Moon, Sun, Menu, X } from 'lucide-react';
import { Weather } from './components/Weather';

export default function App() {
  const {
    columns,
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

  // Cargar ubicación guardada al iniciar
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
      // Guardar ubicación en localStorage y ocultar barra de búsqueda
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
    const data = { columns: state.columns, tasks: state.tasks, googleCalendarUrl: state.googleCalendarUrl };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'kanban_data.json');
    a.click();
  };

  const handleImport = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.columns && importedData.tasks) {
          useBoardStore.setState({ 
            columns: importedData.columns, 
            tasks: importedData.tasks,
            googleCalendarUrl: importedData.googleCalendarUrl || ""
          });
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
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </header>

      <main className="h-[calc(100vh-4rem)] overflow-hidden">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden">
              <div 
                ref={columnsContainerRef}
                className="h-full overflow-hidden"
              >
                <div className="flex gap-4 h-full overflow-x-auto overflow-y-hidden">
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
          </div>
          <div className="hidden md:block w-full md:w-1/3 md:ml-4 mt-4 md:mt-0 h-screen">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg h-full flex flex-col space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2">Clima</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsWeatherSectionOpen(!isWeatherSectionOpen)}>
                  {isWeatherSectionOpen ? (
                    <CaretDownIcon className="h-5 w-5" />
                  ) : (
                    <CaretRightIcon className="h-5 w-5" />
                  )}
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
                  {isGoogleCalendarSectionOpen ? (
                    <CaretDownIcon className="h-5 w-5" />
                  ) : (
                    <CaretUpIcon className="h-5 w-5" />
                  )}
                </Button>
                {isGoogleCalendarSectionOpen && (
                  <div className="flex flex-col gap-2">
                    {googleCalendarUrl ? (
                      <>
                        <div className="h-[500px]">
                          <iframe
                            src={googleCalendarUrl}
                            className="w-full h-full border-0"
                            frameBorder="0"
                            scrolling="no"
                          ></iframe>
                        </div>
                        <Button 
                          onClick={() => { removeGoogleCalendarUrl(); setNewCalendarUrl(""); }} 
                          className="mt-2 px-3 py-1"
                        >
                          Eliminar Calendar
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Input
                          type="text"
                          placeholder="Ingresa la URL de tu Google Calendar"
                          value={newCalendarUrl}
                          onChange={(e) => setNewCalendarUrl(e.target.value)}
                        />
                        <Button onClick={() => {
                          if (newCalendarUrl.trim() === "") {
                            alert("Ingrese una URL válida");
                          } else {
                            setGoogleCalendarUrl(newCalendarUrl);
                          }
                        }}>
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
      {isMobileSideOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-200 dark:bg-gray-950 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Clima y Calendario</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileSideOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold mb-2">Clima</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsWeatherSectionOpen(!isWeatherSectionOpen)}>
                  {isWeatherSectionOpen ? (
                    <CaretDownIcon className="h-5 w-5" />
                  ) : (
                    <CaretRightIcon className="h-5 w-5" />
                  )}
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
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Google Calendar</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsGoogleCalendarSectionOpen(!isGoogleCalendarSectionOpen)}>
                  {isGoogleCalendarSectionOpen ? (
                    <CaretDownIcon className="h-5 w-5" />
                  ) : (
                    <CaretUpIcon className="h-5 w-5" />
                  )}
                </Button>
                {isGoogleCalendarSectionOpen && (
                  <div className="flex flex-col gap-2">
                    {googleCalendarUrl ? (
                      <>
                        <div className="h-[500px]">
                          <iframe
                            src={googleCalendarUrl}
                            className="w-full h-full border-0"
                            frameBorder="0"
                            scrolling="no"
                          ></iframe>
                        </div>
                        <Button 
                          onClick={() => { removeGoogleCalendarUrl(); setNewCalendarUrl(""); }} 
                          className="mt-2 px-3 py-1"
                        >
                          Eliminar Calendar
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Input
                          type="text"
                          placeholder="Ingresa la URL de tu Google Calendar"
                          value={newCalendarUrl}
                          onChange={(e) => setNewCalendarUrl(e.target.value)}
                        />
                        <Button onClick={() => {
                          if (newCalendarUrl.trim() === "") {
                            alert("Ingrese una URL válida");
                          } else {
                            setGoogleCalendarUrl(newCalendarUrl);
                          }
                        }}>
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
      )}
      <Dialog open={isNewColumnOpen} onOpenChange={setIsNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Columna</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Ingrese el título de la columna"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddColumn}>Agregar Columna</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}