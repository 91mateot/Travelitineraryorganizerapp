import { Trip, Place, Activity as ActivityType } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PlacesMap } from './PlacesMap';
import {
  MapPin,
  Plus,
  Download,
  Edit,
  Trash2,
  ExternalLink,
  Map,
  Activity as ActivityIcon,
  Utensils,
  Hotel,
  Car,
} from 'lucide-react';

interface TripPlacesProps {
  trip: Trip;
  days: string[];
  onAddPlace: () => void;
  onImportPlaces: () => void;
  onAddMap: () => void;
  handleEditActivity: (activity: ActivityType) => void;
  handleEditPlace: (place: Place) => void;
  deletePlace: (placeId: string) => void;
}

export function TripPlaces({
  trip,
  days,
  onAddPlace,
  onImportPlaces,
  onAddMap,
  handleEditActivity,
  handleEditPlace,
  deletePlace,
}: TripPlacesProps) {
  const activityPlaces = (trip.places || []).filter(p => p.id.startsWith('activity-place-'));
  const manualPlaces = (trip.places || []).filter(p => !p.id.startsWith('activity-place-'));

  const categoryIcons: Record<Place['category'], { icon: typeof MapPin; color: string }> = {
    restaurant: { icon: Utensils, color: 'bg-orange-100 text-orange-600' },
    cafe: { icon: Utensils, color: 'bg-amber-100 text-amber-600' },
    fastfood: { icon: Utensils, color: 'bg-red-100 text-red-600' },
    bakery: { icon: Utensils, color: 'bg-yellow-100 text-yellow-600' },
    bar: { icon: Utensils, color: 'bg-purple-100 text-purple-600' },
    hotel: { icon: Hotel, color: 'bg-blue-100 text-blue-600' },
    attraction: { icon: ActivityIcon, color: 'bg-purple-100 text-purple-600' },
    museum: { icon: ActivityIcon, color: 'bg-indigo-100 text-indigo-600' },
    gallery: { icon: ActivityIcon, color: 'bg-pink-100 text-pink-600' },
    park: { icon: MapPin, color: 'bg-green-100 text-green-600' },
    beach: { icon: MapPin, color: 'bg-cyan-100 text-cyan-600' },
    entertainment: { icon: ActivityIcon, color: 'bg-pink-100 text-pink-600' },
    venue: { icon: ActivityIcon, color: 'bg-fuchsia-100 text-fuchsia-600' },
    shopping: { icon: MapPin, color: 'bg-pink-100 text-pink-600' },
    transport: { icon: Car, color: 'bg-green-100 text-green-600' },
    school: { icon: MapPin, color: 'bg-blue-100 text-blue-600' },
    spa: { icon: MapPin, color: 'bg-purple-100 text-purple-600' },
    gym: { icon: ActivityIcon, color: 'bg-red-100 text-red-600' },
    pharmacy: { icon: MapPin, color: 'bg-red-100 text-red-600' },
    bank: { icon: MapPin, color: 'bg-blue-100 text-blue-600' },
    gas: { icon: Car, color: 'bg-yellow-100 text-yellow-600' },
    parking: { icon: Car, color: 'bg-gray-100 text-gray-600' },
    other: { icon: MapPin, color: 'bg-gray-100 text-gray-600' },
  };

  const categoryLabels: Record<string, string> = {
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
            onClick={onImportPlaces}
            size="sm"
            variant="outline"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Import from Maps
          </Button>
          <Button
            onClick={onAddPlace}
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

              return (
                <Badge
                  key={cat}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                >
                  {categoryLabels[cat]} ({count})
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
            onClick={onAddMap}
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
                onClick={onAddPlace}
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
                                aria-label={activity ? `Edit ${activity.title}` : 'Edit activity'}
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
                                      aria-label={`Open ${place.name} in Google Maps`}
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

            {/* Manually Added Places */}
            {manualPlaces.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Manually Added ({manualPlaces.length})</h3>
                <div className="space-y-3">
                  {manualPlaces.map((place) => {
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
                                  aria-label={`Edit ${place.name}`}
                                  title="Edit place"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deletePlace(place.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                  aria-label={`Delete ${place.name}`}
                                  title="Delete place"
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
                                      aria-label={`Open ${place.name} in Google Maps`}
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
        )}
      </div>
    </Card>
  );
}
