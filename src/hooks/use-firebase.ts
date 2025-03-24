
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  Timestamp, 
  where, 
  doc, 
  setDoc 
} from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import axios from "axios";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  platform: "LinkedIn" | "Indeed" | "Hellowork";
  status: 'applied' | 'pending' | 'error';
  location: string;
  date: string;
  travelTime: string;
  applyDate: Timestamp;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cvPath: string;
  cvUrl: string;
  preferences: {
    jobTitles: string[];
    locations: string[];
    maxTravelTime: number;
    autoApply: boolean;
  };
}

// URL du serveur backend
// Remarque: Dans un environnement réel, cela devrait être configurable
const BOT_SERVER_URL = "http://localhost:5000/api";

export function useFirebase() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [botStatus, setBotStatus] = useState<'idle' | 'running' | 'paused' | 'error'>('idle');

  // Vérifier l'état du bot
  const checkBotStatus = async () => {
    try {
      const response = await axios.get(`${BOT_SERVER_URL}/status`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut du bot:", error);
      return { status: 'error', message: 'Impossible de contacter le bot' };
    }
  };

  // Upload CV to Firebase Storage
  const uploadCV = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const storageRef = ref(storage, `cvs/${file.name}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Générer un ID utilisateur unique si n'existe pas déjà
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('userId', userId);
      }
      
      // Créer/mettre à jour le profil utilisateur dans Firestore
      const userProfile: Omit<UserProfile, 'userId'> = {
        firstName: localStorage.getItem('firstName') || 'Utilisateur',
        lastName: localStorage.getItem('lastName') || 'Test',
        email: localStorage.getItem('email') || 'utilisateur@example.com',
        phone: localStorage.getItem('phone') || '0600000000',
        cvPath: `cvs/${file.name}`,
        cvUrl: downloadURL,
        preferences: {
          jobTitles: ['Commercial', 'Assistant', 'Vendeur'],
          locations: ['Paris', 'Ile-de-France'],
          maxTravelTime: 60,
          autoApply: true
        }
      };
      
      // Enregistrer le profil utilisateur
      await setDoc(doc(db, "users", userId), {
        userId,
        ...userProfile,
        updatedAt: Timestamp.now()
      });
      
      // Save CV info in Firestore
      await addDoc(collection(db, "cvs"), {
        fileName: file.name,
        fileUrl: downloadURL,
        uploadDate: Timestamp.now(),
        fileSize: file.size,
        fileType: file.type,
        userId
      });
      
      // Store in localStorage that CV is uploaded
      localStorage.setItem('cvUploaded', 'true');
      localStorage.setItem('cvFileName', file.name);
      localStorage.setItem('cvUrl', downloadURL);
      
      setIsUploading(false);
      setUploadProgress(100);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading CV:", error);
      setUploadError("Erreur lors du téléchargement du CV.");
      setIsUploading(false);
      throw error;
    }
  };

  // Log a new job application
  const logApplication = async (application: Omit<Application, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, "applications"), {
        ...application,
        applyDate: Timestamp.now()
      });
      
      // Fixed: Create a new object with spread and explicitly type it
      const newApplication: Application = {
        id: docRef.id,
        ...application
      };
      
      return newApplication;
    } catch (error) {
      console.error("Error logging application:", error);
      throw error;
    }
  };

  // Get recent applications
  const getRecentApplications = async (): Promise<Application[]> => {
    try {
      const userId = localStorage.getItem('userId');
      
      // Si connecté au serveur bot, essayer d'obtenir les données à jour
      try {
        const response = await axios.get(`${BOT_SERVER_URL}/applications`, {
          params: { userId, limit: 20 }
        });
        
        if (response.data.success) {
          return response.data.applications;
        }
      } catch (error) {
        console.log("Le serveur bot n'est pas disponible, utilisation des données locales");
      }
      
      // Sinon, utiliser les données de Firestore directement
      let q;
      
      if (userId) {
        q = query(
          collection(db, "applications"),
          where("userId", "==", userId),
          orderBy("applyDate", "desc"),
          limit(20)
        );
      } else {
        q = query(
          collection(db, "applications"),
          orderBy("applyDate", "desc"),
          limit(20)
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
    } catch (error) {
      console.error("Error getting applications:", error);
      return [];
    }
  };

  // Check if CV is uploaded
  const checkCVStatus = () => {
    return {
      isUploaded: localStorage.getItem('cvUploaded') === 'true',
      fileName: localStorage.getItem('cvFileName') || null,
      fileUrl: localStorage.getItem('cvUrl') || null
    };
  };

  // Démarrer le bot de candidature
  const startBot = async () => {
    if (!checkCVStatus().isUploaded) {
      throw new Error('Veuillez d\'abord télécharger votre CV');
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Utilisateur non identifié');
    }
    
    try {
      setBotStatus('running');
      setIsBotRunning(true);
      localStorage.setItem('botRunning', 'true');
      
      // Premièrement, scraper les offres d'emploi
      await axios.post(`${BOT_SERVER_URL}/scrape`, {
        searchTerms: 'Commercial Assistant Vendeur',
        location: 'Paris',
        maxJobs: 30
      });
      
      // Ensuite, démarrer les candidatures
      const response = await axios.post(`${BOT_SERVER_URL}/apply`, {
        userId
      });
      
      return response.data;
    } catch (error) {
      console.error("Erreur lors du démarrage du bot:", error);
      setBotStatus('error');
      setIsBotRunning(false);
      localStorage.setItem('botRunning', 'false');
      throw error;
    }
  };

  // Mettre en pause le bot
  const stopBot = () => {
    setBotStatus('paused');
    setIsBotRunning(false);
    localStorage.setItem('botRunning', 'false');
    return { success: true, message: 'Bot mis en pause' };
  };

  // Réinitialiser le bot
  const resetBot = () => {
    setBotStatus('idle');
    setIsBotRunning(false);
    localStorage.setItem('botRunning', 'false');
    return { success: true, message: 'Bot réinitialisé' };
  };

  return {
    uploadCV,
    logApplication,
    getRecentApplications,
    checkCVStatus,
    startBot,
    stopBot,
    resetBot,
    isBotRunning,
    botStatus,
    isUploading,
    uploadProgress,
    uploadError
  };
}
