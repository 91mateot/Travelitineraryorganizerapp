import { useState, useEffect } from 'react';
import { TripList } from './components/TripList';
import { TripDetails } from './components/TripDetails';
import { CalendarView } from './components/CalendarView';
import { AddTripDialog } from './components/AddTripDialog';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { PlaneTakeoff, Calendar, List, Cloud, CloudOff } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import * as supabaseClient from './utils/supabase/client';
import { loadTrips, saveTrips } from './utils/storageService';

export interface SocialMediaLink {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'other';
  url: string;
}

export interface Activity {
  id: string;
  title: string;
  time: string;
  description: string;
  location: string;
  coordinates?: string; // Format: "lat,lng" - for map integration
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport' | 'other';
  day?: string; // Optional - for unscheduled activities
  socialMedia?: SocialMediaLink[];
}

export interface TripCity {
  name: string;
  country: string;
  image: string;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  category: 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport' | 'other';
  notes?: string;
  coordinates?: string; // Format: "lat,lng"
}

export interface Trip {
  id: string;
  name?: string; // Custom trip name (optional)
  destination: string; // Keep for backward compatibility - will be primary city name
  cities: TripCity[]; // Multiple cities/destinations
  startDate: string;
  endDate: string;
  description: string;
  image: string;
  activities: Activity[];
  status: 'upcoming' | 'ongoing' | 'completed';
  notes?: string;
  mapUrl?: string; // Google Maps list URL
  places?: Place[]; // Saved places for the trip
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tripTabState, setTripTabState] = useState<Record<string, { tab: string; scrollPosition: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Load trips from Supabase on mount
  useEffect(() => {
    loadTripsFromSupabase();
  }, []);

  // Load trips from Supabase with localStorage fallback
  const loadTripsFromSupabase = async () => {
    try {
      setIsLoading(true);
      setSyncStatus('syncing');
      
      const fetchedTrips = await supabaseClient.fetchTrips();
      
      // If no trips in Supabase, check localStorage for migration
      if (fetchedTrips.length === 0) {
        const localTrips = loadTrips();
        if (localTrips.length > 0) {
          console.log('Migrating trips from localStorage to Supabase...');
          await supabaseClient.saveAllTrips(localTrips);
          setTrips(localTrips);
          toast.success(`Migrated ${localTrips.length} trips to cloud storage`);
        } else {
          setTrips([]);
        }
      } else {
        setTrips(fetchedTrips);
        // Keep localStorage in sync as a backup
        saveTrips(fetchedTrips);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to load trips from Supabase:', error);
      toast.error('Failed to sync with cloud. Using local data.');
      
      // Fallback to localStorage
      const localTrips = loadTrips();
      setTrips(localTrips);
      setSyncStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-sync trips to Supabase when they change
  useEffect(() => {
    if (!isLoading && trips.length >= 0) {
      syncTripsToSupabase();
    }
  }, [trips]);

  // Sync trips to Supabase
  const syncTripsToSupabase = async () => {
    if (syncStatus === 'offline') return;
    
    try {
      setSyncStatus('syncing');
      await supabaseClient.saveAllTrips(trips);
      // Also save to localStorage as backup
      saveTrips(trips);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Failed to sync trips to Supabase:', error);
      // Still save to localStorage
      saveTrips(trips);
      setSyncStatus('offline');
    }
  };

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);

  const addTrip = (trip: Omit<Trip, 'id' | 'activities'>) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
      activities: []
    };
    setTrips([...trips, newTrip]);
    toast.success(`Trip to ${trip.destination} created!`);
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(trips.map(trip => trip.id === updatedTrip.id ? updatedTrip : trip));
  };

  const updateTripDates = (tripId: string, startDate: string, endDate: string) => {
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          startDate,
          endDate
        };
      }
      return trip;
    }));
  };

  const updateTripInfo = (tripId: string, updates: { name?: string; cities: TripCity[]; description: string }) => {
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        // Update destination display name based on cities
        const primaryCity = updates.cities[0];
        const destination = updates.name || 
          (updates.cities.length > 1
            ? `${primaryCity.name} +${updates.cities.length - 1} more`
            : `${primaryCity.name}, ${primaryCity.country}`);
        
        return {
          ...trip,
          name: updates.name,
          cities: updates.cities,
          destination,
          description: updates.description,
          image: primaryCity.image // Update image to first city
        };
      }
      return trip;
    }));
  };

  const deleteTrip = (tripId: string) => {
    const tripToDelete = trips.find(trip => trip.id === tripId);
    setTrips(trips.filter(trip => trip.id !== tripId));
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
    toast.success(`Trip "${tripToDelete?.destination || 'Trip'}" permanently deleted`);
  };

  const updateTripTabState = (tripId: string, tab: string, scrollPosition: number) => {
    setTripTabState(prev => ({
      ...prev,
      [tripId]: { tab, scrollPosition }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSelectedTripId(null)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <PlaneTakeoff className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">TravelPlanner</h1>
                <p className="text-sm text-gray-500">Organize your adventures</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              {/* Sync Status Indicator */}
              <div className="flex items-center gap-2 text-sm">
                {syncStatus === 'synced' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Cloud className="w-4 h-4" />
                    <span className="hidden sm:inline">Synced</span>
                  </div>
                )}
                {syncStatus === 'syncing' && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Cloud className="w-4 h-4 animate-pulse" />
                    <span className="hidden sm:inline">Syncing...</span>
                  </div>
                )}
                {syncStatus === 'offline' && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <CloudOff className="w-4 h-4" />
                    <span className="hidden sm:inline">Offline</span>
                  </div>
                )}
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <PlaneTakeoff className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Cloud className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
              <p className="text-gray-600">Loading your trips...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="list" className="w-full">
            {!selectedTripId && (
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  My Trips
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="list" className="space-y-6">
              {selectedTrip ? (
                <TripDetails
                  trip={selectedTrip}
                  onBack={() => setSelectedTripId(null)}
                  onUpdate={updateTrip}
                  onUpdateDates={updateTripDates}
                  onUpdateInfo={updateTripInfo}
                  onDelete={() => deleteTrip(selectedTrip.id)}
                  defaultTab={tripTabState[selectedTrip.id]?.tab || 'info'}
                  defaultScrollPosition={tripTabState[selectedTrip.id]?.scrollPosition || 0}
                  onTabChange={(tab, scrollPosition) => updateTripTabState(selectedTrip.id, tab, scrollPosition)}
                />
              ) : (
                <TripList
                  trips={trips}
                  onSelectTrip={setSelectedTripId}
                  onDeleteTrip={deleteTrip}
                  onUpdateDates={updateTripDates}
                  onUpdateInfo={updateTripInfo}
                />
              )}
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              {selectedTrip ? (
                <TripDetails
                  trip={selectedTrip}
                  onBack={() => setSelectedTripId(null)}
                  onUpdate={updateTrip}
                  onUpdateDates={updateTripDates}
                  onUpdateInfo={updateTripInfo}
                  onDelete={() => deleteTrip(selectedTrip.id)}
                  defaultTab={tripTabState[selectedTrip.id]?.tab || 'info'}
                  defaultScrollPosition={tripTabState[selectedTrip.id]?.scrollPosition || 0}
                  onTabChange={(tab, scrollPosition) => updateTripTabState(selectedTrip.id, tab, scrollPosition)}
                />
              ) : (
                <CalendarView
                  trips={trips}
                  onSelectTrip={setSelectedTripId}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/60 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {syncStatus === 'synced' && (
                <span className="flex items-center gap-1 text-green-600">
                  <Cloud className="w-3 h-3" />
                  Cloud storage enabled
                </span>
              )}
              {syncStatus === 'offline' && (
                <span className="flex items-center gap-1 text-amber-600">
                  <CloudOff className="w-3 h-3" />
                  Using local storage
                </span>
              )}
            </div>
            <p>
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
            </p>
          </div>
        </div>
      </footer>

      <AddTripDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTrip={addTrip}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
