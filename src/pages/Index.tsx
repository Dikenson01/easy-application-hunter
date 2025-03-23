
import React, { useState } from 'react';
import { Header } from '@/components/ui/header';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { BotControl } from '@/components/dashboard/BotControl';
import { useToast } from '@/hooks/use-toast';
import { Clock, Briefcase, Building, X, MapPin, AlertCircle } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [botRunning, setBotRunning] = useState(false);
  
  // Mock data
  const stats = {
    totalApplications: 127,
    todayApplications: 8,
    activeJobs: 42,
    avgTravelTime: '32 min',
  };
  
  const recentActivities = [
    {
      id: '1',
      type: 'success' as const,
      message: 'Applied to Marketing Assistant at CompanyX',
      timestamp: '10:45 AM',
      details: 'Application submitted through LinkedIn',
    },
    {
      id: '2',
      type: 'success' as const,
      message: 'Applied to Commercial Assistant at CompanyY',
      timestamp: '9:30 AM',
      details: 'Application submitted through Indeed',
    },
    {
      id: '3',
      type: 'error' as const,
      message: 'Failed to apply to Sales Associate at CompanyZ',
      timestamp: '9:15 AM',
      details: 'Captcha detected. Manual intervention required.',
    },
    {
      id: '4',
      type: 'info' as const,
      message: 'Bot scheduled to run again',
      timestamp: 'Tomorrow, 9:00 AM',
    },
    {
      id: '5',
      type: 'warning' as const,
      message: 'Resume update recommended',
      timestamp: 'Yesterday',
      details: 'Resume is over 30 days old',
    },
  ];
  
  const handleStartBot = () => {
    setBotRunning(true);
    toast({
      title: "Bot Started",
      description: "The application bot is now running in the background",
    });
  };
  
  const handleStopBot = () => {
    setBotRunning(false);
    toast({
      title: "Bot Paused",
      description: "The application bot has been paused",
    });
  };
  
  const handleResetBot = () => {
    setBotRunning(false);
    toast({
      title: "Bot Reset",
      description: "The application bot has been reset",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Bot Status Card */}
          <div className="md:col-span-1">
            <BotControl 
              onStart={handleStartBot}
              onStop={handleStopBot}
              onReset={handleResetBot}
              initialStatus="idle"
            />
          </div>
          
          {/* Statistics Cards */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard 
                title="Total Applications" 
                value={stats.totalApplications}
                description="All time"
                icon={<Briefcase className="h-4 w-4" />}
              />
              <StatusCard 
                title="Today's Applications" 
                value={stats.todayApplications}
                trend="up"
                trendValue="+3"
                icon={<Clock className="h-4 w-4" />}
              />
              <StatusCard 
                title="Active Jobs" 
                value={stats.activeJobs}
                description="Paris region"
                icon={<Building className="h-4 w-4" />}
              />
              <StatusCard 
                title="Avg. Travel Time" 
                value={stats.avgTravelTime}
                description="From Vitry-sur-Seine"
                icon={<MapPin className="h-4 w-4" />}
              />
            </div>
            
            <div className="mt-6">
              <ActivityLog activities={recentActivities} />
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 rounded-lg border border-amber-200 bg-amber-50/50 flex gap-4 items-start">
          <div className="mt-1 flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">Manual intervention may be required</h3>
            <p className="text-sm text-amber-700 mt-1">
              Some job platforms use captchas to prevent automated applications. When a captcha is detected, 
              the bot will pause and notify you to complete the verification manually.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
