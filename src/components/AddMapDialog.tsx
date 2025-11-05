import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Map } from 'lucide-react';

interface AddMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (mapUrl: string) => void;
  currentMapUrl?: string;
}

export function AddMapDialog({ open, onOpenChange, onAdd, currentMapUrl }: AddMapDialogProps) {
  const [mapUrl, setMapUrl] = useState(currentMapUrl || '');

  // Update mapUrl when currentMapUrl changes (for editing)
  useEffect(() => {
    if (open) {
      setMapUrl(currentMapUrl || '');
    }
  }, [open, currentMapUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapUrl.trim()) {
      onAdd(mapUrl.trim());
      setMapUrl('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            {currentMapUrl ? 'Update Map Link' : 'Add Map Link'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mapUrl">Google Maps URL</Label>
              <Input
                id="mapUrl"
                placeholder="Paste your Google Maps link here..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                required
              />
              <div className="space-y-2 text-sm text-gray-600">
                <p>Supported link types:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Google Maps saved list URL (e.g., google.com/maps/d/...)</li>
                  <li>Google My Maps custom map URL</li>
                  <li>Google Maps search or location URL</li>
                  <li>Shared Google Maps list link</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 mb-2">
                <strong>💡 How to create a Google Maps list:</strong>
              </p>
              <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                <li>Open <a href="https://www.google.com/maps/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google Maps</a></li>
                <li>Click "Saved" → "New list"</li>
                <li>Add places to your list by searching and clicking "Save"</li>
                <li>Click "Share list" → Copy the link</li>
                <li>Paste the link here!</li>
              </ol>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-900">
                <strong>Alternative:</strong> You can also create a custom map at <a href="https://www.google.com/maps/d/" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">Google My Maps</a> and paste its URL here.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!mapUrl.trim()}>
              {currentMapUrl ? 'Update Map' : 'Add Map'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
