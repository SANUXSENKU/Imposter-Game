import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export { onAuthStateChanged };

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or pending connection.');
    }
  }
}
testFirestoreConnection();

export interface UserCareerRecord {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  avatarId: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  imposterWins: number;
  civilianWins: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export async function loginWithGoogle(): Promise<UserCareerRecord | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return await syncUserProfile(user);
  } catch (err) {
    console.error('Google Sign-in failed', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function syncUserProfile(user: FirebaseUser, avatarId = 'avatar-1'): Promise<UserCareerRecord> {
  const userRef = doc(firestore, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserCareerRecord;
      return data;
    }

    const newProfile: UserCareerRecord = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Operative',
      photoURL: user.photoURL || '',
      avatarId: avatarId,
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      imposterWins: 0,
      civilianWins: 0,
      points: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    throw err;
  }
}

export async function recordMatchVictoryInFirestore(
  userId: string,
  stats: { won: boolean; isImposter: boolean; pointsDelta: number }
) {
  const userRef = doc(firestore, 'users', userId);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const current = snap.data() as UserCareerRecord;

    await updateDoc(userRef, {
      totalGames: current.totalGames + 1,
      totalWins: current.totalWins + (stats.won ? 1 : 0),
      totalLosses: current.totalLosses + (stats.won ? 0 : 1),
      imposterWins: current.imposterWins + (stats.won && stats.isImposter ? 1 : 0),
      civilianWins: current.civilianWins + (stats.won && !stats.isImposter ? 1 : 0),
      points: Math.max(0, current.points + stats.pointsDelta),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}
