import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { BotControl } from '@/components/dashboard/BotControl';
import { ServerStatus } from '@/components/dashboard/ServerStatus';
import { useToast } from '@/hooks/use-toast';
import { Clock, Briefcase, Building, X, MapPin, AlertCircle, FileUp, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/hooks/use-firebase';
import { Card } from '@/components/ui/card';

interface ActivityItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: string;
  details?: string;
}

const Index = () => {
  const { toast } = useToast();
  const { 
    checkCVStatus, 
    getRecentApplications, 
    startBot, 
    stopBot, 
    resetBot,
    botStatus: initialBotStatus
  } = useFirebase();
  const [botRunning, setBotRunning] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [todayApps, setTodayApps] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  
  const cvStatus = checkCVStatus();
  
  useEffect(() => {
    async function loadApplications() {
      try {
        const apps = await getRecentApplications();
        setApplications(apps);
        
        const today = new Date().toISOString().split('T')[0];
        const todayApplications = apps.filter(app => {
          if (app.applyDate) {
            const appDate = new Date(app.applyDate.toDate()).toISOString().split('T')[0];
            return appDate === today;
          }
          return false;
        });
        
        setTodayApps(todayApplications.length);
        
        const activities: ActivityItem[] = apps.slice(0, 5).map(app => {
          return {
            id: app.id,
            type: app.status === 'applied' ? 'success' : app.status === 'error' ? 'error' : 'info',
            message: `Candidature ${app.status === 'applied' ? 'envoyée' : app.status === 'error' ? 'échouée' : 'en attente'} : ${app.jobTitle} chez ${app.company}`,
            timestamp: app.applyDate ? new Date(app.applyDate.toDate()).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : '00:00',
            details: `Candidature soumise via ${app.platform}`
          };
        });
        
        if (activities.length < 5) {
          if (cvStatus.isUploaded) {
            activities.push({
              id: 'cv-upload',
              type: 'success',
              message: 'CV téléchargé avec succès',
              timestamp: 'Récent',
              details: `Fichier: ${cvStatus.fileName}`
            });
          } else {
            activities.push({
              id: 'cv-missing',
              type: 'warning',
              message: 'CV manquant - Action requise',
              timestamp: 'Maintenant',
              details: 'Veuillez télécharger votre CV pour activer le bot'
            });
          }
          
          activities.push({
            id: 'bot-scheduled',
            type: 'info',
            message: 'Bot programmé pour les candidatures',
            timestamp: 'Demain, 9:00',
          });
        }
        
        setRecentActivities(activities);
      } catch (error) {
        console.error("Erreur lors du chargement des applications:", error);
      }
    }
    
    loadApplications();
    
    const botStatus = localStorage.getItem('botRunning');
    if (botStatus === 'true') {
      setBotRunning(true);
    }
  }, [checkCVStatus, getRecentApplications]);
  
  const stats = {
    totalApplications: applications.length || 0,
    todayApplications: todayApps,
    activeJobs: 42,
    avgTravelTime: '32 min',
  };
  
  const handleStartBot = async () => {
    if (!cvStatus.isUploaded) {
      toast({
        title: "CV manquant",
        description: "Veuillez d'abord télécharger votre CV dans la section CV.",
        variant: "destructive"
      });
      return;
    }
    
    setBotRunning(true);
    
    toast({
      title: "Bot Démarré",
      description: "Le bot de candidature recherche des offres et postule automatiquement",
    });
    
    try {
      const result = await startBot();
      
      toast({
        title: "Candidatures effectuées",
        description: `${result.appliedJobs || 0} candidatures ont été soumises avec succès`,
      });
    } catch (error) {
      console.error("Erreur lors du démarrage du bot:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le bot. Vérifiez que le serveur est en ligne.",
        variant: "destructive"
      });
    }
  };
  
  const handleStopBot = () => {
    setBotRunning(false);
    stopBot();
    
    toast({
      title: "Bot en Pause",
      description: "Le bot de candidature a été mis en pause",
    });
  };
  
  const handleResetBot = () => {
    setBotRunning(false);
    resetBot();
    
    toast({
      title: "Bot Réinitialisé",
      description: "Le bot de candidature a été réinitialisé",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <ServerStatus className="mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="md:col-span-1">
            <BotControl 
              onStart={handleStartBot}
              onStop={handleStopBot}
              onReset={handleResetBot}
              initialStatus={botRunning ? "running" : "idle"}
            />
            
            {!cvStatus.isUploaded && (
              <div className="mt-4 p-4 rounded-lg border-2 border-amber-300 bg-amber-50 flex items-center gap-3">
                <FileUp className="h-5 w-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-amber-800 font-medium">Étape 1: Téléchargez votre CV</p>
                  <p className="text-sm text-amber-700">Vous devez d'abord télécharger votre CV avant de pouvoir démarrer le bot.</p>
                  <Button asChild className="mt-2 bg-amber-500 hover:bg-amber-600">
                    <Link to="/resume">Aller à la page CV</Link>
                  </Button>
                </div>
              </div>
            )}
            
            {cvStatus.isUploaded && !botRunning && (
              <div className="mt-4 p-4 rounded-lg border-2 border-blue-300 bg-blue-50 flex items-center gap-3">
                <Bot className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-blue-800 font-medium">Étape 2: Démarrez le bot</p>
                  <p className="text-sm text-blue-700">
                    CV détecté! Vous pouvez maintenant démarrer le bot pour commencer à postuler automatiquement.
                  </p>
                </div>
              </div>
            )}
          </div>
          
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
        
        <Card className="mt-8 p-4 border border-green-200 bg-green-50/50">
          <div className="flex gap-4 items-start">
            <div className="mt-1 flex-shrink-0">
              <Bot className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">Bot de Candidature Automatisé</h3>
              <p className="text-sm text-green-700 mt-1">
                Ce bot postule réellement aux offres d'emploi correspondant à votre profil. Voici comment ça fonctionne:
              </p>
            </div>
          </div>
          
          <div className="mt-4 pl-9">
            <ol className="list-decimal list-outside space-y-2 text-sm text-green-700">
              <li className="ml-4"><strong>Téléchargez votre CV</strong> dans la section CV.</li>
              <li className="ml-4"><strong>Démarrez le bot</strong> depuis cette page. Il va:
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                  <li>Scraper les sites d'emploi (LinkedIn, Indeed, Hellowork)</li>
                  <li>Filtrer les offres selon vos critères</li>
                  <li>Remplir automatiquement les formulaires de candidature</li>
                  <li>Gérer les interactions basiques avec les sites</li>
                </ul>
              </li>
              <li className="ml-4"><strong>Suivez vos candidatures</strong> dans la section Candidatures.</li>
              <li className="ml-4">En cas de <strong>Captcha ou authentification nécessaire</strong>, intervenez manuellement.</li>
            </ol>
            
            <div className="mt-6 p-3 rounded-md bg-green-100 border border-green-300">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Important
              </h4>
              <p className="text-sm text-green-700">
                Pour que le bot fonctionne entièrement, le <strong>serveur backend doit être démarré</strong>. Exécutez la commande:
              </p>
              <pre className="mt-2 p-2 bg-green-200 rounded text-xs">node src/server-bot/startup.js</pre>
              <p className="text-sm mt-2 text-green-700">
                Le serveur écoutera sur le port 5000 et le bot pourra alors automatiser les candidatures.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;

