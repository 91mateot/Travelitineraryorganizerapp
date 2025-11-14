import { Trip } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RichTextEditor } from './RichTextEditor';
import { getTripStatus } from '../utils/dateHelpers';
import {
  Edit,
  Plus,
  Download,
  ExternalLink,
  CalendarDays,
  FileText,
  MapPin,
  Map,
} from 'lucide-react';

interface TripInfoProps {
  trip: Trip;
  days: string[];
  notes: string;
  getUnscheduledActivities: () => any[];
  formatShortDate: (date: string) => string;
  updateNotes: (notes: string) => void;
  onEditInfo: () => void;
  onAddPlace: () => void;
  onImportPlaces: () => void;
  onAddMap: () => void;
}

export function TripInfo({
  trip,
  days,
  notes,
  getUnscheduledActivities,
  formatShortDate,
  updateNotes,
  onEditInfo,
  onAddPlace,
  onImportPlaces,
  onAddMap,
}: TripInfoProps) {
  // Compute trip status dynamically based on current date
  const computedStatus = getTripStatus(trip.startDate, trip.endDate);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Trip Notes & Information</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditInfo}
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
            <p className="text-gray-900">
              {days.length} days ({formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)})
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Status</label>
            <Badge className={`${
              computedStatus === 'upcoming' ? 'bg-blue-100 text-blue-700' :
              computedStatus === 'ongoing' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {computedStatus}
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
                onClick={onImportPlaces}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddPlace}
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
              onClick={onAddMap}
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
  );
}
