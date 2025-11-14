import { Trip } from '../App';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, MapPin, Edit } from 'lucide-react';

interface TripDetailsHeaderProps {
  trip: Trip;
  days: string[];
  onEditDates: () => void;
  formatShortDate: (date: string) => string;
}

export function TripDetailsHeader({ trip, days, onEditDates, formatShortDate }: TripDetailsHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[21/9] relative">
        <img
          src={trip.image}
          alt={trip.destination}
          className="w-full h-full object-cover"
          loading="lazy"
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
                  onClick={onEditDates}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Edit dates"
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
  );
}
