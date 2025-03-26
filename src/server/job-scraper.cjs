
// Stub pour job-scraper.cjs (version CommonJS)
// Note: Cette version est très simplifiée pour les tests
// Vous devrez probablement adapter le véritable contenu de ce fichier

const startScraping = async (searchTerms, location, maxJobs) => {
  console.log(`Début du scraping pour: ${searchTerms} à ${location}, max: ${maxJobs} offres`);
  
  // Simuler le scraping (remplacer par le vrai code)
  const mockJobs = [];
  for (let i = 1; i <= Math.min(maxJobs, 5); i++) {
    mockJobs.push({
      id: `job-${i}`,
      title: `${searchTerms} - Offre ${i}`,
      company: `Entreprise ${i}`,
      location: location,
      description: `Description de l'offre ${i}`,
      url: `https://example.com/job-${i}`,
      createdAt: new Date().toISOString()
    });
  }
  
  console.log(`${mockJobs.length} offres trouvées`);
  return mockJobs;
};

module.exports = {
  startScraping
};
