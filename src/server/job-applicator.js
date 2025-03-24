
import puppeteer from 'puppeteer';
import axios from 'axios';
import { db, storage, admin } from './firebase-admin.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

class JobApplicator {
  constructor() {
    this.platformHandlers = {
      "LinkedIn": this.applyLinkedin,
      "Indeed": this.applyIndeed,
      "Hellowork": this.applyHellowork
    };
  }

  // Obtient les offres à postuler
  async getJobsToApply() {
    const jobsSnapshot = await db.collection('jobs')
      .where('status', '==', 'new')
      .limit(10)
      .get();
    
    const jobs = [];
    jobsSnapshot.forEach(doc => {
      jobs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return jobs;
  }

  // Télécharge le CV depuis Firebase Storage
  async downloadCV(cvPath) {
    const tempFilePath = path.join(os.tmpdir(), 'cv.pdf');
    const file = storage.bucket().file(cvPath);
    
    try {
      await file.download({ destination: tempFilePath });
      console.log(`CV téléchargé temporairement à: ${tempFilePath}`);
      return tempFilePath;
    } catch (error) {
      console.error("Erreur lors du téléchargement du CV:", error);
      throw error;
    }
  }

  // Postuler à toutes les offres en attente
  async applyToJobs(userProfile) {
    console.log("Démarrage du processus de candidature automatique");
    const jobs = await this.getJobsToApply();
    console.log(`${jobs.length} offres trouvées à postuler`);
    
    if (jobs.length === 0) {
      return { success: true, message: "Aucune offre en attente", appliedJobs: 0 };
    }
    
    // Télécharger le CV depuis Firebase Storage
    const cvPath = await this.downloadCV(userProfile.cvPath);
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const job of jobs) {
      try {
        console.log(`Tentative de candidature: ${job.jobTitle} chez ${job.company} via ${job.platform}`);
        
        // Obtenir la bonne fonction de candidature selon la plateforme
        const applyFunction = this.platformHandlers[job.platform];
        
        if (!applyFunction) {
          console.error(`Plateforme non prise en charge: ${job.platform}`);
          await this.updateJobStatus(job.id, 'error', 'Plateforme non prise en charge');
          failedCount++;
          continue;
        }
        
        // Postuler à l'offre
        const result = await applyFunction.call(this, job, cvPath, userProfile);
        
        if (result.success) {
          await this.updateJobStatus(job.id, 'applied', result.message);
          await this.logApplication(job, userProfile);
          successCount++;
        } else {
          await this.updateJobStatus(job.id, 'error', result.message);
          failedCount++;
        }
      } catch (error) {
        console.error(`Erreur lors de la candidature à ${job.jobTitle}:`, error);
        await this.updateJobStatus(job.id, 'error', error.message);
        failedCount++;
      }
      
      // Pause entre les candidatures pour éviter d'être bloqué
      await this.sleep(Math.random() * 5000 + 5000);
    }
    
    // Nettoyer le fichier temporaire
    try {
      fs.unlinkSync(cvPath);
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier temporaire:", error);
    }
    
    return {
      success: true,
      message: `Candidatures terminées: ${successCount} réussies, ${failedCount} échouées`,
      appliedJobs: successCount,
      failedJobs: failedCount
    };
  }

  // Mise à jour du statut d'une offre
  async updateJobStatus(jobId, status, message = '') {
    await db.collection('jobs').doc(jobId).update({
      status,
      statusMessage: message,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Enregistrement d'une candidature
  async logApplication(job, userProfile) {
    await db.collection('applications').add({
      jobTitle: job.jobTitle,
      company: job.company,
      platform: job.platform,
      location: job.location,
      status: 'applied',
      date: new Date().toISOString().split('T')[0],
      applyDate: admin.firestore.FieldValue.serverTimestamp(),
      jobId: job.id,
      userId: userProfile.userId,
      // Utiliser Google Maps Distance Matrix API pour calculer le temps de trajet
      travelTime: '30 min' // Valeur par défaut, à remplacer par l'API
    });
  }

  // Candidature LinkedIn
  async applyLinkedin(job, cvPath, userProfile) {
    console.log(`Candidature LinkedIn pour: ${job.jobTitle}`);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(job.listingUrl);
      
      // Vérifier si le bouton "Postuler" existe
      const applyButton = await page.$('.jobs-apply-button');
      if (!applyButton) {
        await browser.close();
        return { success: false, message: "Bouton de candidature non trouvé" };
      }
      
      // Cliquer sur le bouton "Postuler"
      await applyButton.click();
      
      // Attendre le formulaire de candidature
      await page.waitForSelector('form.jobs-easy-apply-form', { timeout: 10000 });
      
      // Remplir les informations
      await this.fillLinkedinForm(page, userProfile);
      
      // Téléverser le CV si nécessaire
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(cvPath);
      }
      
      // Soumettre le formulaire
      const submitButton = await page.$('.jobs-easy-apply-content button[aria-label="Soumettre la candidature"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForNavigation({ timeout: 10000 });
      }
      
      await browser.close();
      return { success: true, message: "Candidature soumise avec succès" };
    } catch (error) {
      console.error("Erreur lors de la candidature LinkedIn:", error);
      await browser.close();
      return { success: false, message: error.message };
    }
  }

  // Candidature Indeed
  async applyIndeed(job, cvPath, userProfile) {
    console.log(`Candidature Indeed pour: ${job.jobTitle}`);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(job.listingUrl);
      
      // Vérifier si le bouton "Postuler" existe
      const applyButton = await page.$('#indeedApplyButton');
      if (!applyButton) {
        await browser.close();
        return { success: false, message: "Bouton de candidature non trouvé" };
      }
      
      // Cliquer sur le bouton "Postuler"
      await applyButton.click();
      
      // Attendre le formulaire de candidature
      await page.waitForSelector('#ia-container', { timeout: 10000 });
      
      // Remplir les informations
      await this.fillIndeedForm(page, userProfile);
      
      // Téléverser le CV si nécessaire
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(cvPath);
      }
      
      // Soumettre le formulaire
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForNavigation({ timeout: 10000 });
      }
      
      await browser.close();
      return { success: true, message: "Candidature soumise avec succès" };
    } catch (error) {
      console.error("Erreur lors de la candidature Indeed:", error);
      await browser.close();
      return { success: false, message: error.message };
    }
  }

  // Candidature Hellowork
  async applyHellowork(job, cvPath, userProfile) {
    console.log(`Candidature HelloWork pour: ${job.jobTitle}`);
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      await page.goto(job.listingUrl);
      
      // Vérifier si le bouton "Postuler" existe
      const applyButton = await page.$('.apply-button');
      if (!applyButton) {
        await browser.close();
        return { success: false, message: "Bouton de candidature non trouvé" };
      }
      
      // Cliquer sur le bouton "Postuler"
      await applyButton.click();
      
      // Attendre le formulaire de candidature
      await page.waitForSelector('form.application-form', { timeout: 10000 });
      
      // Remplir les informations
      await this.fillHelloworkForm(page, userProfile);
      
      // Téléverser le CV si nécessaire
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(cvPath);
      }
      
      // Soumettre le formulaire
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForNavigation({ timeout: 10000 });
      }
      
      await browser.close();
      return { success: true, message: "Candidature soumise avec succès" };
    } catch (error) {
      console.error("Erreur lors de la candidature HelloWork:", error);
      await browser.close();
      return { success: false, message: error.message };
    }
  }

  // Méthodes utilitaires pour remplir les formulaires
  async fillLinkedinForm(page, userProfile) {
    // Remplir le formulaire LinkedIn 
    // Ce code est une approximation et doit être adapté selon l'interface réelle
    const formFields = await page.$$('.jobs-easy-apply-form-element');
    for (const field of formFields) {
      const label = await field.$('label');
      if (!label) continue;
      
      const labelText = await page.evaluate(el => el.textContent, label);
      const input = await field.$('input');
      
      if (input) {
        if (labelText.includes('Prénom')) {
          await input.type(userProfile.firstName);
        } else if (labelText.includes('Nom')) {
          await input.type(userProfile.lastName);
        } else if (labelText.includes('Email')) {
          await input.type(userProfile.email);
        } else if (labelText.includes('Téléphone')) {
          await input.type(userProfile.phone);
        }
      }
    }
  }

  async fillIndeedForm(page, userProfile) {
    // Remplir le formulaire Indeed
    // Ce code est une approximation et doit être adapté selon l'interface réelle
    await page.type('#input-applicant\\.name', `${userProfile.firstName} ${userProfile.lastName}`);
    await page.type('#input-applicant\\.email', userProfile.email);
    await page.type('#input-applicant\\.phone', userProfile.phone);
  }

  async fillHelloworkForm(page, userProfile) {
    // Remplir le formulaire HelloWork
    // Ce code est une approximation et doit être adapté selon l'interface réelle
    await page.type('input[name="firstName"]', userProfile.firstName);
    await page.type('input[name="lastName"]', userProfile.lastName);
    await page.type('input[name="email"]', userProfile.email);
    await page.type('input[name="phone"]', userProfile.phone);
  }

  // Utilitaire pour mettre en pause l'exécution
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const jobApplicator = new JobApplicator();
export default jobApplicator;
