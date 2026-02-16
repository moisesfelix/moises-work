import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import appApi from './api/app';
import appLink from './link/app';

// Mock service account loading or use Application Default Credentials if file missing
let serviceAccount: any = {};
try {
  serviceAccount = require("./configs/serviceAccountKey.json");
} catch (e) {
  console.warn("Service account key not found, using default credentials");
}

if (!admin.apps.length) {
    if (serviceAccount && Object.keys(serviceAccount).length > 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // databaseURL: "" // Add if needed
      });
    } else {
      admin.initializeApp();
    }
}

export const api = functions.https.onRequest(appApi);
export const link = functions.https.onRequest(appLink);

