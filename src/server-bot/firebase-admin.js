
const admin = require('firebase-admin');

// Vérifiez si Firebase Admin SDK est déjà initialisé
if (!admin.apps.length) {
  try {
    // En développement, utilisez les identifiants par défaut
    admin.initializeApp();
    console.log('Firebase Admin SDK initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin SDK:', error);
  }
}

const db = admin.firestore();

module.exports = { admin, db };
