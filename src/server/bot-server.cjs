
// Importer les modules nécessaires en format CommonJS
const express = require('express');
const cors = require('cors');
const { db, admin } = require('./firebase-admin.cjs');

// Pour les modules ES qui pourraient être nécessaires, nous utiliserions une approche différente
// Pour l'instant, nous supposons que job-scraper et job-applicator sont également en format CommonJS
// Si ce n'est pas le cas, ils devront également être convertis
const jobScraper = require('./job-scraper.cjs');
const jobApplicator = require('./job-applicator.cjs');

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Vérification de l'état du serveur
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'Bot de candidature actif' });
});

// Récupérer le profil utilisateur depuis Firestore
async function getUserProfile(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('Profil utilisateur non trouvé');
    }
    return userDoc.data();
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
}

// Routes API
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'Serveur bot opérationnel' });
});

// Démarrer le scraping
app.post('/api/scrape', async (req, res) => {
  try {
    const { searchTerms, location, maxJobs } = req.body;
    
    if (!searchTerms || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les termes de recherche et la localisation sont requis' 
      });
    }
    
    // Lancer le scraping
    const jobs = await jobScraper.startScraping(searchTerms, location, maxJobs || 20);
    
    res.json({ 
      success: true, 
      message: `${jobs.length} offres d'emploi trouvées et enregistrées`,
      jobCount: jobs.length
    });
  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du scraping des offres',
      error: error.message
    });
  }
});

// Démarrer le processus de candidature
app.post('/api/apply', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur requis' 
      });
    }
    
    // Récupérer le profil utilisateur
    const userProfile = await getUserProfile(userId);
    
    // Vérifier si le CV est disponible
    if (!userProfile.cvPath) {
      return res.status(400).json({ 
        success: false, 
        message: 'CV non trouvé. Veuillez d\'abord télécharger votre CV.' 
      });
    }
    
    // Lancer le processus de candidature
    const result = await jobApplicator.applyToJobs(userProfile);
    
    res.json({ 
      success: true, 
      message: result.message,
      appliedJobs: result.appliedJobs,
      failedJobs: result.failedJobs
    });
  } catch (error) {
    console.error('Erreur lors du processus de candidature:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du processus de candidature',
      error: error.message
    });
  }
});

// Obtenir les offres d'emploi récentes
app.get('/api/jobs', async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let query = db.collection('jobs');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(parseInt(limit) || 20);
    
    const snapshot = await query.get();
    const jobs = [];
    
    snapshot.forEach(doc => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ 
      success: true, 
      jobs 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des offres',
      error: error.message
    });
  }
});

// Obtenir les candidatures récentes
app.get('/api/applications', async (req, res) => {
  try {
    const { userId, limit } = req.query;
    
    let query = db.collection('applications');
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    query = query.orderBy('applyDate', 'desc').limit(parseInt(limit) || 20);
    
    const snapshot = await query.get();
    const applications = [];
    
    snapshot.forEach(doc => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ 
      success: true, 
      applications 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    });
  }
});

// Démarrer le serveur avec gestion des erreurs de port
const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Serveur bot démarré sur le port ${PORT}`);
      console.log(`Accès à l'API: http://localhost:${PORT}/api/status`);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé.`);
        console.log('Suggestions:');
        console.log(`1. Libérez le port avec la commande: lsof -i :${PORT} puis kill -9 <PID>`);
        console.log('2. Ou spécifiez un port différent avec:');
        console.log('   SERVER_PORT=5001 node src/server/bot-server.cjs');
      } else {
        console.error('Erreur au démarrage du serveur:', error);
      }
    });
  } catch (error) {
    console.error('Erreur au démarrage du serveur:', error);
  }
};

startServer();

module.exports = app;
