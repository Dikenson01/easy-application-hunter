
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import axios from 'axios';
import { db, admin } from './firebase-admin.js';

class JobScraper {
  constructor() {
    this.platforms = {
      linkedin: this.scrapeLinkedin,
      indeed: this.scrapeIndeed,
      hellowork: this.scrapeHellowork
    };
  }

  // Lance le scraping sur toutes les plateformes configurées
  async startScraping(searchTerms, location, maxJobs = 10) {
    console.log(`Démarrage du scraping pour: "${searchTerms}" à ${location}`);
    const allJobs = [];
    
    const tasks = Object.keys(this.platforms).map(async (platform) => {
      try {
        const jobs = await this.platforms[platform].call(this, searchTerms, location, Math.ceil(maxJobs / 3));
        console.log(`Récupéré ${jobs.length} offres depuis ${platform}`);
        return jobs;
      } catch (error) {
        console.error(`Erreur lors du scraping de ${platform}:`, error);
        return [];
      }
    });

    const results = await Promise.all(tasks);
    results.forEach(jobs => allJobs.push(...jobs));
    
    // Filtrer les duplications potentielles
    const uniqueJobs = this.removeDuplicates(allJobs);
    console.log(`Total des offres uniques trouvées: ${uniqueJobs.length}`);
    
    // Enregistrer dans Firestore
    await this.saveJobsToFirestore(uniqueJobs);
    
    return uniqueJobs;
  }

  // Supprime les offres dupliquées basées sur le titre et l'entreprise
  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.jobTitle.toLowerCase()}-${job.company.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Enregistre les offres dans Firestore
  async saveJobsToFirestore(jobs) {
    const batch = db.batch();
    
    jobs.forEach(job => {
      const jobRef = db.collection('jobs').doc();
      batch.set(jobRef, {
        ...job,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new'
      });
    });
    
    await batch.commit();
    console.log(`${jobs.length} offres enregistrées dans Firestore`);
  }

  // Scraping LinkedIn
  async scrapeLinkedin(searchTerms, location, maxJobs) {
    console.log(`Scraping LinkedIn pour: ${searchTerms} à ${location}`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    try {
      // Encode les termes de recherche pour l'URL
      const encodedSearchTerms = encodeURIComponent(searchTerms);
      const encodedLocation = encodeURIComponent(location);
      
      await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${encodedSearchTerms}&location=${encodedLocation}`);
      
      // Attente que les résultats se chargent
      await page.waitForSelector('.jobs-search__results-list', { timeout: 10000 });
      
      // Faire défiler pour charger plus de résultats
      await this.autoScroll(page);
      
      // Extraction des données
      const jobsData = await page.evaluate((maxJobs) => {
        const jobCards = Array.from(document.querySelectorAll('.job-search-card'));
        return jobCards.slice(0, maxJobs).map(card => {
          return {
            jobTitle: card.querySelector('.job-search-card__title')?.textContent.trim() || 'Titre non disponible',
            company: card.querySelector('.job-search-card__subtitle')?.textContent.trim() || 'Entreprise non disponible',
            location: card.querySelector('.job-search-card__location')?.textContent.trim() || 'Lieu non disponible',
            listingUrl: card.querySelector('.job-search-card__title')?.closest('a')?.href || '',
            platform: 'LinkedIn'
          };
        });
      }, maxJobs);
      
      return jobsData;
    } catch (error) {
      console.error("Erreur lors du scraping LinkedIn:", error);
      return [];
    } finally {
      await browser.close();
    }
  }

  // Scraping Indeed
  async scrapeIndeed(searchTerms, location, maxJobs) {
    console.log(`Scraping Indeed pour: ${searchTerms} à ${location}`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    try {
      // Encode les termes de recherche pour l'URL
      const encodedSearchTerms = encodeURIComponent(searchTerms);
      const encodedLocation = encodeURIComponent(location);
      
      await page.goto(`https://fr.indeed.com/emplois?q=${encodedSearchTerms}&l=${encodedLocation}`);
      
      // Attente que les résultats se chargent
      await page.waitForSelector('.jobsearch-ResultsList', { timeout: 10000 });
      
      // Faire défiler pour charger plus de résultats
      await this.autoScroll(page);
      
      // Extraction des données
      const jobsData = await page.evaluate((maxJobs) => {
        const jobCards = Array.from(document.querySelectorAll('.job_seen_beacon'));
        return jobCards.slice(0, maxJobs).map(card => {
          return {
            jobTitle: card.querySelector('[id^="jobTitle"]')?.textContent.trim() || 'Titre non disponible',
            company: card.querySelector('.companyName')?.textContent.trim() || 'Entreprise non disponible',
            location: card.querySelector('.companyLocation')?.textContent.trim() || 'Lieu non disponible',
            listingUrl: card.querySelector('[id^="jobTitle"]')?.closest('a')?.href || '',
            platform: 'Indeed'
          };
        });
      }, maxJobs);
      
      return jobsData;
    } catch (error) {
      console.error("Erreur lors du scraping Indeed:", error);
      return [];
    } finally {
      await browser.close();
    }
  }

  // Scraping HelloWork
  async scrapeHellowork(searchTerms, location, maxJobs) {
    console.log(`Scraping HelloWork pour: ${searchTerms} à ${location}`);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    try {
      // Encode les termes de recherche pour l'URL
      const encodedSearchTerms = encodeURIComponent(searchTerms);
      const encodedLocation = encodeURIComponent(location);
      
      await page.goto(`https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${encodedSearchTerms}&l=${encodedLocation}`);
      
      // Attente que les résultats se chargent
      await page.waitForSelector('.vacancy-container', { timeout: 10000 });
      
      // Faire défiler pour charger plus de résultats
      await this.autoScroll(page);
      
      // Extraction des données
      const jobsData = await page.evaluate((maxJobs) => {
        const jobCards = Array.from(document.querySelectorAll('.vacancy-container'));
        return jobCards.slice(0, maxJobs).map(card => {
          return {
            jobTitle: card.querySelector('.vacancy-title')?.textContent.trim() || 'Titre non disponible',
            company: card.querySelector('.vacancy-company')?.textContent.trim() || 'Entreprise non disponible',
            location: card.querySelector('.vacancy-location')?.textContent.trim() || 'Lieu non disponible',
            listingUrl: card.querySelector('.vacancy-link')?.href || '',
            platform: 'Hellowork'
          };
        });
      }, maxJobs);
      
      return jobsData;
    } catch (error) {
      console.error("Erreur lors du scraping HelloWork:", error);
      return [];
    } finally {
      await browser.close();
    }
  }

  // Fonction utilitaire pour faire défiler automatiquement la page
  async autoScroll(page) {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }
}

const jobScraper = new JobScraper();
export default jobScraper;
