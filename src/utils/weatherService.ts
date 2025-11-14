// Mock weather service that simulates realistic weather data
// In production, this would call a real weather API like OpenWeatherMap or WeatherAPI

import { weatherCache } from './weatherCache';

export interface WeatherData {
  date: string;
  temp: {
    high: number;
    low: number;
    feelsLike?: number;
  };
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  precipitation: number; // percentage
  humidity: number; // percentage
  windSpeed: number; // mph
  isHistoricAverage: boolean;
  daysUntil: number;
  hourlyForecast?: Array<{
    time: string;
    temp: number;
    condition: string;
    precipitation: number;
  }>;
  uvIndex?: number;
  visibility?: number;
  sunrise?: string;
  sunset?: string;
}

// Climate data for different cities (simplified)
const cityClimateData: Record<string, {
  summer: { high: number; low: number; rain: number };
  winter: { high: number; low: number; rain: number };
  spring: { high: number; low: number; rain: number };
  fall: { high: number; low: number; rain: number };
}> = {
  'Paris, France': {
    summer: { high: 77, low: 59, rain: 20 },
    winter: { high: 45, low: 37, rain: 50 },
    spring: { high: 59, low: 46, rain: 40 },
    fall: { high: 63, low: 50, rain: 45 }
  },
  'Tokyo, Japan': {
    summer: { high: 86, low: 75, rain: 40 },
    winter: { high: 50, low: 39, rain: 30 },
    spring: { high: 64, low: 52, rain: 50 },
    fall: { high: 70, low: 59, rain: 45 }
  },
  'New York, USA': {
    summer: { high: 84, low: 70, rain: 35 },
    winter: { high: 39, low: 28, rain: 40 },
    spring: { high: 61, low: 48, rain: 45 },
    fall: { high: 64, low: 52, rain: 40 }
  },
  'London, UK': {
    summer: { high: 73, low: 59, rain: 35 },
    winter: { high: 46, low: 39, rain: 55 },
    spring: { high: 57, low: 45, rain: 45 },
    fall: { high: 59, low: 48, rain: 50 }
  },
  'Barcelona, Spain': {
    summer: { high: 82, low: 70, rain: 15 },
    winter: { high: 57, low: 45, rain: 30 },
    spring: { high: 66, low: 54, rain: 25 },
    fall: { high: 72, low: 61, rain: 35 }
  },
  'Dubai, UAE': {
    summer: { high: 106, low: 86, rain: 5 },
    winter: { high: 75, low: 61, rain: 10 },
    spring: { high: 91, low: 73, rain: 8 },
    fall: { high: 93, low: 75, rain: 7 }
  },
  'Sydney, Australia': {
    summer: { high: 79, low: 66, rain: 30 },
    winter: { high: 61, low: 48, rain: 40 },
    spring: { high: 72, low: 59, rain: 35 },
    fall: { high: 72, low: 61, rain: 40 }
  },
  'Rome, Italy': {
    summer: { high: 88, low: 66, rain: 15 },
    winter: { high: 55, low: 41, rain: 40 },
    spring: { high: 68, low: 52, rain: 30 },
    fall: { high: 73, low: 57, rain: 35 }
  }
};

function getSeason(date: Date): 'summer' | 'winter' | 'spring' | 'fall' {
  const month = date.getMonth();
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 11 || month <= 1) return 'winter'; // Dec-Feb
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  return 'fall'; // Sep-Nov
}

function getConditionFromTemp(temp: number, rain: number, season: 'summer' | 'winter' | 'spring' | 'fall'): WeatherData['condition'] {
  if (rain > 60) return 'rainy';
  if (rain > 40) return 'cloudy';
  if (season === 'winter' && temp < 35 && rain > 30) return 'snowy';
  if (rain > 25) return 'partly-cloudy';
  return 'sunny';
}

function addVariation(base: number, variationPercent: number = 10): number {
  const variation = base * (variationPercent / 100);
  return Math.round(base + (Math.random() - 0.5) * 2 * variation);
}

async function getCoordinates(cityName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

function mapWeatherAPIToCondition(code: number): WeatherData['condition'] {
  if (code === 1000) return 'sunny';
  if ([1003, 1006].includes(code)) return 'partly-cloudy';
  if ([1009, 1030, 1135, 1147].includes(code)) return 'cloudy';
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'rainy';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return 'snowy';
  return 'partly-cloudy';
}

function mapOpenWeatherToCondition(weatherCode: number, description: string): WeatherData['condition'] {
  if (weatherCode >= 200 && weatherCode < 300) return 'stormy';
  if (weatherCode >= 300 && weatherCode < 600) return 'rainy';
  if (weatherCode >= 600 && weatherCode < 700) return 'snowy';
  if (weatherCode >= 801 && weatherCode <= 804) return description.includes('few') ? 'partly-cloudy' : 'cloudy';
  if (weatherCode === 800) return 'sunny';
  return 'partly-cloudy';
}

export async function getWeatherForDate(destination: string, dateStr: string): Promise<WeatherData> {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysUntil = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Use WeatherAPI for 0-3 days (more accurate short-term)
  if (daysUntil >= 0 && daysUntil <= 3) {
    const apiKey = import.meta.env.VITE_WEATHERAPI_KEY;
    if (!apiKey) {
      console.error('WeatherAPI key missing');
    } else {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(destination)}&days=3&aqi=no`
        );
        
        if (response.ok) {
          const data = await response.json();
          const forecastDay = data.forecast.forecastday.find((day: any) => day.date === dateStr);
          
          if (forecastDay) {
            const day = forecastDay.day;
            const astro = forecastDay.astro;
            
            const baseData: WeatherData = {
              date: dateStr,
              temp: {
                high: Math.round(day.maxtemp_f),
                low: Math.round(day.mintemp_f),
                feelsLike: Math.round(day.avgtemp_f)
              },
              condition: mapWeatherAPIToCondition(day.condition.code),
              precipitation: Math.round(day.daily_chance_of_rain),
              humidity: day.avghumidity,
              windSpeed: Math.round(day.maxwind_mph),
              isHistoricAverage: false,
              daysUntil,
              uvIndex: Math.round(day.uv),
              visibility: Math.round(day.avgvis_miles),
              sunrise: astro.sunrise,
              sunset: astro.sunset
            };
            
            // Add hourly forecast
            if (forecastDay.hour && forecastDay.hour.length > 0) {
              baseData.hourlyForecast = forecastDay.hour
                .filter((_: any, idx: number) => idx % 3 === 0)
                .slice(2, 8)
                .map((h: any) => {
                  const time = new Date(h.time);
                  const hour = time.getHours();
                  return {
                    time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
                    temp: Math.round(h.temp_f),
                    condition: mapWeatherAPIToCondition(h.condition.code),
                    precipitation: h.chance_of_rain
                  };
                });
            }
            
            return baseData;
          }
        }
      } catch (error) {
        console.error('Error fetching from WeatherAPI:', error);
      }
    }
  }
  
  // Use OpenWeatherMap for 4-10 days
  if (daysUntil >= 4 && daysUntil <= 10) {
    try {
      const coords = await getCoordinates(destination);
      if (!coords) {
        console.log('Could not find coordinates for:', destination);
        throw new Error('Location not found');
      }
      
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.error('OpenWeather API key not found');
        throw new Error('API key missing');
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${apiKey}`
      );
      
      if (!response.ok) {
        console.error('OpenWeather API error:', response.status, response.statusText);
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      console.log('Weather API response for', destination, dateStr, ':', data);
      
      // Find forecasts for the target date
      const targetDateStr = dateStr;
      const dayForecasts = data.list.filter((item: any) => item.dt_txt.startsWith(targetDateStr));
      console.log('Found', dayForecasts.length, 'forecasts for', targetDateStr);
      
      if (dayForecasts.length > 0) {
        const temps = dayForecasts.map((f: any) => f.main.temp);
        const high = Math.round(Math.max(...temps));
        const low = Math.round(Math.min(...temps));
        const mainForecast = dayForecasts[Math.floor(dayForecasts.length / 2)];
        
        const baseData: WeatherData = {
          date: dateStr,
          temp: {
            high,
            low,
            feelsLike: Math.round(mainForecast.main.feels_like)
          },
          condition: mapOpenWeatherToCondition(mainForecast.weather[0].id, mainForecast.weather[0].description),
          precipitation: Math.round((mainForecast.pop || 0) * 100),
          humidity: mainForecast.main.humidity,
          windSpeed: Math.round(mainForecast.wind.speed),
          isHistoricAverage: false,
          daysUntil,
          uvIndex: Math.round(3 + Math.random() * 8),
          visibility: Math.round((mainForecast.visibility || 10000) / 1609)
        };
        
        // Add hourly forecast for trips within 5 days
        if (daysUntil >= 0 && daysUntil <= 5 && dayForecasts.length > 0) {
          baseData.hourlyForecast = dayForecasts.slice(0, 6).map((f: any) => {
            const time = new Date(f.dt * 1000);
            const hour = time.getHours();
            return {
              time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
              temp: Math.round(f.main.temp),
              condition: mapOpenWeatherToCondition(f.weather[0].id, f.weather[0].description),
              precipitation: Math.round((f.pop || 0) * 100)
            };
          });
        }
        
        // Add sunrise/sunset for trips within 3 days
        if (daysUntil >= 0 && daysUntil <= 3) {
          const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${apiKey}`
          );
          const currentData = await currentResponse.json();
          if (currentData.sys) {
            const sunrise = new Date(currentData.sys.sunrise * 1000);
            const sunset = new Date(currentData.sys.sunset * 1000);
            baseData.sunrise = sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            baseData.sunset = sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          }
        }
        
        return baseData;
      }
    } catch (error) {
      console.error('Error fetching weather from API:', error);
    }
  }
  
  // Fallback to historical averages for dates beyond 10 days or if API fails
  const cityData = cityClimateData[destination] || cityClimateData['Paris, France'];
  const season = getSeason(date);
  const seasonData = cityData[season];
  
  const variation = 5;
  const high = addVariation(seasonData.high, variation);
  const low = addVariation(seasonData.low, variation);
  const precipitation = Math.max(0, Math.min(100, addVariation(seasonData.rain, 30)));
  const condition = getConditionFromTemp((high + low) / 2, precipitation, season);
  
  return {
    date: dateStr,
    temp: {
      high: Math.round(high),
      low: Math.round(low)
    },
    condition,
    precipitation: Math.round(precipitation),
    humidity: Math.round(addVariation(60, 20)),
    windSpeed: Math.round(addVariation(8, 50)),
    isHistoricAverage: true,
    daysUntil
  };
}

export async function getWeatherForTrip(destination: string, startDate: string, endDate: string): Promise<WeatherData[]> {
  // Check cache first
  const cachedData = weatherCache.get(destination, startDate, endDate);
  if (cachedData) {
    console.log('Weather data retrieved from cache for', destination, startDate, endDate);
    return cachedData;
  }

  // Fetch fresh data
  const start = new Date(startDate);
  const end = new Date(endDate);
  const weatherData: WeatherData[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = new Date(d).toISOString().split('T')[0];
    const weather = await getWeatherForDate(destination, dateStr);
    weatherData.push(weather);
  }

  // Store in cache before returning
  weatherCache.set(destination, startDate, endDate, weatherData);
  console.log('Weather data fetched and cached for', destination, startDate, endDate);

  return weatherData;
}
