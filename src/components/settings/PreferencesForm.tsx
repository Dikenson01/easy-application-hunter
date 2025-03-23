
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw } from 'lucide-react';

interface PreferencesFormProps {
  initialPreferences?: {
    location: string;
    maxTravelTime: number;
    jobTitles: string[];
    platforms: {
      linkedin: boolean;
      indeed: boolean;
      hellowork: boolean;
    };
    refreshFrequency: 'daily' | 'twice-daily' | 'hourly';
    autoRestart: boolean;
  };
  onSave: (preferences: any) => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  initialPreferences,
  onSave 
}) => {
  const { toast } = useToast();
  const [location, setLocation] = useState(initialPreferences?.location || 'Vitry-sur-Seine');
  const [maxTravelTime, setMaxTravelTime] = useState(initialPreferences?.maxTravelTime || 50);
  const [jobTitles, setJobTitles] = useState(initialPreferences?.jobTitles?.join(', ') || 'assistant commercial, assistant category manager, assistant administratif, vendeur, commercial');
  const [platforms, setPlatforms] = useState({
    linkedin: initialPreferences?.platforms.linkedin ?? true,
    indeed: initialPreferences?.platforms.indeed ?? true,
    hellowork: initialPreferences?.platforms.hellowork ?? true,
  });
  const [refreshFrequency, setRefreshFrequency] = useState(initialPreferences?.refreshFrequency || 'daily');
  const [autoRestart, setAutoRestart] = useState(initialPreferences?.autoRestart ?? true);
  
  const handleSave = () => {
    const preferences = {
      location,
      maxTravelTime,
      jobTitles: jobTitles.split(',').map(title => title.trim()),
      platforms,
      refreshFrequency,
      autoRestart,
    };
    
    onSave(preferences);
    
    toast({
      title: "Preferences Saved",
      description: "Your job search preferences have been updated.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Job Search Preferences</CardTitle>
        <CardDescription>
          Configure how the application bot should search and apply for jobs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Base Location</Label>
            <Input 
              id="location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
            />
            <p className="text-xs text-muted-foreground">
              This location will be used to calculate commute times
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="travel-time">Maximum Travel Time</Label>
              <span className="text-sm text-muted-foreground">{maxTravelTime} minutes</span>
            </div>
            <Slider
              id="travel-time"
              min={10}
              max={90}
              step={5}
              value={[maxTravelTime]}
              onValueChange={(value) => setMaxTravelTime(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 min</span>
              <span>Preferred: 30 min</span>
              <span>90 min</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-titles">Job Titles</Label>
            <Input 
              id="job-titles" 
              value={jobTitles}
              onChange={(e) => setJobTitles(e.target.value)}
              placeholder="Enter job titles separated by commas"
            />
            <p className="text-xs text-muted-foreground">
              The bot will search for these job titles, separated by commas
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="linkedin" className="flex items-center gap-2 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-blue-500/20" />
                  LinkedIn
                </Label>
                <Switch 
                  id="linkedin" 
                  checked={platforms.linkedin}
                  onCheckedChange={(checked) => setPlatforms({...platforms, linkedin: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="indeed" className="flex items-center gap-2 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-indigo-500/20" />
                  Indeed
                </Label>
                <Switch 
                  id="indeed" 
                  checked={platforms.indeed}
                  onCheckedChange={(checked) => setPlatforms({...platforms, indeed: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="hellowork" className="flex items-center gap-2 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-purple-500/20" />
                  Hellowork
                </Label>
                <Switch 
                  id="hellowork" 
                  checked={platforms.hellowork}
                  onCheckedChange={(checked) => setPlatforms({...platforms, hellowork: checked})}
                />
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refresh-frequency">Refresh Frequency</Label>
            <Select 
              value={refreshFrequency} 
              onValueChange={(value) => setRefreshFrequency(value as any)}
            >
              <SelectTrigger id="refresh-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Once daily</SelectItem>
                <SelectItem value="twice-daily">Twice daily</SelectItem>
                <SelectItem value="hourly">Every hour</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often should the bot check for new job listings
            </p>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-restart" className="text-base">Auto Restart</Label>
              <p className="text-xs text-muted-foreground">
                Automatically restart the bot if it encounters errors
              </p>
            </div>
            <Switch 
              id="auto-restart" 
              checked={autoRestart}
              onCheckedChange={setAutoRestart}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 px-6 py-4">
        <Button variant="secondary" type="button">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button type="button" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
};
