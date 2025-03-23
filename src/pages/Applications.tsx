
import React from 'react';
import { Header } from '@/components/ui/header';
import { ApplicationsList, Application } from '@/components/applications/ApplicationsList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';

const Applications = () => {
  // Mock data for applications
  const applications: Application[] = [
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

  // Simulation - À remplacer par une vérification réelle de la BDD
  const hasCvUploaded = () => {
    return localStorage.getItem('cvUploaded') === 'true';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-semibold mb-6">Vos Candidatures</h1>
          <p className="text-muted-foreground mb-8">
            Suivez toutes vos candidatures automatisées en un seul endroit.
          </p>
          
          {!hasCvUploaded() && (
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
          
          <ApplicationsList applications={applications} />
        </div>
      </main>
    </div>
  );
};

export default Applications;
