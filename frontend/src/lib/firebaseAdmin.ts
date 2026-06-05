import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

type ServiceAccount = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function getServiceAccountJson(): Record<string, unknown> {
  const b64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_B64;
  if (!b64) {
    throw new Error("Missing FIREBASE_ADMIN_SERVICE_ACCOUNT_B64");
  }

  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}

function toServiceAccount(raw: Record<string, unknown>): ServiceAccount {
  const projectId = raw["project_id"];
  const clientEmail = raw["client_email"];
  const privateKey = raw["private_key"];

  if (typeof projectId !== "string") throw new Error("Invalid service account: project_id");
  if (typeof clientEmail !== "string") throw new Error("Invalid service account: client_email");
  if (typeof privateKey !== "string") throw new Error("Invalid service account: private_key");

  return { projectId, clientEmail, privateKey };
}

let cachedApp: App | null = null;
let cachedFirestore: Firestore | null = null;
let cachedAuth: Auth | null = null;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  cachedApp =
    getApps().length > 0
      ? getApps()[0]!
      : initializeApp({
          credential: cert(toServiceAccount(getServiceAccountJson())),
        });
  return cachedApp;
}

export function getAdminFirestore(): Firestore {
  if (cachedFirestore) return cachedFirestore;
  cachedFirestore = getFirestore(getAdminApp());
  return cachedFirestore;
}

export function getAdminAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getAdminApp());
  return cachedAuth;
}
