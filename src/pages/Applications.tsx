
import React, { useEffect, useState } from 'react';
import { Header } from '@/components/ui/header';
import { ApplicationsList, Application } from '@/components/applications/ApplicationsList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { useFirebase } from '@/hooks/use-firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Applications = () => {
  const { getRecentApplications, checkCVStatus } = useFirebase();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cvStatus = checkCVStatus();
  
  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        const apps = await getRecentApplications();
        
        // Formater les dates pour l'affichage
        const formattedApps = apps.map(app => ({
          ...app,
          date: app.applyDate ? format(app.applyDate.toDate(), 'yyyy-MM-dd') : app.date
        }));
        
        setApplications(formattedApps);
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

  // Données de démonstration pour afficher quelque chose si aucune vraie candidature n'existe
  const demoApplications: Application[] = [
    {
      id: '1',
      jobTitle: 'Assistant Commercial',
      company: 'TechCorp',
      platform: 'LinkedIn',
      status: 'applied',
      location: 'Paris 9e',
      date: '2023-05-15',
      travelTime: '25 min',
    },
    {
      id: '2',
      jobTitle: 'Assistant Category Manager',
      company: 'Retail Solutions',
      platform: 'Indeed',
      status: 'applied',
      location: 'Boulogne-Billancourt',
      date: '2023-05-14',
      travelTime: '40 min',
    },
    {
      id: '3',
      jobTitle: 'Assistant Administratif',
      company: 'Finance Group',
      platform: 'Hellowork',
      status: 'error',
      location: 'Paris 15e',
      date: '2023-05-14',
      travelTime: '35 min',
    },
    {
      id: '4',
      jobTitle: 'Vendeur Spécialisé',
      company: 'Electronics Store',
      platform: 'Indeed',
      status: 'applied',
      location: 'Créteil',
      date: '2023-05-13',
      travelTime: '20 min',
    },
    {
      id: '5',
      jobTitle: 'Commercial B2B',
      company: 'Service Pro',
      platform: 'LinkedIn',
      status: 'applied',
      location: 'Ivry-sur-Seine',
      date: '2023-05-12',
      travelTime: '15 min',
    },
    {
      id: '6',
      jobTitle: 'Assistant Category Manager',
      company: 'Supermarket Chain',
      platform: 'Hellowork',
      status: 'pending',
      location: 'Paris 13e',
      date: '2023-05-12',
      travelTime: '30 min',
    },
    {
      id: '7',
      jobTitle: 'Assistant Commercial Export',
      company: 'International Group',
      platform: 'LinkedIn',
      status: 'applied',
      location: 'Villejuif',
      date: '2023-05-11',
      travelTime: '10 min',
    },
    {
      id: '8',
      jobTitle: 'Vendeur Conseil',
      company: 'Retail Brand',
      platform: 'Indeed',
      status: 'applied',
      location: 'Thiais',
      date: '2023-05-10',
      travelTime: '25 min',
    },
  ];

  // Utiliser les vraies candidatures si disponibles, sinon les démos
  const displayApplications = applications.length > 0 ? applications : demoApplications;
  const isUsingDemoData = applications.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-semibold mb-6">Vos Candidatures</h1>
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
