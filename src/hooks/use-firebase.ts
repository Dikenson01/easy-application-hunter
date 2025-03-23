
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  platform: string;
  status: 'applied' | 'pending' | 'error';
  location: string;
  date: string;
  travelTime: string;
  applyDate: Timestamp;
}

export function useFirebase() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      
      // Save CV info in Firestore
      await addDoc(collection(db, "cvs"), {
        fileName: file.name,
        fileUrl: downloadURL,
        uploadDate: Timestamp.now(),
        fileSize: file.size,
        fileType: file.type
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
      
      return {
        id: docRef.id,
        ...application
      };
    } catch (error) {
      console.error("Error logging application:", error);
      throw error;
    }
  };

  // Get recent applications
  const getRecentApplications = async (): Promise<Application[]> => {
    try {
      const q = query(
        collection(db, "applications"),
        orderBy("applyDate", "desc"),
        limit(20)
      );
      
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

  return {
    uploadCV,
    logApplication,
    getRecentApplications,
    checkCVStatus,
    isUploading,
    uploadProgress,
    uploadError
  };
}
