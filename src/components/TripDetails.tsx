import { useState, useEffect } from 'react';
import { Trip, Activity, TripCity, Place } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { AddActivityDialog } from './AddActivityDialog';
import { AddPlaceDialog } from './AddPlaceDialog';
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
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isAddMapOpen, setIsAddMapOpen] = useState(false);
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
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
      .sort((a, b) => a.time.localeCompare(b.time));
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
    
    const updatedTrip = {
      ...trip,
      activities: [...trip.activities, newActivity]
    };
    
    onUpdate(updatedTrip);
  };

  const deleteActivity = (activityId: string) => {
    const updatedTrip = {
      ...trip,
      activities: trip.activities.filter(a => a.id !== activityId)
    };
    onUpdate(updatedTrip);
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

  const deletePlace = (placeId: string) => {
    const updatedTrip = {
      ...trip,
      places: (trip.places || []).filter(p => p.id !== placeId)
    };
    onUpdate(updatedTrip);
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
        <TabsList className={`grid w-full max-w-md ${(trip.places && trip.places.length > 0) ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            General Info
          </TabsTrigger>
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Itinerary
          </TabsTrigger>
          {trip.places && trip.places.length > 0 && (
            <TabsTrigger value="places" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Places ({trip.places.length})
            </TabsTrigger>
          )}
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
                        activities.map(activity => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="text-gray-900">{activity.title}</h4>
                                <span className="text-sm text-gray-500 whitespace-nowrap">{activity.time}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <MapPin className="w-3 h-3" />
                                <span>{activity.location}</span>
                              </div>
                              {activity.socialMedia && activity.socialMedia.length > 0 && (
                                <div className="mt-3">
                                  <SocialMediaPreview links={activity.socialMedia} />
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteActivity(activity.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
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
                      <span className="text-sm text-gray-500 whitespace-nowrap">{activity.time}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{activity.location}</span>
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
                      onClick={() => deleteActivity(activity.id)}
                      className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
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
                  Add any general notes, tips, or important information about your trip.
                </p>
                <Textarea
                  value={notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder="Add notes about accommodations, packing lists, important contacts, travel tips, etc..."
                  className="min-h-[200px] resize-none"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Places Tab */}
        {trip.places && trip.places.length > 0 && (
          <TabsContent value="places">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-gray-900">Saved Places</h2>
                  <p className="text-sm text-gray-500 mt-1">{trip.places.length} place{trip.places.length !== 1 ? 's' : ''} to visit on your trip</p>
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
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', 'restaurant', 'hotel', 'attraction', 'shopping', 'transport', 'other'].map((cat) => {
                    const count = cat === 'all' 
                      ? trip.places.length 
                      : trip.places.filter(p => p.category === cat).length;
                    
                    if (count === 0 && cat !== 'all') return null;
                    
                    return (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                      >
                        {cat === 'all' ? '📍 All' : 
                         cat === 'restaurant' ? '🍽️ Restaurants' :
                         cat === 'hotel' ? '🏨 Hotels' :
                         cat === 'attraction' ? '🎭 Attractions' :
                         cat === 'shopping' ? '🛍️ Shopping' :
                         cat === 'transport' ? '🚇 Transport' :
                         '📍 Other'} ({count})
                      </Badge>
                    );
                  })}
                </div>
              </div>

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
                <PlacesMap places={trip.places} />
                {trip.places.some(p => p.coordinates) && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Click markers to view place details • Markers are color-coded by category
                  </p>
                )}
              </div>

              {/* Places List */}
              <div className="space-y-3">
                {trip.places.map((place) => {
                  const categoryIcons = {
                    restaurant: { icon: Utensils, color: 'bg-orange-100 text-orange-600' },
                    hotel: { icon: Hotel, color: 'bg-blue-100 text-blue-600' },
                    attraction: { icon: ActivityIcon, color: 'bg-purple-100 text-purple-600' },
                    shopping: { icon: MapPin, color: 'bg-pink-100 text-pink-600' },
                    transport: { icon: Car, color: 'bg-green-100 text-green-600' },
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePlace(place.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AddActivityDialog
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        onAddActivity={addActivity}
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

      <ImportPlacesDialog
        open={isImportPlacesOpen}
        onOpenChange={setIsImportPlacesOpen}
        onImport={importPlaces}
      />
    </div>
  );
}
