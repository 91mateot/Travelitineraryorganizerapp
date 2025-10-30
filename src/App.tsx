import { useState } from 'react';
import { TripList } from './components/TripList';
import { TripDetails } from './components/TripDetails';
import { CalendarView } from './components/CalendarView';
import { AddTripDialog } from './components/AddTripDialog';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { PlaneTakeoff, Calendar, List } from 'lucide-react';

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

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  image: string;
  activities: Activity[];
  status: 'upcoming' | 'ongoing' | 'completed';
  notes?: string;
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Paris, France',
      startDate: '2025-11-15',
      endDate: '2025-11-22',
      description: 'A week exploring the City of Light',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
      budget: 2500,
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
      startDate: '2025-12-10',
      endDate: '2025-12-17',
      description: 'Exploring modern and traditional Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
      status: 'upcoming',
      activities: []
    }
  ]);

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);

  const addTrip = (trip: Omit<Trip, 'id' | 'activities'>) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
      activities: []
    };
    setTrips([...trips, newTrip]);
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

  const deleteTrip = (tripId: string) => {
    setTrips(trips.filter(trip => trip.id !== tripId));
    if (selectedTripId === tripId) {
      setSelectedTripId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <PlaneTakeoff className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">TravelPlanner</h1>
                <p className="text-sm text-gray-500">Organize your adventures</p>
              </div>
            </div>
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

          <TabsContent value="list" className="space-y-6">
            {selectedTrip ? (
              <TripDetails
                trip={selectedTrip}
                onBack={() => setSelectedTripId(null)}
                onUpdate={updateTrip}
                onUpdateDates={updateTripDates}
                onDelete={() => deleteTrip(selectedTrip.id)}
              />
            ) : (
              <TripList
                trips={trips}
                onSelectTrip={setSelectedTripId}
                onDeleteTrip={deleteTrip}
                onUpdateDates={updateTripDates}
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
                onDelete={() => deleteTrip(selectedTrip.id)}
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

      <AddTripDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTrip={addTrip}
      />
    </div>
  );
}
