import { getApp, getApps, initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys = ["NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_APP_ID"] as const

const missingRequired = requiredKeys.filter((key) => !process.env[key])

if (missingRequired.length > 0) {
  console.warn(`[firebase] Missing required Firebase config values. Set: ${missingRequired.join(", ")}`)
}

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const firestore = getFirestore(firebaseApp)

export const initFirebaseAnalytics = async () => {
  if (typeof window === "undefined") return null
  const { isSupported, getAnalytics } = await import("firebase/analytics")
  return (await isSupported()) ? getAnalytics(firebaseApp) : null
}
