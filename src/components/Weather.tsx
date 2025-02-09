import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface WeatherProps {
  weatherLocation: string;
  setWeatherLocation: (location: string) => void;
  weatherData: any;
  isLoadingWeather: boolean;
  fetchWeather: (location: string) => void;
  handleClearWeather: () => void;
  getDayName: (date: string) => string;
}

export function Weather({
  weatherLocation,
  setWeatherLocation,
  weatherData,
  isLoadingWeather,
  fetchWeather,
  handleClearWeather,
  getDayName
}: WeatherProps) {
  const [showWeatherSearch, setShowWeatherSearch] = React.useState(true);

  React.useEffect(() => {
    const savedLocation = localStorage.getItem('weatherLocation');
    if (savedLocation) {
      setWeatherLocation(savedLocation);
      fetchWeather(savedLocation);
      setShowWeatherSearch(false);
    }
  }, []);

  const handleWeatherSubmit = async (location: string) => {
    await fetchWeather(location);
    localStorage.setItem('weatherLocation', location);
    setShowWeatherSearch(false);
  };

  const handleClear = () => {
    handleClearWeather();
    localStorage.removeItem('weatherLocation');
    setShowWeatherSearch(true);
  };

  return (
    <div className="flex flex-col gap-3">
      {showWeatherSearch ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ingrese ubicación..."
            value={weatherLocation}
            onChange={(e) => setWeatherLocation(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleWeatherSubmit(weatherLocation);
              }
            }}
          />
          <Button 
            onClick={() => handleWeatherSubmit(weatherLocation)}
            disabled={isLoadingWeather}
          >
            {isLoadingWeather ? 'Cargando...' : 'Buscar'}
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-2 rounded">
          <span className="text-sm font-medium">{weatherLocation}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="px-2 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {weatherData && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-2xl font-semibold mb-1">{weatherData.temp}°C</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{weatherData.desc}</p>
          {weatherData.forecast && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Pronóstico de 3 días</h4>
              <div className="flex space-x-2 overflow-x-auto">
                {weatherData.forecast.slice(0, 3).map((day: any, index: number) => (
                  <div key={index} className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
                    <p className="text-lg font-semibold capitalize">{getDayName(day.date)}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{day.hourly[0].weatherDesc[0].value}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Máx: {day.maxtempC}°C<br />Mín: {day.mintempC}°C</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
