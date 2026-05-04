import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import * as firebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDgpOAd5RgbwVDP0Es3Y2b8E6SXslk9-i4",
  authDomain: "pharmago-8e1fc.firebaseapp.com",
  projectId: "pharmago-8e1fc",
  storageBucket: "pharmago-8e1fc.firebasestorage.app",
  messagingSenderId: "630329545936",
  appId: "1:630329545936:web:287a687d655fada051bad5",
};

const app = initializeApp(firebaseConfig);

const getReactNativePersistence = (firebaseAuth as any)
  .getReactNativePersistence;

export const auth =
  Platform.OS === "web"
    ? (firebaseAuth as any).getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "europe-west1");