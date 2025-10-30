import { useState } from 'react';
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
      <DialogContent className="sm:max-w-[500px]">
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
                <p>You can add:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>A Google Maps list or location URL (opens in new tab)</li>
                  <li>A Google My Maps embed URL (displays inline)</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900 mb-2">
                <strong>To embed a map:</strong>
              </p>
              <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                <li>Create a map at <a href="https://www.google.com/maps/d/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google My Maps</a></li>
                <li>Click menu → "Embed on my site"</li>
                <li>Copy the URL from the iframe src attribute</li>
              </ol>
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
