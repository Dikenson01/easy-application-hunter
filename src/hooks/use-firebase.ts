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
  setDoc,
  DocumentData
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

const BOT_SERVER_URL = "http://localhost:5000/api";

export function useFirebase() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [botStatus, setBotStatus] = useState<'idle' | 'running' | 'paused' | 'error'>('idle');

  const checkBotStatus = async () => {
    try {
      const response = await axios.get(`${BOT_SERVER_URL}/status`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification du statut du bot:", error);
      return { status: 'error', message: 'Impossible de contacter le bot' };
    }
  };

  const uploadCV = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const storageRef = ref(storage, `cvs/${file.name}`);
      await uploadBytes(storageRef, file);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('userId', userId);
      }
      
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
      
      await setDoc(doc(db, "users", userId), {
        userId,
        ...userProfile,
        updatedAt: Timestamp.now()
      });
      
      await addDoc(collection(db, "cvs"), {
        fileName: file.name,
        fileUrl: downloadURL,
        uploadDate: Timestamp.now(),
        fileSize: file.size,
        fileType: file.type,
        userId
      });
      
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

  const logApplication = async (application: Omit<Application, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, "applications"), {
        ...application,
        applyDate: Timestamp.now()
      });
      
      const newApplication: Application = {
        id: docRef.id,
        jobTitle: application.jobTitle,
        company: application.company,
        platform: application.platform,
        status: application.status,
        location: application.location,
        date: application.date,
        travelTime: application.travelTime,
        applyDate: application.applyDate || Timestamp.now()
      };
      
      return newApplication;
    } catch (error) {
      console.error("Error logging application:", error);
      throw error;
    }
  };

  const getRecentApplications = async (): Promise<Application[]> => {
    try {
      const userId = localStorage.getItem('userId');
      
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
      const applications: Application[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          jobTitle: data.jobTitle,
          company: data.company,
          platform: data.platform as "LinkedIn" | "Indeed" | "Hellowork",
          status: data.status as 'applied' | 'pending' | 'error',
          location: data.location,
          date: data.date,
          travelTime: data.travelTime,
          applyDate: data.applyDate
        });
      });
      
      return applications;
    } catch (error) {
      console.error("Error getting applications:", error);
      return [];
    }
  };

  const checkCVStatus = () => {
    return {
      isUploaded: localStorage.getItem('cvUploaded') === 'true',
      fileName: localStorage.getItem('cvFileName') || null,
      fileUrl: localStorage.getItem('cvUrl') || null
    };
  };

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
      
      await axios.post(`${BOT_SERVER_URL}/scrape`, {
        searchTerms: 'Commercial Assistant Vendeur',
        location: 'Paris',
        maxJobs: 30
      });
      
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

  const stopBot = () => {
    setBotStatus('paused');
    setIsBotRunning(false);
    localStorage.setItem('botRunning', 'false');
    return { success: true, message: 'Bot mis en pause' };
  };

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
