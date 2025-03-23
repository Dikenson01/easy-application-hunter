
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { BotControl } from '@/components/dashboard/BotControl';
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
  const { checkCVStatus, getRecentApplications } = useFirebase();
  const [botRunning, setBotRunning] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [todayApps, setTodayApps] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  
  const cvStatus = checkCVStatus();
  
  useEffect(() => {
    // Charger les applications récentes au chargement de la page
    async function loadApplications() {
      try {
        const apps = await getRecentApplications();
        setApplications(apps);
        
        // Calculer les applications du jour
        const today = new Date().toISOString().split('T')[0];
        const todayApplications = apps.filter(app => {
          if (app.applyDate) {
            const appDate = new Date(app.applyDate.toDate()).toISOString().split('T')[0];
            return appDate === today;
          }
          return false;
        });
        
        setTodayApps(todayApplications.length);
        
        // Générer les activités récentes basées sur les applications
        const activities: ActivityItem[] = apps.slice(0, 5).map(app => {
          return {
            id: app.id,
            type: app.status === 'applied' ? 'success' : app.status === 'error' ? 'error' : 'info',
            message: `Candidature ${app.status === 'applied' ? 'envoyée' : app.status === 'error' ? 'échouée' : 'en attente'} : ${app.jobTitle} chez ${app.company}`,
            timestamp: app.applyDate ? new Date(app.applyDate.toDate()).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : '00:00',
            details: `Candidature soumise via ${app.platform}`
          };
        });
        
        // Ajouter quelques activités supplémentaires si nécessaire
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
    
    // Simulation - Vérifier l'état du bot (normalement extrait d'une base de données)
    const botStatus = localStorage.getItem('botRunning');
    if (botStatus === 'true') {
      setBotRunning(true);
    }
  }, [checkCVStatus, getRecentApplications]);
  
  // Mock data pour les statistiques
  const stats = {
    totalApplications: applications.length || 0,
    todayApplications: todayApps,
    activeJobs: 42, // Remplacer par une API ou Web Scraping pour un chiffre réel
    avgTravelTime: '32 min',
  };
  
  const handleStartBot = () => {
    if (!cvStatus.isUploaded) {
      toast({
        title: "CV manquant",
        description: "Veuillez d'abord télécharger votre CV dans la section CV.",
        variant: "destructive"
      });
      return;
    }
    
    setBotRunning(true);
    localStorage.setItem('botRunning', 'true');
    
    toast({
      title: "Bot Démarré",
      description: "Le bot de candidature fonctionne maintenant en arrière-plan",
    });
    
    // Simuler le lancement du bot (dans un vrai projet, cette partie serait exécutée côté serveur)
    // Vous pourriez créer un job dans Firebase Functions par exemple
    simulateBotOperation();
  };
  
  const handleStopBot = () => {
    setBotRunning(false);
    localStorage.setItem('botRunning', 'false');
    
    toast({
      title: "Bot en Pause",
      description: "Le bot de candidature a été mis en pause",
    });
  };
  
  const handleResetBot = () => {
    setBotRunning(false);
    localStorage.setItem('botRunning', 'false');
    
    toast({
      title: "Bot Réinitialisé",
      description: "Le bot de candidature a été réinitialisé",
    });
  };
  
  // Simulation d'opération du bot pour la démonstration
  const simulateBotOperation = () => {
    toast({
      title: "Bot en action",
      description: "Recherche d'offres d'emploi en cours...",
    });
    
    // Dans une véritable implémentation, cela serait un processus backend
    // Mais pour une démo frontend, on peut simuler l'activité du bot
    setTimeout(() => {
      toast({
        title: "Nouvelles offres trouvées",
        description: "3 nouvelles offres correspondant à votre profil ont été trouvées",
      });
    }, 5000);
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
        
        <Card className="mt-8 p-4 border border-amber-200 bg-amber-50/50">
          <div className="flex gap-4 items-start">
            <div className="mt-1 flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">Comment fonctionne le bot</h3>
              <p className="text-sm text-amber-700 mt-1">
                1. <strong>Téléchargez votre CV</strong> dans la section CV.<br />
                2. <strong>Démarrez le bot</strong> depuis cette page. Il recherchera et posturera aux offres d'emploi correspondant à vos critères.<br />
                3. <strong>Suivez vos candidatures</strong> dans la section Candidatures.<br />
                4. En cas de Captcha, vous recevrez une notification pour intervenir manuellement.
              </p>
            </div>
          </div>
          
          <div className="mt-4 pl-9">
            <h4 className="font-medium text-amber-800 mb-2">Important: Comment fonctionne cette démo</h4>
            <p className="text-sm text-amber-700">
              Cette démonstration utilise Firebase pour stocker votre CV et suivre les candidatures, mais <strong>ne postule pas réellement aux offres</strong>. Pour une implémentation complète, un bot backend serait nécessaire pour:
            </p>
            <ul className="list-disc list-inside text-sm text-amber-700 mt-1 space-y-1">
              <li>Scraper les sites d'emploi (LinkedIn, Indeed, etc.)</li>
              <li>Filtrer les offres selon vos critères</li>
              <li>Remplir automatiquement les formulaires</li>
              <li>Gérer les captchas et authentifications</li>
            </ul>
            <p className="text-sm text-amber-700 mt-2">
              Cette fonctionnalité complète nécessiterait un développement backend plus avancé et l'utilisation d'APIs ou de scraping web.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Index;
