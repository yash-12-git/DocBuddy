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
import { getClientAuth } from '@/lib/firebase/client';
import { UserRole, UserProfile } from '@/types';

interface AuthState {
  user: FirebaseUser | null;
  role: UserRole;
  profile: Partial<UserProfile> | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Demo mode: when Firebase isn't configured ──────────────────────
const isDemoMode = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: 'guest',
    profile: null,
    loading: true,
    error: null,
  });

  // Demo user storage
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      // Check localStorage for demo session
      const stored = typeof window !== 'undefined' ? localStorage.getItem('dh_demo_user') : null;
      if (stored) {
        const user = JSON.parse(stored);
        setDemoUser(user);
        setState({
          user: user as any,
          role: 'user',
          profile: { uid: user.uid, email: user.email, displayName: user.displayName, role: 'user' } as any,
          loading: false,
          error: null,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
      return;
    }

    // Real Firebase auth listener
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get custom claims for role
        const tokenResult = await firebaseUser.getIdTokenResult();
        const role = (tokenResult.claims.role as UserRole) || 'user';

        setState({
          user: firebaseUser,
          role,
          profile: {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL,
            role,
          } as Partial<UserProfile>,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          role: 'guest',
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (isDemoMode) {
        // Demo login
        const user: DemoUser = {
          uid: `demo_${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          photoURL: null,
        };
        localStorage.setItem('dh_demo_user', JSON.stringify(user));
        setDemoUser(user);
        setState({
          user: user as any,
          role: 'user',
          profile: { uid: user.uid, email, displayName: user.displayName, role: 'user' } as any,
          loading: false,
          error: null,
        });
        return;
      }

      const auth = getClientAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err.message || 'Sign in failed',
      }));
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (isDemoMode) {
        const user: DemoUser = {
          uid: `demo_${Date.now()}`,
          email,
          displayName: name,
          photoURL: null,
        };
        localStorage.setItem('dh_demo_user', JSON.stringify(user));
        setDemoUser(user);
        setState({
          user: user as any,
          role: 'user',
          profile: { uid: user.uid, email, displayName: name, role: 'user' } as any,
          loading: false,
          error: null,
        });
        return;
      }

      const auth = getClientAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists'
          : err.message || 'Sign up failed',
      }));
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      if (isDemoMode) {
        const user: DemoUser = {
          uid: `demo_google_${Date.now()}`,
          email: 'demo@gmail.com',
          displayName: 'Demo User',
          photoURL: null,
        };
        localStorage.setItem('dh_demo_user', JSON.stringify(user));
        setDemoUser(user);
        setState({
          user: user as any,
          role: 'user',
          profile: { uid: user.uid, email: user.email, displayName: 'Demo User', role: 'user' } as any,
          loading: false,
          error: null,
        });
        return;
      }

      const auth = getClientAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err.message || 'Google sign in failed',
      }));
      throw err;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem('dh_demo_user');
      setDemoUser(null);
      setState({
        user: null,
        role: 'guest',
        profile: null,
        loading: false,
        error: null,
      });
      return;
    }

    const auth = getClientAuth();
    await firebaseSignOut(auth);
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signInWithGoogle, signOut: signOutUser, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
