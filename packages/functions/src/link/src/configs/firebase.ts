import * as admin from 'firebase-admin';

// Reusing the global admin instance or initializing if not present?
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.database();
