
import admin from 'firebase-admin';

// Using environment variables or a fallback for local development
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : {
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

// Initialisation de l'application admin Firebase
let db;
let storage;

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "cv-auto-1f01e.appspot.com"
  });
  console.log("Firebase Admin SDK initialized successfully");
  
  db = admin.firestore();
  storage = admin.storage();
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  
  // Creating a mock Firestore implementation for demo mode
  console.log('Using demo mode (without Firebase)');
  db = {
    collection: (name) => ({
      doc: (id) => ({
        get: async () => ({ exists: true, data: () => ({ id, name: 'Test User' }) }),
        set: async (data) => console.log(`Mock: document ${id} written to ${name}`, data)
      }),
      where: () => ({ orderBy: () => ({ limit: () => ({ get: async () => ({ forEach: () => {} }) }) }) }),
      orderBy: () => ({ limit: () => ({ get: async () => ({ forEach: () => {} }) }) }),
      add: async (data) => console.log(`Mock: document added to ${name}`, data)
    })
  };
  
  storage = {
    bucket: () => ({
      file: () => ({
        download: async () => console.log('Mock: file download')
      })
    })
  };
}

export { admin, db, storage };
