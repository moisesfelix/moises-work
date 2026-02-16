import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://moises-work-app.firebaseio.com" 
        });
    } catch (e) {
        console.warn("Service account key not found, using default credentials");
        admin.initializeApp();
    }
}

export const db = admin.database();
export const auth = admin.auth();
