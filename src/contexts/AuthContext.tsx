'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, Timestamp,
} from 'firebase/firestore';
import { getClientAuth, getClientDb } from '@/lib/firebase/client';
import { UserRole, UserProfile } from '@/types';

interface AuthState {
  user: FirebaseUser | null;
  role: UserRole;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  isAdmin: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Firestore user profile helpers ─────────────────────────────────
async function fetchOrCreateUserProfile(
  firebaseUser: FirebaseUser,
  extraData?: Partial<UserProfile>
): Promise<UserProfile> {
  const db = getClientDb();
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Existing user — update lastLogin
    const existing = userSnap.data() as UserProfile;
    await updateDoc(userRef, { updatedAt: Timestamp.now() });
    return existing;
  }

  // New user — create Firestore profile
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || extraData?.displayName || '',
    photoURL: firebaseUser.photoURL,
    role: 'user',
    phone: null,
    dateOfBirth: null,
    gender: null,
    addresses: [],
    preferences: {
      language: 'en',
      notifications: { email: true, sms: false, push: true },
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isActive: true,
    ...extraData,
  };

  await setDoc(userRef, newProfile);
  return newProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: 'guest',
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await fetchOrCreateUserProfile(firebaseUser);
          setState({
            user: firebaseUser,
            role: profile.role,
            profile,
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setState({
            user: firebaseUser,
            role: 'user',
            profile: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL,
              role: 'user',
            } as UserProfile,
            loading: false,
            error: null,
          });
        }
      } else {
        setState({ user: null, role: 'guest', profile: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles the rest
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later'
        : err.message || 'Sign in failed';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const auth = getClientAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      // Profile will be created in onAuthStateChanged via fetchOrCreateUserProfile
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : err.code === 'auth/weak-password'
        ? 'Password must be at least 6 characters'
        : err.message || 'Sign up failed';
      setState((s) => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message || 'Google sign in failed' }));
      throw err;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    const auth = getClientAuth();
    await firebaseSignOut(auth);
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user) return;
    const db = getClientDb();
    const userRef = doc(db, 'users', state.user.uid);
    await updateDoc(userRef, { ...updates, updatedAt: Timestamp.now() });
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, ...updates } : null,
      role: updates.role || s.role,
    }));
  }, [state.user]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInWithGoogle,
        signOut: signOutUser,
        updateUserProfile,
        clearError,
        isAdmin: state.role === 'admin',
        isDoctor: state.role === 'doctor',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
