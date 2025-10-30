import { useState } from 'react';
import { Trip } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface CalendarViewProps {
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
}

export function CalendarView({ trips, onSelectTrip }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTripsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return trips.filter(trip => {
      const [startYear, startMonth, startDay] = trip.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = trip.endDate.split('-').map(Number);
      
      const tripStart = new Date(startYear, startMonth - 1, startDay);
      const tripEnd = new Date(endYear, endMonth - 1, endDay);
      const currentDateObj = new Date(year, month, day);
      
      return currentDateObj >= tripStart && currentDateObj <= tripEnd;
    });
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">{getMonthYear(currentDate)}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-sm text-gray-600 py-2 border-b"
            >
              {day}
            </div>
          ))}

          {/* Empty cells before month starts */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 bg-gray-50 rounded-lg" />
          ))}

          {/* Calendar days */}
          {days.map(day => {
            const tripsOnDay = getTripsForDate(year, month, day);
            const isTodayDate = isToday(year, month, day);

            return (
              <div
                key={day}
                className={`min-h-[120px] p-2 rounded-lg border-2 transition-colors ${
                  isTodayDate
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`text-sm mb-2 ${
                    isTodayDate
                      ? 'text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {tripsOnDay.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => onSelectTrip(trip.id)}
                      className={`w-full text-left px-2 py-1 rounded text-xs border transition-colors hover:shadow-sm ${getStatusColor(trip.status)}`}
                    >
                      <div className="truncate">{trip.name || trip.destination}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trips List Below Calendar */}
      {trips.length > 0 && (
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">All Trips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => {
              const [startYear, startMonth, startDay] = trip.startDate.split('-').map(Number);
              const [endYear, endMonth, endDay] = trip.endDate.split('-').map(Number);
              const startDateObj = new Date(startYear, startMonth - 1, startDay);
              const endDateObj = new Date(endYear, endMonth - 1, endDay);
              const duration = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;

              return (
                <button
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-gray-900 mb-1">{trip.name || trip.destination}</h4>
                  
                  {/* Cities badges */}
                  {trip.cities && trip.cities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {trip.cities.slice(0, 2).map((city, index) => (
                        <Badge
                          key={`${city.name}-${index}`}
                          variant="outline"
                          className="text-xs bg-gray-50"
                        >
                          {city.name}
                        </Badge>
                      ))}
                      {trip.cities.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          +{trip.cities.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {startDateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      -{' '}
                      {endDateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{duration} days</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {trips.length === 0 && (
        <Card className="p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-gray-600 mb-2">No trips planned yet</h3>
          <p className="text-gray-500 text-sm">Create your first trip to see it on the calendar</p>
        </Card>
      )}
    </div>
  );
}
