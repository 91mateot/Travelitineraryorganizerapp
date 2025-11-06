import { useState, useEffect, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trip, Activity, TripCity, Place } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { RichTextEditor } from './RichTextEditor';
import { AddActivityDialog } from './AddActivityDialog';
import { EditActivityDialog } from './EditActivityDialog';
import { AddPlaceDialog } from './AddPlaceDialog';
import { EditPlaceDialog } from './EditPlaceDialog';
import { ImportPlacesDialog } from './ImportPlacesDialog';
import { AddMapDialog } from './AddMapDialog';
import { EditTripDatesDialog } from './EditTripDatesDialog';
import { EditTripInfoDialog } from './EditTripInfoDialog';
import { WeatherCard } from './WeatherCard';
import { SocialMediaPreview } from './SocialMediaPreview';
import { PlacesMap } from './PlacesMap';
import { getWeatherForTrip, WeatherData } from '../utils/weatherService';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner@2.0.3';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plus,
  Plane,
  Hotel,
  Utensils,
  Activity as ActivityIcon,
  Car,
  MoreHorizontal,
  Trash2,
  Edit,
  FileText,
  CalendarDays,
  Map,
  ExternalLink,
  Download
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

export function TripDetails({ trip, onBack, onUpdate, onUpdateDates, onUpdateInfo, onDelete, defaultTab = 'info', defaultScrollPosition = 0, onTabChange }: TripDetailsProps) {
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

  const formatDate = (date: string) => {
    // Parse date string components to avoid timezone issues
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
    // Parse date string components to avoid timezone issues
    const [year, month, day] = date.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysBetween = (startDate: string, endDate: string) => {
    // Parse date string components to avoid timezone issues
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

  // Update current tab when trip changes
  // Update current tab only when trip changes (not when defaultTab changes from state updates)
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
    const reordered = arrayMove(dayActivities, oldIndex, newIndex);
    
    const otherActivities = trip.activities.filter(a => a.day !== day);
    const updatedActivities = [...otherActivities, ...reordered];
    
    onUpdate({ ...trip, activities: updatedActivities });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        country: 'USA', // Default, user can edit later
        image: trip.cities[0]?.image || trip.image // Use existing image as placeholder
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
    const oldActivity = trip.activities.find(a => a.id === activityId);
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
        country: 'USA', // Default, user can edit later
        image: trip.cities[0]?.image || trip.image // Use existing image as placeholder
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
      // Activity has coordinates - create or update place
      const activityAsPlace: Place = {
        id: placeId,
        name: updatedActivity.location,
        address: updatedActivity.address || updatedActivity.location,
        category: updatedActivity.placeCategory || 'other',
        notes: `${updatedActivity.title} - ${updatedActivity.description}`,
        coordinates: updatedActivity.coordinates
      };
      
      if (existingPlaceIndex >= 0) {
        // Update existing place
        updatedTrip = {
          ...updatedTrip,
          places: (updatedTrip.places || []).map(p => 
            p.id === placeId ? activityAsPlace : p
          )
        };
      } else {
        // Add new place
        updatedTrip = {
          ...updatedTrip,
          places: [...(updatedTrip.places || []), activityAsPlace]
        };
      }
    } else if (existingPlaceIndex >= 0) {
      // Activity no longer has coordinates - remove from places
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
      // Also remove the corresponding place if it exists
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

  const cityColorMap = useRef<Record<string, any>>({});
  const colorIndex = useRef(0);

  const getCityColor = (city: string) => {
    const colors = [
      { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' }, // green
      { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' }, // cyan
      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }, // blue
      { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' }, // purple
      { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' }, // orange
      { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' }, // pink
      { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }, // amber
      { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' }, // indigo
    ];
    
    if (!cityColorMap.current[city]) {
      cityColorMap.current[city] = colors[colorIndex.current % colors.length];
      colorIndex.current++;
    }
    
    return cityColorMap.current[city];
  };

  function SortableActivity({ activity, getActivityIcon, getActivityColor, handleEditActivity, deleteActivity }: any) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: activity.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-200 rounded transition-colors"
          title="Drag to reorder"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>
        <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h4 className="text-gray-900">{activity.title}</h4>
              {activity.city && (() => {
                const cityColor = getCityColor(activity.city);
                return (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex-shrink-0"
                    style={{ 
                      backgroundColor: cityColor.bg, 
                      color: cityColor.text, 
                      borderColor: cityColor.border 
                    }}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {activity.city}
                  </Badge>
                );
              })()}
            </div>
            {activity.time && (
              <span className="text-sm text-gray-500 whitespace-nowrap">{new Date(`2000-01-01T${activity.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{activity.location}</span>
              {activity.coordinates && (
                <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                  📍 On map
                </Badge>
              )}
            </div>
            {activity.address && (
              <div className="ml-5 text-xs text-gray-400 mt-1">
                {activity.address}
              </div>
            )}
          </div>
          {activity.socialMedia && activity.socialMedia.length > 0 && (
            <div className="mt-3">
              <SocialMediaPreview links={activity.socialMedia} />
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditActivity(activity)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Edit activity"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteActivity(activity.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete activity"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to trips
      </Button>

      {/* Trip Header Card */}
      <Card className="overflow-hidden">
        <div className="aspect-[21/9] relative">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-white mb-2">{trip.name || trip.destination}</h1>
            <p className="text-white/90">{trip.description}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white">
          {/* Cities Section */}
          {trip.cities && trip.cities.length > 0 && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-500 mb-2">Destinations</p>
              <div className="flex flex-wrap gap-2">
                {trip.cities.map((city, index) => (
                  <Badge
                    key={`${city.name}-${index}`}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {city.name}, {city.country}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Dates</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900">{formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</p>
                  <button
                    onClick={() => setIsEditDatesOpen(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit dates"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-gray-900">{days.length} days</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

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
          {/* Itinerary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Day-by-Day Itinerary</h2>
              <Button onClick={() => setIsAddActivityOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={[days[0]]} className="w-full">
          {days.map((day, index) => {
            const activities = getActivitiesForDay(day);
            const dayDate = new Date(day);
            const weather = getWeatherForDay(day);
            
            return (
              <AccordionItem key={day} value={day}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex-shrink-0">
                      <span className="text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-900">Day {index + 1}</h3>
                      <p className="text-sm text-gray-500">{formatDate(day)}</p>
                    </div>
                    <div className="flex items-center gap-3 mr-4">
                      <Badge variant="outline">
                        {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
                      </Badge>
                      {loadingWeather ? (
                        <Skeleton className="h-10 w-32" />
                      ) : weather ? (
                        <div className="hidden md:block min-w-[140px]">
                          <WeatherCard weather={weather} compact />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* Weather section for mobile and detailed view */}
                    {weather && (
                      <div className="mb-6">
                        <h4 className="text-sm text-gray-600 mb-3">Weather Forecast</h4>
                        <div className="max-w-xs">
                          <WeatherCard weather={weather} />
                        </div>
                      </div>
                    )}
                    
                    {/* Activities section */}
                    <div className="ml-6 pl-6 border-l-2 border-gray-200 space-y-4">
                      {activities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No activities planned for this day
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => {
                            const { active, over } = event;
                            if (over && active.id !== over.id) {
                              const oldIndex = activities.findIndex(a => a.id === active.id);
                              const newIndex = activities.findIndex(a => a.id === over.id);
                              reorderActivities(day, oldIndex, newIndex);
                            }
                          }}
                        >
                          <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
                            {activities.map(activity => (
                              <SortableActivity
                                key={activity.id}
                                activity={activity}
                                getActivityIcon={getActivityIcon}
                                getActivityColor={getActivityColor}
                                handleEditActivity={handleEditActivity}
                                deleteActivity={deleteActivity}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Card>

      {/* Optional Activities Section */}
      {getUnscheduledActivities().length > 0 && (
        <Card className="p-6 mt-6">
          <div className="mb-6">
            <h2 className="text-gray-900">Optional Activities</h2>
            <p className="text-sm text-gray-500 mt-1">Ideas and activities you might want to add to your itinerary</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getUnscheduledActivities().map(activity => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-gray-900">{activity.title}</h4>
                    {activity.time && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">{new Date(`2000-01-01T${activity.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                      {activity.coordinates && (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-300">
                          📍 On map
                        </Badge>
                      )}
                    </div>
                    {activity.address && (
                      <div className="ml-5 text-xs text-gray-400 mt-1">
                        {activity.address}
                      </div>
                    )}
                  </div>
                  
                  {activity.socialMedia && activity.socialMedia.length > 0 && (
                    <div className="mb-3">
                      <SocialMediaPreview links={activity.socialMedia} />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                      onChange={(e) => {
                        if (e.target.value) {
                          assignActivityToDay(activity.id, e.target.value);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Assign to day...</option>
                      {days.map((day, index) => (
                        <option key={day} value={day}>
                          Day {index + 1} - {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </option>
                      ))}
                    </select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditActivity(activity)}
                      className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Edit activity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="info">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900">Trip Notes & Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditInfoOpen(true)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Info
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Trip Details Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                {trip.name && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 mb-2 block">Trip Name</label>
                    <p className="text-gray-900">{trip.name}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500 mb-2 block">Destinations</label>
                  {trip.cities && trip.cities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {trip.cities.map((city, index) => (
                        <Badge
                          key={`${city.name}-${index}`}
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-sm py-1"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          {city.name}, {city.country}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">{trip.destination}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Trip Duration</label>
                  <p className="text-gray-900">{days.length} days ({formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)})</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Status</label>
                  <Badge className={`${
                    trip.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    trip.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {trip.status}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500 mb-2 block">Description</label>
                  <p className="text-gray-900">{trip.description}</p>
                </div>
              </div>

              {/* Trip Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900">Scheduled Activities</span>
                  </div>
                  <p className="text-2xl text-blue-900">
                    {trip.activities.filter(a => a.day).length}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-900">Optional Activities</span>
                  </div>
                  <p className="text-2xl text-purple-900">
                    {getUnscheduledActivities().length}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-900">Total Activities</span>
                  </div>
                  <p className="text-2xl text-green-900">
                    {trip.activities.length}
                  </p>
                </div>
              </div>

              {/* Places Section */}
              <div className="pb-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Saved Places</label>
                    <p className="text-sm text-gray-500">
                      Add restaurants, hotels, attractions, and other places to visit
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsImportPlacesOpen(true)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddPlaceOpen(true)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Place
                    </Button>
                  </div>
                </div>
                {trip.places && trip.places.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.places.length} place{trip.places.length !== 1 ? 's' : ''} saved - view in Places tab</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Maps List Section */}
              <div className="pb-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="text-sm text-gray-700 block mb-1">Google Maps List</label>
                    <p className="text-sm text-gray-500">
                      Save a link to your Google Maps list for quick access to all your places
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddMapOpen(true)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {trip.mapUrl ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Link
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Link
                      </>
                    )}
                  </Button>
                </div>
                {trip.mapUrl ? (
                  <div className="mt-3">
                    <Button
                      onClick={() => window.open(trip.mapUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      No Google Maps list linked yet. Create a custom list in Google Maps with all your places and add the link here.
                    </p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Trip Notes</label>
                <p className="text-sm text-gray-500 mb-3">
                  Add any general notes, tips, or important information. Select text to format.
                </p>
                <RichTextEditor
                  content={notes}
                  onChange={updateNotes}
                  placeholder="Add notes about accommodations, packing lists, important contacts, travel tips, etc..."
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Places Tab */}
        <TabsContent value="places">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-gray-900">Saved Places</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {(trip.places || []).length > 0 
                    ? `${trip.places.length} place${trip.places.length !== 1 ? 's' : ''} to visit on your trip`
                    : 'No places saved yet - add places manually or from itinerary activities with locations'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsImportPlacesOpen(true)}
                  size="sm"
                  variant="outline"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Import from Maps
                </Button>
                <Button
                  onClick={() => setIsAddPlaceOpen(true)}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Place
                </Button>
              </div>
            </div>

              {/* Category filters */}
              {(trip.places || []).length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {['all', 'restaurant', 'cafe', 'bar', 'hotel', 'attraction', 'museum', 'park', 'beach', 'entertainment', 'shopping', 'transport', 'spa', 'gym', 'pharmacy', 'bank', 'gas', 'parking', 'other'].map((cat) => {
                      const count = cat === 'all' 
                        ? trip.places.length 
                        : trip.places.filter(p => p.category === cat).length;
                      
                      if (count === 0 && cat !== 'all') return null;
                      
                      const labels: Record<string, string> = {
                        all: '📍 All',
                        restaurant: '🍽️ Restaurants',
                        cafe: '☕ Cafes',
                        bar: '🍺 Bars',
                        hotel: '🏨 Hotels',
                        attraction: '🎭 Attractions',
                        museum: '🏛️ Museums',
                        park: '🌳 Parks',
                        beach: '🏖️ Beaches',
                        entertainment: '🎬 Entertainment',
                        shopping: '🛍️ Shopping',
                        transport: '🚇 Transport',
                        spa: '💆 Spa',
                        gym: '💪 Gym',
                        pharmacy: '💊 Pharmacy',
                        bank: '🏦 Bank',
                        gas: '⛽ Gas',
                        parking: '🅿️ Parking',
                        other: '📍 Other'
                      };
                      
                      return (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50"
                        >
                          {labels[cat]} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Google Maps List Section */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-600" />
                    <h3 className="text-gray-900">Google Maps List</h3>
                  </div>
                  <Button
                    onClick={() => setIsAddMapOpen(true)}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    {trip.mapUrl ? (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Link
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Link
                      </>
                    )}
                  </Button>
                </div>
                {trip.mapUrl ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      View your saved Google Maps list with all your places
                    </p>
                    <Button
                      onClick={() => window.open(trip.mapUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Save a link to your Google Maps list to quickly access all your saved places. You can create a custom list in Google Maps with all the restaurants, hotels, and attractions for this trip.
                  </p>
                )}
              </div>

              {/* Interactive Map */}
              <div className="mb-6">
                <PlacesMap places={trip.places || []} activities={trip.activities} />
                {((trip.places || []).some(p => p.coordinates) || trip.activities.some(a => a.coordinates)) && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Click markers to view details • Category emojis show place types • ⭐ = From activity
                  </p>
                )}
              </div>

              {/* Places List */}
              <div className="space-y-6">
                {(trip.places || []).length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-gray-700 mb-2">No places yet</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                      Add places manually or add activities with locations in the Itinerary tab. Activities with coordinates will automatically appear here.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => setIsAddPlaceOpen(true)}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Place
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Places from Activities */}
                    {(() => {
                      const activityPlaces = (trip.places || []).filter(p => p.id.startsWith('activity-place-'));
                      const manualPlaces = (trip.places || []).filter(p => !p.id.startsWith('activity-place-'));
                      
                      return (
                        <>
                          {activityPlaces.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-3">From Activities ({activityPlaces.length})</h3>
                              <div className="space-y-3">
                                {activityPlaces.map((place) => {
                  const activityId = place.id.replace('activity-place-', '');
                  const activity = trip.activities.find(a => a.id === activityId);
                  const dayIndex = activity?.day ? days.indexOf(activity.day) : -1;

                  return (
                    <Card key={place.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg flex-shrink-0 bg-blue-100 text-blue-600">
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-gray-900">{place.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (activity) handleEditActivity(activity);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                              title="Edit activity"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{place.address}</span>
                          </div>
                          <div className="space-y-2">
                            {activity && dayIndex >= 0 && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Day {dayIndex + 1}
                                </Badge>
                                <span className="text-xs text-gray-600">{activity.title}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {place.coordinates && (
                                <>
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                    📍 On map
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.coordinates}`, '_blank')}
                                    className="text-blue-600 hover:text-blue-700 text-xs h-6 px-2"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Open in Google Maps
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {manualPlaces.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-3">Manually Added ({manualPlaces.length})</h3>
                              <div className="space-y-3">
                                {manualPlaces.map((place) => {
                  const categoryIcons: Record<Place['category'], { icon: any; color: string }> = {
                    restaurant: { icon: Utensils, color: 'bg-orange-100 text-orange-600' },
                    cafe: { icon: Utensils, color: 'bg-amber-100 text-amber-600' },
                    bar: { icon: Utensils, color: 'bg-purple-100 text-purple-600' },
                    hotel: { icon: Hotel, color: 'bg-blue-100 text-blue-600' },
                    attraction: { icon: ActivityIcon, color: 'bg-purple-100 text-purple-600' },
                    museum: { icon: ActivityIcon, color: 'bg-indigo-100 text-indigo-600' },
                    park: { icon: MapPin, color: 'bg-green-100 text-green-600' },
                    beach: { icon: MapPin, color: 'bg-cyan-100 text-cyan-600' },
                    entertainment: { icon: ActivityIcon, color: 'bg-pink-100 text-pink-600' },
                    shopping: { icon: MapPin, color: 'bg-pink-100 text-pink-600' },
                    transport: { icon: Car, color: 'bg-green-100 text-green-600' },
                    spa: { icon: MapPin, color: 'bg-purple-100 text-purple-600' },
                    gym: { icon: ActivityIcon, color: 'bg-red-100 text-red-600' },
                    pharmacy: { icon: MapPin, color: 'bg-red-100 text-red-600' },
                    bank: { icon: MapPin, color: 'bg-blue-100 text-blue-600' },
                    gas: { icon: Car, color: 'bg-yellow-100 text-yellow-600' },
                    parking: { icon: Car, color: 'bg-gray-100 text-gray-600' },
                    other: { icon: MapPin, color: 'bg-gray-100 text-gray-600' },
                  };

                  const { icon: Icon, color } = categoryIcons[place.category];

                  return (
                    <Card key={place.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg flex-shrink-0 ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-gray-900">{place.name}</h3>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPlace(place)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePlace(place.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{place.address}</span>
                            </div>
                            {place.notes && (
                              <p className="text-sm text-gray-600">{place.notes}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {place.category}
                              </Badge>
                              {place.coordinates && (
                                <>
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                    📍 On map
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.coordinates}`, '_blank')}
                                    className="text-blue-600 hover:text-blue-700 text-xs h-6 px-2"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Open in Google Maps
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
      </Tabs>

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
