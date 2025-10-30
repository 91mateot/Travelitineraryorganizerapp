import { useState, useEffect } from 'react';
import { Trip } from '../App';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar } from 'lucide-react';

interface EditTripDatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
  onUpdateDates: (tripId: string, startDate: string, endDate: string) => void;
}

export function EditTripDatesDialog({ open, onOpenChange, trip, onUpdateDates }: EditTripDatesDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (trip) {
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
    }
  }, [trip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trip) {
      onUpdateDates(trip.id, startDate, endDate);
      onOpenChange(false);
    }
  };

  if (!trip) return null;

  // Helper function to format date string to local date without timezone issues
  const formatDateString = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Trip Dates
          </DialogTitle>
          <DialogDescription>
            Update the dates for {trip.destination}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date</Label>
              <Input
                id="edit-startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                Current: {formatDateString(trip.startDate)} - {formatDateString(trip.endDate)}
              </p>
              <p className="text-sm text-blue-900 mt-1">
                New: {formatDateString(startDate)} - {formatDateString(endDate)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Update Dates
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
