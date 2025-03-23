
import React from 'react';
import { Header } from '@/components/ui/header';
import { ApplicationsList, Application } from '@/components/applications/ApplicationsList';

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
      jobTitle: 'Category Manager Assistant',
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl px-4 py-8 mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-semibold mb-6">Your Applications</h1>
          <p className="text-muted-foreground mb-8">
            Track all of your automated job applications in one place.
          </p>
          
          <ApplicationsList applications={applications} />
        </div>
      </main>
    </div>
  );
};

export default Applications;
