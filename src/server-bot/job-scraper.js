
/**
 * Module de scraping des offres d'emploi
 */

// Fonction de scraping des offres d'emploi
async function startScraping(searchTerms, location, maxJobs = 20) {
  // Logique de scraping simulée (à implémenter avec Puppeteer dans une version complète)
  console.log(`Scraping pour: ${searchTerms} à ${location} (max: ${maxJobs} offres)`);
  
  // Simuler un délai pour un scraping fictif
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Générer des offres fictives pour la démo
  const mockJobs = Array.from({ length: Math.min(maxJobs, 20) }, (_, i) => ({
    id: `job-${Date.now()}-${i}`,
    title: `${searchTerms} - Position ${i+1}`,
    company: `Entreprise ${String.fromCharCode(65 + i % 26)}`,
    location: location,
    description: `Une opportunité passionnante pour un ${searchTerms}...`,
    url: `https://example.com/job-${i+1}`,
    salary: `${30000 + i * 1000}€ - ${40000 + i * 1000}€`,
    createdAt: new Date().toISOString(),
    status: 'new'
  }));
  
  console.log(`${mockJobs.length} offres d'emploi trouvées`);
  return mockJobs;
}

module.exports = {
  startScraping
};
