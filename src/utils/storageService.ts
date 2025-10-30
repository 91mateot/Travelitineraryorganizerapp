import { Trip } from '../App';

const STORAGE_KEY = 'travel-itinerary-trips';
const VERSION_KEY = 'travel-itinerary-version';
const CURRENT_VERSION = '1.0';

// Demo trips for first-time users
const DEMO_TRIPS: Trip[] = [
  {
    id: '1',
    destination: 'Paris, France',
    cities: [
      { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
      { name: 'Lyon', country: 'France', image: 'https://images.unsplash.com/photo-1524168272322-bf73616d9cb5' }
    ],
    startDate: '2025-11-15',
    endDate: '2025-11-22',
    description: 'A week exploring the City of Light',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    status: 'upcoming',
    activities: [
      {
        id: 'a1',
        title: 'Flight to Paris',
        time: '10:00 AM',
        description: 'Air France AF1234',
        location: 'Charles de Gaulle Airport',
        type: 'flight',
        day: '2025-11-15'
      },
      {
        id: 'a2',
        title: 'Hotel Check-in',
        time: '3:00 PM',
        description: 'Le Marais Hotel',
        location: '4th Arrondissement',
        type: 'hotel',
        day: '2025-11-15'
      },
      {
        id: 'a3',
        title: 'Visit Eiffel Tower',
        time: '10:00 AM',
        description: 'Pre-booked tickets for summit access',
        location: 'Champ de Mars',
        type: 'activity',
        day: '2025-11-16'
      },
      {
        id: 'a4',
        title: 'Lunch at Le Jules Verne',
        time: '1:00 PM',
        description: 'Fine dining with a view',
        location: 'Eiffel Tower',
        type: 'restaurant',
        day: '2025-11-16'
      }
    ]
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    cities: [
      { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
      { name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e' },
      { name: 'Osaka', country: 'Japan', image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549' }
    ],
    startDate: '2025-12-10',
    endDate: '2025-12-17',
    description: 'Exploring modern and traditional Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
    status: 'upcoming',
    activities: []
  }
];

/**
 * Load trips from localStorage
 * Returns demo trips if this is the first visit
 */
export function loadTrips(): Trip[] {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const storedTrips = localStorage.getItem(STORAGE_KEY);
    
    // First time user - load demo trips
    if (!storedVersion || !storedTrips) {
      console.log('First time user - loading demo trips');
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      saveTrips(DEMO_TRIPS);
      return DEMO_TRIPS;
    }
    
    // Parse and return stored trips
    const trips = JSON.parse(storedTrips);
    console.log('Loaded trips from localStorage:', trips.length);
    return trips;
  } catch (error) {
    console.error('Error loading trips from localStorage:', error);
    return DEMO_TRIPS;
  }
}

/**
 * Save trips to localStorage
 */
export function saveTrips(trips: Trip[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    console.log('Saved trips to localStorage:', trips.length);
  } catch (error) {
    console.error('Error saving trips to localStorage:', error);
  }
}

/**
 * Clear all stored data (useful for testing)
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    console.log('Cleared localStorage');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Reset to demo trips
 */
export function resetToDemo(): Trip[] {
  clearStorage();
  return loadTrips();
}
