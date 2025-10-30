import { useState } from 'react';
import { Trip } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Trash2, Edit } from 'lucide-react';
import { EditTripDatesDialog } from './EditTripDatesDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface TripListProps {
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onUpdateDates: (tripId: string, startDate: string, endDate: string) => void;
}

export function TripList({ trips, onSelectTrip, onDeleteTrip, onUpdateDates }: TripListProps) {
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const formatDate = (date: string) => {
    // Parse date string components to avoid timezone issues
    const [year, month, day] = date.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    // Parse date string components to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-');
    const start = new Date(Number(startYear), Number(startMonth) - 1, Number(startDay));
    const [endYear, endMonth, endDay] = endDate.split('-');
    const end = new Date(Number(endYear), Number(endMonth) - 1, Number(endDay));
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'ongoing':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'completed':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-gray-600 mb-2">No trips planned yet</h3>
        <p className="text-gray-500 text-sm">Start planning your next adventure!</p>
      </div>
    );
  }

  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const ongoingTrips = trips.filter(t => t.status === 'ongoing');
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <>
      <div className="space-y-8">
        {ongoingTrips.length > 0 && (
          <div>
            <h2 className="text-gray-700 mb-4">Current Trip</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={onSelectTrip}
                  onDelete={onDeleteTrip}
                  onEditDates={setEditingTrip}
                  formatDate={formatDate}
                  getDuration={getDuration}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}

        {upcomingTrips.length > 0 && (
          <div>
            <h2 className="text-gray-700 mb-4">Upcoming Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={onSelectTrip}
                  onDelete={onDeleteTrip}
                  onEditDates={setEditingTrip}
                  formatDate={formatDate}
                  getDuration={getDuration}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}

        {completedTrips.length > 0 && (
          <div>
            <h2 className="text-gray-700 mb-4">Past Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={onSelectTrip}
                  onDelete={onDeleteTrip}
                  onEditDates={setEditingTrip}
                  formatDate={formatDate}
                  getDuration={getDuration}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <EditTripDatesDialog
        open={!!editingTrip}
        onOpenChange={(open) => !open && setEditingTrip(null)}
        trip={editingTrip}
        onUpdateDates={onUpdateDates}
      />
    </>
  );
}

interface TripCardProps {
  trip: Trip;
  onSelect: (tripId: string) => void;
  onDelete: (tripId: string) => void;
  onEditDates: (trip: Trip) => void;
  formatDate: (date: string) => string;
  getDuration: (startDate: string, endDate: string) => string;
  getStatusColor: (status: Trip['status']) => string;
}

function TripCard({ trip, onSelect, onDelete, onEditDates, formatDate, getDuration, getStatusColor }: TripCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={() => onSelect(trip.id)}>
        <div className="aspect-video relative overflow-hidden">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            <Badge className={getStatusColor(trip.status)}>
              {trip.status}
            </Badge>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-gray-900 mb-2">{trip.name || trip.destination}</h3>
          
          {/* Cities List */}
          {trip.cities && trip.cities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {trip.cities.slice(0, 3).map((city, index) => (
                <Badge
                  key={`${city.name}-${index}`}
                  variant="outline"
                  className="text-xs bg-gray-50"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {city.name}
                </Badge>
              ))}
              {trip.cities.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  +{trip.cities.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{getDuration(trip.startDate, trip.endDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-gray-500">
              {trip.activities.length} activit{trip.activities.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-4 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={(e) => {
            e.stopPropagation();
            onEditDates(trip);
          }}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Dates
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this trip? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(trip.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
