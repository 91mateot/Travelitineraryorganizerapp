import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trip, Activity } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { SortableActivity } from './SortableActivity';
import { WeatherCard } from './WeatherCard';
import { SocialMediaPreview } from './SocialMediaPreview';
import { Skeleton } from './ui/skeleton';
import { WeatherData } from '../utils/weatherService';
import {
  Plus,
  MapPin,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';

interface TripItineraryProps {
  trip: Trip;
  days: string[];
  weatherData: WeatherData[];
  loadingWeather: boolean;
  getActivitiesForDay: (day: string) => Activity[];
  getUnscheduledActivities: () => Activity[];
  getWeatherForDay: (day: string) => WeatherData | undefined;
  reorderActivities: (day: string, oldIndex: number, newIndex: number) => void;
  assignActivityToDay: (activityId: string, day: string) => void;
  handleEditActivity: (activity: Activity) => void;
  deleteActivity: (activityId: string) => void;
  getActivityIcon: (type: Activity['type']) => JSX.Element;
  getActivityColor: (type: Activity['type']) => string;
  getCityColor: (city: string) => { bg: string; text: string; border: string };
  formatDate: (date: string) => string;
  onAddActivity: () => void;
}

export function TripItinerary({
  trip,
  days,
  weatherData,
  loadingWeather,
  getActivitiesForDay,
  getUnscheduledActivities,
  getWeatherForDay,
  reorderActivities,
  assignActivityToDay,
  handleEditActivity,
  deleteActivity,
  getActivityIcon,
  getActivityColor,
  getCityColor,
  formatDate,
  onAddActivity,
}: TripItineraryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Day-by-Day Itinerary</h2>
          <Button onClick={onAddActivity} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>

        <Accordion type="multiple" defaultValue={[days[0]]} className="w-full">
          {days.map((day, index) => {
            const activities = getActivitiesForDay(day);
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
                                getCityColor={getCityColor}
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
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(`2000-01-01T${activity.time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
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
                      aria-label={`Edit ${activity.title}`}
                      title="Edit activity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Delete ${activity.title}`}
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
    </>
  );
}
