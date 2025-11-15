import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// SERVICE ACCOUNT JSON COMING FROM RENDER ENVIRONMENT VARIABLE
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fir-u-c-students-web-default-rtdb.firebaseio.com"
});
