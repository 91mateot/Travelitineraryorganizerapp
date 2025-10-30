import { useState } from 'react';
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
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTrip: (trip: Omit<Trip, 'id' | 'activities'>) => void;
}

const destinations = [
  { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
  { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
  { name: 'New York, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
  { name: 'London, UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
  { name: 'Barcelona, Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded' },
  { name: 'Dubai, UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c' },
  { name: 'Sydney, Australia', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
  { name: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
];

export function AddTripDialog({ open, onOpenChange, onAddTrip }: AddTripDialogProps) {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'upcoming' as Trip['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedDestination = destinations.find(d => d.name === formData.destination);
    
    onAddTrip({
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      description: formData.description,
      image: selectedDestination?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
      status: formData.status
    });
    
    // Reset form
    setFormData({
      destination: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'upcoming'
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Plan a New Trip</DialogTitle>
          <DialogDescription>
            Add details about your upcoming adventure
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Select
                value={formData.destination}
                onValueChange={(value) => setFormData({ ...formData, destination: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.name} value={dest.name}>
                      {dest.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  min={formData.startDate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What are you planning to do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Trip['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!formData.destination || !formData.startDate || !formData.endDate}
            >
              Create Trip
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
