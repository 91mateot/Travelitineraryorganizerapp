import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Loader2, Download, AlertCircle, CheckCircle2, Upload, FileText, Link as LinkIcon } from 'lucide-react';
import { importPlacesFromUrl, categorizePlaceFromName, ParsedPlace } from '../utils/mapsListParser';
import { parseCSV, geocodeCSVPlaces, validateCSVHeaders, generateExampleCSV, ParsedCSVPlace } from '../utils/csvParser';
import { Place } from '../App';

interface ImportPlacesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (places: Omit<Place, 'id'>[]) => void;
}

type ImportTab = 'url' | 'csv';

export function ImportPlacesDialog({ open, onOpenChange, onImport }: ImportPlacesDialogProps) {
  const [currentTab, setCurrentTab] = useState<ImportTab>('csv');
  
  // URL Import State
  const [url, setUrl] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  
  // CSV Import State
  const [file, setFile] = useState<File | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvProgress, setCsvProgress] = useState(0);
  const [csvPlaces, setCsvPlaces] = useState<ParsedCSVPlace[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Shared State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const handleUrlImport = async () => {
    if (!url.trim()) {
      setError('Please enter a Google Maps URL');
      return;
    }

    setIsImportingUrl(true);
    setError('');
    setSuccess(false);

    try {
      const places = await importPlacesFromUrl(url.trim());
      
      if (places.length === 0) {
        setError('Could not extract places from this URL. Try copying an individual place link.');
        setIsImportingUrl(false);
        return;
      }

      // Convert to Place format
      const convertedPlaces: Omit<Place, 'id'>[] = places.map(p => ({
        name: p.name,
        address: p.address,
        coordinates: p.coordinates,
        category: p.types ? categorizePlaceFromName(p.name) : 'other',
        notes: undefined,
      }));

      onImport(convertedPlaces);
      setImportedCount(convertedPlaces.length);
      setSuccess(true);
      
      // Reset after short delay
      setTimeout(() => {
        resetState();
        onOpenChange(false);
      }, 2000);
      
    } catch (err) {
      setError('Failed to import places. Please check the URL and try again.');
      console.error('Import error:', err);
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setCsvPlaces([]);
    }
  };

  const handleCsvImport = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setIsImportingCsv(true);
    setError('');
    setSuccess(false);
    setCsvProgress(0);

    try {
      // Read file
      const text = await file.text();
      
      // Validate format
      const validation = validateCSVHeaders(text);
      if (!validation.valid) {
        setError(validation.error || 'Invalid CSV format');
        setIsImportingCsv(false);
        return;
      }
      
      // Parse CSV
      const parsedPlaces = parseCSV(text);
      setCsvProgress(25);
      
      // Geocode all places
      const geocodedPlaces = await geocodeCSVPlaces(parsedPlaces);
      setCsvProgress(75);
      
      // Filter successful geocodes
      const successfulPlaces = geocodedPlaces.filter(p => p.coordinates);
      const failedPlaces = geocodedPlaces.filter(p => p.error);
      
      if (successfulPlaces.length === 0) {
        setError('Could not geocode any addresses. Please check your CSV file.');
        setIsImportingCsv(false);
        return;
      }
      
      setCsvPlaces(geocodedPlaces);
      
      // Convert to Place format with proper category validation
      const validCategories = ['restaurant', 'hotel', 'attraction', 'shopping', 'transport', 'other'];
      const convertedPlaces: Omit<Place, 'id'>[] = successfulPlaces.map(p => {
        let category: 'restaurant' | 'hotel' | 'attraction' | 'shopping' | 'transport' | 'other';
        
        if (p.category && validCategories.includes(p.category.toLowerCase())) {
          category = p.category.toLowerCase() as any;
        } else {
          category = categorizePlaceFromName(p.name);
        }
        
        return {
          name: p.name,
          address: p.address,
          coordinates: p.coordinates!,
          category,
          notes: p.notes,
        };
      });

      onImport(convertedPlaces);
      setImportedCount(successfulPlaces.length);
      setCsvProgress(100);
      setSuccess(true);
      
      if (failedPlaces.length > 0) {
        setError(`Successfully imported ${successfulPlaces.length} places. ${failedPlaces.length} failed to geocode.`);
      }
      
      // Reset after delay
      setTimeout(() => {
        resetState();
        onOpenChange(false);
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV. Please check the file format.');
      console.error('CSV import error:', err);
    } finally {
      setIsImportingCsv(false);
    }
  };

  const handleDownloadExample = () => {
    const csv = generateExampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'places-example.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setUrl('');
    setFile(null);
    setError('');
    setSuccess(false);
    setImportedCount(0);
    setCsvPlaces([]);
    setCsvProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const isImporting = isImportingUrl || isImportingCsv;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Import Places
          </DialogTitle>
          <DialogDescription>
            Import places from a CSV file or Google Maps URL
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as ImportTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Maps URL
            </TabsTrigger>
          </TabsList>

          {/* CSV Import Tab */}
          <TabsContent value="csv" className="space-y-4 mt-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <div className="flex gap-2">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadExample}
                  disabled={isImporting}
                  className="whitespace-nowrap"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Example
                </Button>
              </div>
              {file && (
                <p className="text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {/* CSV Format Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="mb-2">CSV file format:</p>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  <li><strong>Required columns:</strong> name, address</li>
                  <li><strong>Optional columns:</strong> category, notes</li>
                  <li>Category values: restaurant, hotel, attraction, shopping, transport, other</li>
                  <li>First row must be column headers</li>
                  <li>Click "Example" to download a sample CSV file</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Import Progress */}
            {isImportingCsv && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Importing places...</span>
                  <span className="text-gray-600">{csvProgress}%</span>
                </div>
                <Progress value={csvProgress} />
              </div>
            )}

            {/* CSV Preview */}
            {csvPlaces.length > 0 && (
              <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                <p className="text-sm mb-2">Import results:</p>
                <ul className="space-y-1">
                  {csvPlaces.map((place, index) => (
                    <li key={index} className="text-xs flex items-start gap-2">
                      {place.coordinates ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={place.coordinates ? 'text-gray-700' : 'text-red-600'}>
                        {place.name} - {place.error || 'Success'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          {/* URL Import Tab */}
          <TabsContent value="url" className="space-y-4 mt-4">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="maps-url">Google Maps URL</Label>
              <Input
                id="maps-url"
                placeholder="https://www.google.com/maps/place/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                disabled={isImporting}
              />
            </div>

            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="mb-2">How to import from Google Maps:</p>
                <ol className="list-decimal ml-4 space-y-1 text-xs">
                  <li>Find a place on Google Maps</li>
                  <li>Click on the place to open its details</li>
                  <li>Copy the URL from your browser address bar</li>
                  <li>Paste it here and click "Import"</li>
                  <li>Repeat for additional places</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* Bulk Import Tip */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-900">
                <p className="mb-1">
                  <strong>💡 For bulk imports, use CSV upload!</strong>
                </p>
                <p className="text-xs">
                  Create a spreadsheet with your places, export as CSV, and import all at once.
                </p>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && !success && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully imported {importedCount} place{importedCount !== 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={currentTab === 'csv' ? handleCsvImport : handleUrlImport}
            disabled={
              isImporting || 
              success || 
              (currentTab === 'csv' ? !file : !url.trim())
            }
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Imported!
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Places
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
