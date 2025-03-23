
import React from 'react';
import { Header } from '@/components/ui/header';
import { PreferencesForm } from '@/components/settings/PreferencesForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Database, Bell, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const handleSavePreferences = (preferences: any) => {
    console.log('Saved preferences:', preferences);
  };
  
  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "Your application data has been exported as CSV",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-semibold mb-6">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Configure your application bot and manage your preferences.
          </p>
          
          <div className="grid gap-6">
            <PreferencesForm 
              onSave={handleSavePreferences}
              initialPreferences={{
                location: 'Vitry-sur-Seine',
                maxTravelTime: 50,
                jobTitles: ['assistant commercial', 'assistant category manager', 'assistant administratif', 'vendeur', 'commercial'],
                platforms: {
                  linkedin: true,
                  indeed: true,
                  hellowork: true,
                },
                refreshFrequency: 'daily',
                autoRestart: true,
              }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Data Management</CardTitle>
                  <CardDescription>
                    Manage application data and exports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention</Label>
                    <Select defaultValue="90days">
                      <SelectTrigger id="data-retention">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30days">30 days</SelectItem>
                        <SelectItem value="90days">90 days</SelectItem>
                        <SelectItem value="180days">180 days</SelectItem>
                        <SelectItem value="365days">1 year</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How long to keep your application history
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Export Data</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-secondary/50 transition-colors"
                        onClick={handleExportData}
                      >
                        <Database className="h-4 w-4 mr-1 inline-block" />
                        Export as CSV
                      </button>
                      <button 
                        className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-secondary/50 transition-colors"
                        onClick={handleExportData}
                      >
                        <Database className="h-4 w-4 mr-1 inline-block" />
                        Export as JSON
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Notifications</CardTitle>
                  <CardDescription>
                    Configure alerts and notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="captcha-alerts" className="text-base">Captcha Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts when manual captcha verification is needed
                      </p>
                    </div>
                    <Switch id="captcha-alerts" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-summary" className="text-base">Daily Summary</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive a daily summary of application activity
                      </p>
                    </div>
                    <Switch id="daily-summary" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="error-notifications" className="text-base">Error Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts when the bot encounters errors
                      </p>
                    </div>
                    <Switch id="error-notifications" defaultChecked />
                  </div>
                  
                  <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-1">Desktop Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Notifications will appear as desktop alerts when the application is running.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Privacy Settings</CardTitle>
                  <Badge variant="outline" className="text-xs">Local Only</Badge>
                </div>
                <CardDescription>
                  All data is stored locally on your computer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
                  <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Your Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      This application runs locally on your computer. Your data, including your resume and application history, 
                      is stored only on your device and is never sent to external servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 flex gap-4 items-start">
              <div className="mt-1 flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Development Preview</h3>
                <p className="text-sm text-amber-700 mt-1">
                  This application is a frontend prototype. In a production version, the backend automation with Selenium/Playwright 
                  would need to be implemented to enable actual job applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
