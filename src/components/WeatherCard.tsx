import { WeatherData } from '../utils/weatherService';
import { Card } from './ui/card';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudDrizzle,
  Droplets,
  Wind,
  Thermometer
} from 'lucide-react';
import { Badge } from './ui/badge';

interface WeatherCardProps {
  weather: WeatherData;
  compact?: boolean;
}

export function WeatherCard({ weather, compact = false }: WeatherCardProps) {
  const getWeatherIcon = (condition: WeatherData['condition']) => {
    const iconClass = compact ? "w-6 h-6" : "w-8 h-8";
    
    switch (condition) {
      case 'sunny':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'partly-cloudy':
        return <Cloud className={`${iconClass} text-gray-400`} />;
      case 'cloudy':
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      case 'stormy':
        return <CloudDrizzle className={`${iconClass} text-blue-700`} />;
      case 'snowy':
        return <CloudSnow className={`${iconClass} text-blue-300`} />;
    }
  };

  const getConditionText = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'Sunny';
      case 'partly-cloudy':
        return 'Partly Cloudy';
      case 'cloudy':
        return 'Cloudy';
      case 'rainy':
        return 'Rainy';
      case 'stormy':
        return 'Stormy';
      case 'snowy':
        return 'Snowy';
    }
  };

  const getBackgroundClass = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-50 to-orange-50';
      case 'partly-cloudy':
        return 'from-blue-50 to-gray-50';
      case 'cloudy':
        return 'from-gray-50 to-gray-100';
      case 'rainy':
      case 'stormy':
        return 'from-blue-50 to-blue-100';
      case 'snowy':
        return 'from-blue-50 to-white';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br ${getBackgroundClass(weather.condition)} border border-gray-200`}>
        {getWeatherIcon(weather.condition)}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-900">{weather.temp.high}°</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-600">{weather.temp.low}°</span>
          </div>
          <p className="text-xs text-gray-600">{getConditionText(weather.condition)}</p>
        </div>
        {weather.isHistoricAverage && (
          <Badge variant="outline" className="text-xs">
            Avg
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`p-4 bg-gradient-to-br ${getBackgroundClass(weather.condition)}`}>
      <div className="flex items-start justify-between mb-4">
        {getWeatherIcon(weather.condition)}
        {weather.isHistoricAverage && (
          <Badge variant="outline" className="bg-white/80">
            Historic Average
          </Badge>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600 mb-1">{getConditionText(weather.condition)}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-gray-900">{weather.temp.high}°F</span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-gray-600">{weather.temp.low}°F</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200/50">
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">{weather.precipitation}%</span>
            <span className="text-xs text-gray-500">Rain</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Thermometer className="w-4 h-4 text-red-600" />
            <span className="text-xs text-gray-600">{weather.humidity}%</span>
            <span className="text-xs text-gray-500">Humidity</span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">{weather.windSpeed}</span>
            <span className="text-xs text-gray-500">mph</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
