import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ⚠️ REMPLACE CECI PAR TES PROPRES CLÉS COPIÉES DEPUIS FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBSBL4sltzn_OGlp6J3xQqdXUBoznfVOG0",
  authDomain: "delices-afrique-prod.firebaseapp.com",
  projectId: "delices-afrique-prod",
  storageBucket: "delices-afrique-prod.firebasestorage.app",
  messagingSenderId: "407817669888",
  appId: "1:407817669888:web:971e432028fc1d2234f7e5"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// On exporte les outils dont on aura besoin
export const db = getFirestore(app); // La base de données (Produits, Commandes)
export const auth = getAuth(app);    // L'authentification (Login Admin)
export const storage = getStorage(app); // Pour stocker les photos des gâteaux (plus tard)

export default app;