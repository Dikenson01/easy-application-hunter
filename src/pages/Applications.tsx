
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/ui/header';
import { ApplicationsList } from '@/components/applications/ApplicationsList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useFirebase, Application } from '@/hooks/use-firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Applications = () => {
  const { getRecentApplications, checkCVStatus, checkBotStatus } = useFirebase();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const { toast } = useToast();
  
  const cvStatus = checkCVStatus();
  
  // Vérifier l'état du système
  useEffect(() => {
    const checkSystem = async () => {
      try {
        const status = await checkBotStatus();
        setSystemStatus(status.status === 'online' ? 'online' : 'offline');
        
        if (status.status === 'online') {
          toast({
            title: "Système en ligne",
            description: "L'automatiseur de candidatures est opérationnel",
            variant: "default",
          });
        }
      } catch (err) {
        setSystemStatus('offline');
      }
    };
    
    checkSystem();
  }, [toast, checkBotStatus]);
  
  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        const apps = await getRecentApplications();
        
        // Formater les dates pour l'affichage
        const formattedApps = apps.map(app => {
          const formattedApp = {
            ...app,
            date: app.applyDate ? format(app.applyDate.toDate(), 'dd/MM/yyyy') : app.date
          };
          return formattedApp;
        });
        
        setApplications(formattedApps as Application[]);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures:", err);
        setError("Impossible de charger les candidatures. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    }
    
    loadApplications();
  }, [getRecentApplications]);

  // Créer des timestamps pour les dates de démonstration
  const demoDate1 = Timestamp.fromDate(new Date('2023-05-15'));
  const demoDate2 = Timestamp.fromDate(new Date('2023-05-14'));
  const demoDate3 = Timestamp.fromDate(new Date('2023-05-14'));

  // Données de démonstration pour afficher quelque chose si aucune vraie candidature n'existe
  const demoApplications: Application[] = [
    {
      id: '1',
      jobTitle: 'Assistant Commercial',
      company: 'TechCorp',
      platform: 'LinkedIn',
      status: 'applied',
      location: 'Paris 9e',
      date: '15/05/2023',
      travelTime: '25 min',
      applyDate: demoDate1,
    },
    {
      id: '2',
      jobTitle: 'Assistant Category Manager',
      company: 'Retail Solutions',
      platform: 'Indeed',
      status: 'applied',
      location: 'Boulogne-Billancourt',
      date: '14/05/2023',
      travelTime: '40 min',
      applyDate: demoDate2,
    },
    {
      id: '3',
      jobTitle: 'Assistant Administratif',
      company: 'Finance Group',
      platform: 'Hellowork',
      status: 'error',
      location: 'Paris 15e',
      date: '14/05/2023',
      travelTime: '35 min',
      applyDate: demoDate3,
    }
  ];

  // Utiliser les vraies candidatures si disponibles, sinon les démos
  const displayApplications = applications.length > 0 ? applications : demoApplications;
  const isUsingDemoData = applications.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Vos Candidatures</h1>
            {systemStatus === 'online' && (
              <Alert className="max-w-fit py-2 border-green-200 bg-green-50/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle className="ml-2 text-green-700">Système en ligne</AlertTitle>
              </Alert>
            )}
            {systemStatus === 'offline' && (
              <Alert className="max-w-fit py-2 border-amber-200 bg-amber-50/50">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="ml-2 text-amber-700">Système hors ligne</AlertTitle>
              </Alert>
            )}
          </div>
          
          <p className="text-muted-foreground mb-8">
            Suivez toutes vos candidatures automatisées en un seul endroit.
          </p>
          
          {!cvStatus.isUploaded && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <FileText className="h-8 w-8 text-amber-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-amber-800 mb-2">Aucune candidature pour le moment</h3>
                    <p className="text-amber-700 mb-4">
                      Pour commencer à postuler automatiquement, vous devez d'abord :
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-amber-700 mb-4">
                      <li>Télécharger votre CV dans la section CV</li>
                      <li>Démarrer le bot depuis le tableau de bord</li>
                    </ol>
                    <Button asChild className="bg-amber-500 hover:bg-amber-600">
                      <Link to="/resume">Télécharger votre CV</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isUsingDemoData && (
            <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50/50 flex gap-4 items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800">Données de démonstration</h3>
                <p className="text-sm text-amber-700">
                  Les candidatures affichées ci-dessous sont des exemples. Une fois le bot actif avec votre CV, 
                  de véritables candidatures apparaîtront ici.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-3 text-lg">Chargement des candidatures...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
              <h3 className="font-medium mb-2">Erreur</h3>
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </div>
          ) : (
            <ApplicationsList applications={displayApplications} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Applications;
