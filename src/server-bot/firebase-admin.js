
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Vérifier si les identifiants sont disponibles dans les variables d'environnement
let serviceAccount;

// Essayer de lire depuis les variables d'environnement
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Utilisation des identifiants Firebase depuis les variables d'environnement");
  } catch (error) {
    console.error("Erreur lors de l'analyse des identifiants Firebase:", error);
  }
} else {
  // Sinon, essayer de lire depuis un fichier local
  const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
  
  if (fs.existsSync(credentialsPath)) {
    try {
      serviceAccount = require(credentialsPath);
      console.log("Utilisation des identifiants Firebase depuis le fichier local");
    } catch (error) {
      console.error("Erreur lors de la lecture du fichier d'identifiants Firebase:", error);
    }
  } else {
    // Utiliser des identifiants fictifs pour le développement
    console.log("Aucun identifiant Firebase trouvé, utilisation des identifiants par défaut");
    serviceAccount = {
      "type": "service_account",
      "project_id": "cv-auto-1f01e",
      "private_key_id": "votre_private_key_id",
      "private_key": "-----BEGIN PRIVATE KEY-----\nVotre clé privée ici\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-xxxxx@cv-auto-1f01e.iam.gserviceaccount.com",
      "client_id": "votre_client_id",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40cv-auto-1f01e.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };
  }
}

// Initialisation de l'application admin Firebase
try {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "cv-auto-1f01e.appspot.com"
    });
    console.log("Firebase Admin SDK initialisé avec succès");
  }
} catch (error) {
  console.error("Erreur lors de l'initialisation de Firebase Admin SDK:", error);
  console.log("Le serveur fonctionnera en mode dégradé (sans accès à la base de données)");
}

const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, db, storage };
