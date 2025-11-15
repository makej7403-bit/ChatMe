// server/firebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";

function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  // Prefer a SERVICE_ACCOUNT_JSON environment variable (safe for Render)
  const saJson = process.env.SERVICE_ACCOUNT_JSON;

  if (!saJson) {
    // fallback to reading local file if present (for local dev)
    const localPath = "./serviceAccountKey.json";
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, "utf8");
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(content)),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      return admin;
    }
    throw new Error("No Firebase service account configured. Set SERVICE_ACCOUNT_JSON.");
  }

  let serviceAccount;
  try {
    serviceAccount = typeof saJson === "string" ? JSON.parse(saJson) : saJson;
  } catch (e) {
    // maybe saJson contains escaped newlines - fix them
    const fixed = saJson.replace(/\\n/g, "\n");
    serviceAccount = JSON.parse(fixed);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  return admin;
}

export default initFirebaseAdmin;
