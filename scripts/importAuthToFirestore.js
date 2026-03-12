/*
  Run this script locally to copy all Firebase Authentication users
  into the Firestore `users` collection.

  Usage:
    1. Download a Firebase Service Account JSON from Firebase Console
       (Project Settings -> Service accounts -> Generate new private key)
    2. Place the JSON file in the project root as `serviceAccountKey.json`
       OR set env var `GOOGLE_APPLICATION_CREDENTIALS` to its path.
    3. From project root run:
       npm install firebase-admin
       node scripts/importAuthToFirestore.js
*/

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error('Service account key not found at', keyPath);
  console.error('Please download the service account JSON from Firebase Console and put it at project root as serviceAccountKey.json, or set GOOGLE_APPLICATION_CREDENTIALS env var');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(keyPath)
});

const firestore = admin.firestore();
const auth = admin.auth();

async function importAllUsers() {
  console.log('Starting import of auth users to Firestore...');
  try {
    let nextPageToken;
    let total = 0;
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      const users = listUsersResult.users;
      for (const u of users) {
        const uid = u.uid;
        const docRef = firestore.doc(`users/${uid}`);
        const data = {
          displayName: u.displayName || null,
          email: u.email || null,
          photoURL: u.photoURL || null,
          provider: (u.providerData && u.providerData[0] && u.providerData[0].providerId) || null,
          // add a syncedAt field so we know this came from admin import
          syncedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await docRef.set(data, { merge: true });
        console.log('Imported user', u.email || uid);
        total++;
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    console.log(`Imported ${total} users into Firestore 'users' collection.`);
    process.exit(0);
  } catch (err) {
    console.error('Error importing users:', err);
    process.exit(2);
  }
}

importAllUsers();
