
const puppeteer = require("puppeteer");
const axios = require("axios");
const { db, storage, admin } = require("./firebase-admin");
const fs = require("fs");
const os = require("os");
const path = require("path");

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
    try {
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
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error);
      return [];
    }
  }

  // Télécharge le CV depuis Firebase Storage
  async downloadCV(cvPath) {
    const tempFilePath = path.join(os.tmpdir(), 'cv.pdf');
    
    try {
      const file = storage.bucket().file(cvPath);
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
      return { 
        success: true, 
        message: "Aucune offre en attente", 
        appliedJobs: 0,
        failedJobs: 0 
      };
    }
    
    // Télécharger le CV depuis Firebase Storage
    let cvPath;
    try {
      cvPath = await this.downloadCV(userProfile.cvPath);
    } catch (error) {
      return {
        success: false,
        message: "Impossible de télécharger le CV",
        appliedJobs: 0,
        failedJobs: jobs.length
      };
    }
    
    let successCount = 0;
    let failedCount = 0;
    const appliedJobs = [];
    const failedJobs = [];
    
    for (const job of jobs) {
      try {
        console.log(`Tentative de candidature: ${job.jobTitle} chez ${job.company} via ${job.platform}`);
        
        // Obtenir la bonne fonction de candidature selon la plateforme
        const applyFunction = this.platformHandlers[job.platform];
        
        if (!applyFunction) {
          console.error(`Plateforme non prise en charge: ${job.platform}`);
          await this.updateJobStatus(job.id, 'error', 'Plateforme non prise en charge');
          failedCount++;
          failedJobs.push({
            title: job.jobTitle,
            company: job.company,
            reason: 'Plateforme non prise en charge'
          });
          continue;
        }
        
        // Postuler à l'offre
        const result = await applyFunction.call(this, job, cvPath, userProfile);
        
        if (result.success) {
          await this.updateJobStatus(job.id, 'applied', result.message);
          await this.logApplication(job, userProfile);
          successCount++;
          appliedJobs.push({
            title: job.jobTitle,
            company: job.company
          });
        } else {
          await this.updateJobStatus(job.id, 'error', result.message);
          failedCount++;
          failedJobs.push({
            title: job.jobTitle,
            company: job.company,
            reason: result.message
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la candidature à ${job.jobTitle}:`, error);
        await this.updateJobStatus(job.id, 'error', error.message);
        failedCount++;
        failedJobs.push({
          title: job.jobTitle,
          company: job.company,
          reason: error.message
        });
      }
      
      // Pause entre les candidatures pour éviter d'être bloqué
      await this.sleep(Math.random() * 5000 + 5000);
    }
    
    // Nettoyer le fichier temporaire
    if (cvPath) {
      try {
        fs.unlinkSync(cvPath);
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier temporaire:", error);
      }
    }
    
    return {
      success: true,
      message: `Candidatures terminées: ${successCount} réussies, ${failedCount} échouées`,
      appliedJobs: successCount,
      failedJobs: failedCount,
      details: {
        applied: appliedJobs,
        failed: failedJobs
      }
    };
  }

  // Mise à jour du statut d'une offre
  async updateJobStatus(jobId, status, message = '') {
    try {
      await db.collection('jobs').doc(jobId).update({
        status,
        statusMessage: message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de l'offre ${jobId}:`, error);
    }
  }

  // Enregistrement d'une candidature
  async logApplication(job, userProfile) {
    try {
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
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la candidature:", error);
    }
  }

  // Candidature LinkedIn
  async applyLinkedin(job, cvPath, userProfile) {
    console.log(`Candidature LinkedIn pour: ${job.jobTitle}`);
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
      await page.goto(job.listingUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Vérifier si le bouton "Postuler" existe
      const applyButton = await page.$('.jobs-apply-button');
      if (!applyButton) {
        await browser.close();
        return { success: false, message: "Bouton de candidature non trouvé" };
      }
      
      // Cliquer sur le bouton "Postuler"
      await applyButton.click();
      
      // Attendre le formulaire de candidature
      await page.waitForSelector('form.jobs-easy-apply-form', { timeout: 10000 })
        .catch(() => console.log('Formulaire de candidature LinkedIn non trouvé'));
      
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
        await page.waitForNavigation({ timeout: 10000 })
          .catch(() => console.log('Pas de navigation après soumission'));
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
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
      await page.goto(job.listingUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Vérifier si le bouton "Postuler" existe
      const applyButton = await page.$('#indeedApplyButton');
      if (!applyButton) {
        await browser.close();
        return { success: false, message: "Bouton de candidature non trouvé" };
      }
      
      // Cliquer sur le bouton "Postuler"
      await applyButton.click();
      
      // Attendre le formulaire de candidature
      await page.waitForSelector('#ia-container', { timeout: 10000 })
        .catch(() => console.log('Formulaire de candidature Indeed non trouvé'));
      
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
        await page.waitForNavigation({ timeout: 10000 })
          .catch(() => console.log('Pas de navigation après soumission'));
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
    const browser = await puppeteer.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    try {
      await page.goto(job.listingUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Vérifier si le bouton "Postuler" existe
      const applyButton = await page.$('.apply-button');
      if (!applyButton) {
        await browser.close();
        return { success: false, message: "Bouton de candidature non trouvé" };
      }
      
      // Cliquer sur le bouton "Postuler"
      await applyButton.click();
      
      // Attendre le formulaire de candidature
      await page.waitForSelector('form.application-form', { timeout: 10000 })
        .catch(() => console.log('Formulaire de candidature HelloWork non trouvé'));
      
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
        await page.waitForNavigation({ timeout: 10000 })
          .catch(() => console.log('Pas de navigation après soumission'));
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

module.exports = new JobApplicator();
