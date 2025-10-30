import { useState, useEffect } from 'react';
import { Trip, Activity } from '../App';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { AddActivityDialog } from './AddActivityDialog';
import { EditTripDatesDialog } from './EditTripDatesDialog';
import { WeatherCard } from './WeatherCard';
import { SocialMediaPreview } from './SocialMediaPreview';
import { getWeatherForTrip, WeatherData } from '../utils/weatherService';
import { Skeleton } from './ui/skeleton';
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
  CalendarDays
} from 'lucide-react';

interface TripDetailsProps {
  trip: Trip;
  onBack: () => void;
  onUpdate: (trip: Trip) => void;
  onUpdateDates: (tripId: string, startDate: string, endDate: string) => void;
  onDelete: () => void;
}

export function TripDetails({ trip, onBack, onUpdate, onUpdateDates, onDelete }: TripDetailsProps) {
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [notes, setNotes] = useState(trip.notes || '');

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
      <Button variant="ghost" onClick={onBack} className="mb-4">
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
            <h1 className="text-white mb-2">{trip.destination}</h1>
            <p className="text-white/90">{trip.description}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-gray-900">{days.length} days</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dates</p>
                <p className="text-gray-900">{formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDatesOpen(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Dates
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs for Itinerary and General Info */}
      <Tabs defaultValue="itinerary" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Itinerary
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            General Info
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
            <h2 className="text-gray-900 mb-6">Trip Notes & Information</h2>
            
            <div className="space-y-6">
              {/* Trip Details Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Destination</label>
                  <p className="text-gray-900">{trip.destination}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Trip Duration</label>
                  <p className="text-gray-900">{days.length} days ({formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)})</p>
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
    </div>
  );
}
