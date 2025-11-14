import { useState, useEffect, useRef } from 'react';
import { Trip, Activity, TripCity, Place } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TripDetailsHeader } from './TripDetailsHeader';
import { TripItinerary } from './TripItinerary';
import { TripInfo } from './TripInfo';
import { TripPlaces } from './TripPlaces';
import { AddActivityDialog } from './AddActivityDialog';
import { EditActivityDialog } from './EditActivityDialog';
import { AddPlaceDialog } from './AddPlaceDialog';
import { EditPlaceDialog } from './EditPlaceDialog';
import { ImportPlacesDialog } from './ImportPlacesDialog';
import { AddMapDialog } from './AddMapDialog';
import { EditTripDatesDialog } from './EditTripDatesDialog';
import { EditTripInfoDialog } from './EditTripInfoDialog';
import { getWeatherForTrip, WeatherData } from '../utils/weatherService';
import { toast } from 'sonner@2.0.3';
import {
  ArrowLeft,
  Plane,
  Hotel,
  Utensils,
  Activity as ActivityIcon,
  Car,
  MoreHorizontal,
  FileText,
  CalendarDays,
  MapPin,
} from 'lucide-react';

interface TripDetailsProps {
  trip: Trip;
  onBack: () => void;
  onUpdate: (trip: Trip) => void;
  onUpdateDates: (tripId: string, startDate: string, endDate: string) => void;
  onUpdateInfo: (tripId: string, updates: { name?: string; cities: TripCity[]; description: string }) => void;
  onDelete: () => void;
  defaultTab?: string;
  defaultScrollPosition?: number;
  onTabChange?: (tab: string, scrollPosition: number) => void;
}

export function TripDetails({
  trip,
  onBack,
  onUpdate,
  onUpdateDates,
  onUpdateInfo,
  onDelete,
  defaultTab = 'info',
  defaultScrollPosition = 0,
  onTabChange
}: TripDetailsProps) {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isAddMapOpen, setIsAddMapOpen] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [isEditPlaceOpen, setIsEditPlaceOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isImportPlacesOpen, setIsImportPlacesOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [notes, setNotes] = useState(trip.notes || '');
  const [currentTab, setCurrentTab] = useState(defaultTab);

  // Utility functions for date formatting
  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: string) => {
    const [year, month, day] = date.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysBetween = (startDate: string, endDate: string) => {
    const [startYear, startMonth, startDay] = startDate.split('-');
    const [endYear, endMonth, endDay] = endDate.split('-');
    const start = new Date(Number(startYear), Number(startMonth) - 1, Number(startDay));
    const end = new Date(Number(endYear), Number(endMonth) - 1, Number(endDay));
    const days: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
    }

    return days;
  };

  const days = getDaysBetween(trip.startDate, trip.endDate);

  // Update current tab only when trip changes
  useEffect(() => {
    setCurrentTab(defaultTab);
  }, [trip.id]);

  // Restore scroll position when trip is loaded
  useEffect(() => {
    if (defaultScrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, defaultScrollPosition);
      }, 100);
    }
  }, [trip.id]);

  // Track tab changes and scroll position
  const handleTabChange = (newTab: string) => {
    if (onTabChange) {
      onTabChange(currentTab, window.scrollY);
    }
    setCurrentTab(newTab);
  };

  // Save scroll position before navigating away
  const handleBack = () => {
    if (onTabChange) {
      onTabChange(currentTab, window.scrollY);
    }
    onBack();
  };

  // Sync cities from activities on mount
  useEffect(() => {
    const activityCities = [...new Set(trip.activities.filter(a => a.city).map(a => a.city!))];
    const missingCities = activityCities.filter(city => !trip.cities.some(c => c.name === city));

    if (missingCities.length > 0) {
      const newCities: TripCity[] = missingCities.map(city => ({
        name: city,
        country: 'USA',
        image: trip.cities[0]?.image || trip.image
      }));

      onUpdate({
        ...trip,
        cities: [...trip.cities, ...newCities]
      });
    }
  }, []);

  // Fetch weather data when component mounts or trip changes
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const data = await getWeatherForTrip(trip.destination, trip.startDate, trip.endDate);
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [trip.destination, trip.startDate, trip.endDate]);

  const getWeatherForDay = (day: string) => {
    return weatherData.find(w => w.date === day);
  };

  const getActivitiesForDay = (day: string) => {
    return trip.activities
      .filter(activity => activity.day === day)
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
  };

  const reorderActivities = (day: string, oldIndex: number, newIndex: number) => {
    const dayActivities = getActivitiesForDay(day);
    const [movedActivity] = dayActivities.splice(oldIndex, 1);
    dayActivities.splice(newIndex, 0, movedActivity);

    const otherActivities = trip.activities.filter(a => a.day !== day);
    const updatedActivities = [...otherActivities, ...dayActivities];

    onUpdate({ ...trip, activities: updatedActivities });
  };

  const getUnscheduledActivities = () => {
    return trip.activities.filter(activity => !activity.day);
  };

  const assignActivityToDay = (activityId: string, day: string) => {
    const updatedActivities = trip.activities.map(activity =>
      activity.id === activityId ? { ...activity, day } : activity
    );
    onUpdate({ ...trip, activities: updatedActivities });
  };

  const addActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString()
    };

    let updatedTrip = {
      ...trip,
      activities: [...trip.activities, newActivity]
    };

    // Auto-add city to trip cities if not already present
    if (newActivity.city && !trip.cities.some(c => c.name === newActivity.city)) {
      const newCity: TripCity = {
        name: newActivity.city,
        country: 'USA',
        image: trip.cities[0]?.image || trip.image
      };
      updatedTrip = {
        ...updatedTrip,
        cities: [...(updatedTrip.cities || []), newCity]
      };
    }

    // If activity has coordinates, automatically add it to Places tab
    if (newActivity.coordinates) {
      const activityAsPlace: Place = {
        id: `activity-place-${newActivity.id}`,
        name: newActivity.location,
        address: newActivity.address || newActivity.location,
        category: newActivity.placeCategory || 'other',
        notes: `${newActivity.title} - ${newActivity.description}`,
        coordinates: newActivity.coordinates
      };

      updatedTrip = {
        ...updatedTrip,
        places: [...(updatedTrip.places || []), activityAsPlace]
      };
    }

    onUpdate(updatedTrip);
  };

  const updateActivity = (activityId: string, updates: Omit<Activity, 'id'>) => {
    const updatedActivity = { ...updates, id: activityId };

    let updatedTrip = {
      ...trip,
      activities: trip.activities.map(a =>
        a.id === activityId ? updatedActivity : a
      )
    };

    // Auto-add city to trip cities if not already present
    if (updatedActivity.city && !trip.cities.some(c => c.name === updatedActivity.city)) {
      const newCity: TripCity = {
        name: updatedActivity.city,
        country: 'USA',
        image: trip.cities[0]?.image || trip.image
      };
      updatedTrip = {
        ...updatedTrip,
        cities: [...(updatedTrip.cities || []), newCity]
      };
    }

    // Handle Places tab synchronization
    const placeId = `activity-place-${activityId}`;
    const existingPlaceIndex = (trip.places || []).findIndex(p => p.id === placeId);

    if (updatedActivity.coordinates) {
      const activityAsPlace: Place = {
        id: placeId,
        name: updatedActivity.location,
        address: updatedActivity.address || updatedActivity.location,
        category: updatedActivity.placeCategory || 'other',
        notes: `${updatedActivity.title} - ${updatedActivity.description}`,
        coordinates: updatedActivity.coordinates
      };

      if (existingPlaceIndex >= 0) {
        updatedTrip = {
          ...updatedTrip,
          places: (updatedTrip.places || []).map(p =>
            p.id === placeId ? activityAsPlace : p
          )
        };
      } else {
        updatedTrip = {
          ...updatedTrip,
          places: [...(updatedTrip.places || []), activityAsPlace]
        };
      }
    } else if (existingPlaceIndex >= 0) {
      updatedTrip = {
        ...updatedTrip,
        places: (updatedTrip.places || []).filter(p => p.id !== placeId)
      };
    }

    onUpdate(updatedTrip);
  };

  const deleteActivity = (activityId: string) => {
    const placeId = `activity-place-${activityId}`;

    const updatedTrip = {
      ...trip,
      activities: trip.activities.filter(a => a.id !== activityId),
      places: (trip.places || []).filter(p => p.id !== placeId)
    };
    onUpdate(updatedTrip);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditActivityOpen(true);
  };

  const addMap = (mapUrl: string) => {
    const updatedTrip = {
      ...trip,
      mapUrl
    };
    onUpdate(updatedTrip);
    toast.success(trip.mapUrl ? 'Google Maps link updated!' : 'Google Maps link added!');
  };

  const addPlace = (place: Omit<Place, 'id'>) => {
    const newPlace: Place = {
      ...place,
      id: Date.now().toString()
    };

    const updatedTrip = {
      ...trip,
      places: [...(trip.places || []), newPlace]
    };

    onUpdate(updatedTrip);
  };

  const importPlaces = (places: Omit<Place, 'id'>[]) => {
    const newPlaces: Place[] = places.map((place, index) => ({
      ...place,
      id: (Date.now() + index).toString()
    }));

    const updatedTrip = {
      ...trip,
      places: [...(trip.places || []), ...newPlaces]
    };

    onUpdate(updatedTrip);
  };

  const updatePlace = (placeId: string, updates: Omit<Place, 'id'>) => {
    const updatedTrip = {
      ...trip,
      places: (trip.places || []).map(p => p.id === placeId ? { ...updates, id: placeId } : p)
    };
    onUpdate(updatedTrip);
  };

  const deletePlace = (placeId: string) => {
    const updatedTrip = {
      ...trip,
      places: (trip.places || []).filter(p => p.id !== placeId)
    };
    onUpdate(updatedTrip);
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setIsEditPlaceOpen(true);
  };

  const updateNotes = (newNotes: string) => {
    setNotes(newNotes);
    onUpdate({ ...trip, notes: newNotes });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4" />;
      case 'hotel':
        return <Hotel className="w-4 h-4" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4" />;
      case 'transport':
        return <Car className="w-4 h-4" />;
      case 'activity':
        return <ActivityIcon className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'flight':
        return 'bg-blue-100 text-blue-700';
      case 'hotel':
        return 'bg-purple-100 text-purple-700';
      case 'restaurant':
        return 'bg-orange-100 text-orange-700';
      case 'transport':
        return 'bg-green-100 text-green-700';
      case 'activity':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const cityColorMap = useRef<Record<string, { bg: string; text: string; border: string }>>({});
  const colorIndex = useRef(0);

  const getCityColor = (city: string) => {
    const colors = [
      { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
      { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
      { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
      { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
      { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
      { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
    ];

    if (!cityColorMap.current[city]) {
      cityColorMap.current[city] = colors[colorIndex.current % colors.length];
      colorIndex.current++;
    }

    return cityColorMap.current[city];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to trips
      </Button>

      {/* Trip Header Card */}
      <TripDetailsHeader
        trip={trip}
        days={days}
        onEditDates={() => setIsEditDatesOpen(true)}
        formatShortDate={formatShortDate}
      />

      {/* Tabs for Itinerary and General Info */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Itinerary
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Places ({(trip.places || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary">
          <TripItinerary
            trip={trip}
            days={days}
            weatherData={weatherData}
            loadingWeather={loadingWeather}
            getActivitiesForDay={getActivitiesForDay}
            getUnscheduledActivities={getUnscheduledActivities}
            getWeatherForDay={getWeatherForDay}
            reorderActivities={reorderActivities}
            assignActivityToDay={assignActivityToDay}
            handleEditActivity={handleEditActivity}
            deleteActivity={deleteActivity}
            getActivityIcon={getActivityIcon}
            getActivityColor={getActivityColor}
            getCityColor={getCityColor}
            formatDate={formatDate}
            onAddActivity={() => setIsAddActivityOpen(true)}
          />
        </TabsContent>

        <TabsContent value="info">
          <TripInfo
            trip={trip}
            days={days}
            notes={notes}
            getUnscheduledActivities={getUnscheduledActivities}
            formatShortDate={formatShortDate}
            updateNotes={updateNotes}
            onEditInfo={() => setIsEditInfoOpen(true)}
            onAddPlace={() => setIsAddPlaceOpen(true)}
            onImportPlaces={() => setIsImportPlacesOpen(true)}
            onAddMap={() => setIsAddMapOpen(true)}
          />
        </TabsContent>

        <TabsContent value="places">
          <TripPlaces
            trip={trip}
            days={days}
            onAddPlace={() => setIsAddPlaceOpen(true)}
            onImportPlaces={() => setIsImportPlacesOpen(true)}
            onAddMap={() => setIsAddMapOpen(true)}
            handleEditActivity={handleEditActivity}
            handleEditPlace={handleEditPlace}
            deletePlace={deletePlace}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddActivityDialog
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onAddActivity={addActivity}
        tripDays={days}
      />

      <EditActivityDialog
        open={isEditActivityOpen}
        onOpenChange={setIsEditActivityOpen}
        onUpdateActivity={updateActivity}
        activity={editingActivity}
        tripDays={days}
      />

      <EditTripDatesDialog
        open={isEditDatesOpen}
        onOpenChange={setIsEditDatesOpen}
        trip={trip}
        onUpdateDates={onUpdateDates}
      />

      <EditTripInfoDialog
        open={isEditInfoOpen}
        onOpenChange={setIsEditInfoOpen}
        trip={trip}
        onUpdateInfo={onUpdateInfo}
      />

      <AddMapDialog
        open={isAddMapOpen}
        onOpenChange={setIsAddMapOpen}
        onAdd={addMap}
        currentMapUrl={trip.mapUrl}
      />

      <AddPlaceDialog
        open={isAddPlaceOpen}
        onOpenChange={setIsAddPlaceOpen}
        onAdd={addPlace}
      />

      <EditPlaceDialog
        open={isEditPlaceOpen}
        onOpenChange={setIsEditPlaceOpen}
        onUpdate={updatePlace}
        place={editingPlace}
      />

      <ImportPlacesDialog
        open={isImportPlacesOpen}
        onOpenChange={setIsImportPlacesOpen}
        onImport={importPlaces}
      />
    </div>
  );
}
