import { projectId, publicAnonKey } from './info';
import { Trip } from '../../App';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2191b2f3`;

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch all trips from Supabase
 */
export async function fetchTrips(): Promise<Trip[]> {
  try {
    console.log('Fetching trips from Supabase...');
    const data = await apiCall<{ trips: Trip[] }>('/trips');
    console.log('Fetched trips:', data.trips.length);
    return data.trips;
  } catch (error) {
    console.error('Error fetching trips:', error);
    throw error;
  }
}

/**
 * Fetch a single trip by ID
 */
export async function fetchTrip(id: string): Promise<Trip> {
  try {
    const data = await apiCall<{ trip: Trip }>(`/trips/${id}`);
    return data.trip;
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new trip
 */
export async function createTrip(trip: Trip): Promise<Trip> {
  try {
    console.log('Creating trip:', trip.id);
    const data = await apiCall<{ trip: Trip }>('/trips', {
      method: 'POST',
      body: JSON.stringify({ trip }),
    });
    console.log('Trip created successfully');
    return data.trip;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
}

/**
 * Update an existing trip
 */
export async function updateTrip(trip: Trip): Promise<Trip> {
  try {
    console.log('Updating trip:', trip.id);
    const data = await apiCall<{ trip: Trip }>(`/trips/${trip.id}`, {
      method: 'PUT',
      body: JSON.stringify({ trip }),
    });
    console.log('Trip updated successfully');
    return data.trip;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(id: string): Promise<void> {
  try {
    console.log('Deleting trip:', id);
    await apiCall<{ success: boolean }>(`/trips/${id}`, {
      method: 'DELETE',
    });
    console.log('Trip deleted successfully');
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}

/**
 * Save all trips at once (bulk operation)
 */
export async function saveAllTrips(trips: Trip[]): Promise<void> {
  try {
    console.log('Saving all trips to Supabase:', trips.length);
    await apiCall<{ success: boolean; count: number }>('/trips/bulk', {
      method: 'POST',
      body: JSON.stringify({ trips }),
    });
    console.log('All trips saved successfully');
  } catch (error) {
    console.error('Error saving all trips:', error);
    throw error;
  }
}
