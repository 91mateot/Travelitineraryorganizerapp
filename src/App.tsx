import { useState, useEffect } from 'react';
import { TripList } from './components/TripList';
import { TripDetails } from './components/TripDetails';
import { CalendarView } from './components/CalendarView';
import { AddTripDialog } from './components/AddTripDialog';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { PlaneTakeoff, Calendar, List } from 'lucide-react';
import { loadTrips, saveTrips } from './utils/storageService';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

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
  // Load trips from localStorage on mount
  const [trips, setTrips] = useState<Trip[]>(() => loadTrips());
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tripTabState, setTripTabState] = useState<Record<string, { tab: string; scrollPosition: number }>>({});

  // Save trips to localStorage whenever they change
  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

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
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <PlaneTakeoff className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/60 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>
              💾 All trips are automatically saved to your browser's local storage
            </p>
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
