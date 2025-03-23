
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
      message: 'Candidature envoyée : Assistant Marketing chez CompanyX',
      timestamp: '10:45',
      details: 'Candidature soumise via LinkedIn',
    },
    {
      id: '2',
      type: 'success' as const,
      message: 'Candidature envoyée : Assistant Commercial chez CompanyY',
      timestamp: '9:30',
      details: 'Candidature soumise via Indeed',
    },
    {
      id: '3',
      type: 'error' as const,
      message: 'Échec de candidature : Commercial chez CompanyZ',
      timestamp: '9:15',
      details: 'Captcha détecté. Intervention manuelle requise.',
    },
    {
      id: '4',
      type: 'info' as const,
      message: 'Bot programmé pour redémarrer',
      timestamp: 'Demain, 9:00',
    },
    {
      id: '5',
      type: 'warning' as const,
      message: 'Mise à jour du CV recommandée',
      timestamp: 'Hier',
      details: 'Votre CV date de plus de 30 jours',
    },
  ];
  
  const handleStartBot = () => {
    setBotRunning(true);
    toast({
      title: "Bot Démarré",
      description: "Le bot de candidature fonctionne maintenant en arrière-plan",
    });
  };
  
  const handleStopBot = () => {
    setBotRunning(false);
    toast({
      title: "Bot en Pause",
      description: "Le bot de candidature a été mis en pause",
    });
  };
  
  const handleResetBot = () => {
    setBotRunning(false);
    toast({
      title: "Bot Réinitialisé",
      description: "Le bot de candidature a été réinitialisé",
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
                title="Total Candidatures" 
                value={stats.totalApplications}
                description="Historique"
                icon={<Briefcase className="h-4 w-4" />}
              />
              <StatusCard 
                title="Candidatures du Jour" 
                value={stats.todayApplications}
                trend="up"
                trendValue="+3"
                icon={<Clock className="h-4 w-4" />}
              />
              <StatusCard 
                title="Offres Actives" 
                value={stats.activeJobs}
                description="Région parisienne"
                icon={<Building className="h-4 w-4" />}
              />
              <StatusCard 
                title="Temps de Trajet Moyen" 
                value={stats.avgTravelTime}
                description="Depuis Vitry-sur-Seine"
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
            <h3 className="font-medium text-amber-800">Intervention manuelle parfois nécessaire</h3>
            <p className="text-sm text-amber-700 mt-1">
              Certaines plateformes d'emploi utilisent des captchas pour empêcher les candidatures automatisées. 
              Lorsqu'un captcha est détecté, le bot se met en pause et vous notifie pour compléter 
              la vérification manuellement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
