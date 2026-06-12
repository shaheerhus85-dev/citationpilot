import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Simple check to ensure we have a valid configuration loaded
const hasConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

export const app = hasConfig ? initializeApp(firebaseConfig) : null;
export const db = hasConfig && app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;
export const auth = hasConfig ? getAuth(app) : null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUserId = auth?.currentUser?.uid || null;
  const currentUserEmail = auth?.currentUser?.email || null;
  const currentEmailVerified = auth?.currentUser?.emailVerified || null;
  const currentIsAnonymous = auth?.currentUser?.isAnonymous || null;
  const currentTenantId = auth?.currentUser?.tenantId || null;
  const currentProviderInfo = auth?.currentUser?.providerData?.map(provider => ({
    providerId: provider.providerId,
    email: provider.email,
  })) || [];

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUserId,
      email: currentUserEmail,
      emailVerified: currentEmailVerified,
      isAnonymous: currentIsAnonymous,
      tenantId: currentTenantId,
      providerInfo: currentProviderInfo
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
