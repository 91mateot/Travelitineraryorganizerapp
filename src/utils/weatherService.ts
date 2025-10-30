// Mock weather service that simulates realistic weather data
// In production, this would call a real weather API like OpenWeatherMap or WeatherAPI

export interface WeatherData {
  date: string;
  temp: {
    high: number;
    low: number;
  };
  condition: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  precipitation: number; // percentage
  humidity: number; // percentage
  windSpeed: number; // mph
  isHistoricAverage: boolean;
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

export async function getWeatherForDate(destination: string, dateStr: string): Promise<WeatherData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const isHistoricAverage = date > today;
  
  // Get climate data for the city
  const cityData = cityClimateData[destination] || cityClimateData['Paris, France'];
  const season = getSeason(date);
  const seasonData = cityData[season];
  
  // Add some daily variation for non-historic data
  const variation = isHistoricAverage ? 5 : 15;
  
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
    isHistoricAverage
  };
}

export async function getWeatherForTrip(destination: string, startDate: string, endDate: string): Promise<WeatherData[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const weatherData: WeatherData[] = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = new Date(d).toISOString().split('T')[0];
    const weather = await getWeatherForDate(destination, dateStr);
    weatherData.push(weather);
  }
  
  return weatherData;
}
