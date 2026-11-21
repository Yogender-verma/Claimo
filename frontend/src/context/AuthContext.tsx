import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

export interface MinimalUser {
  email: string | null;
  emailVerified: boolean;
  uid: string;
}

interface AuthContextType {
  user: MinimalUser | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MinimalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (rawUser: User | null) => {
      if (rawUser && rawUser.email) {
        // Collect only the minimum required: email, verification status, and uid
        setUser({
          email: rawUser.email,
          emailVerified: rawUser.emailVerified,
          uid: rawUser.uid,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string): Promise<void> => {
    if (!auth || !isFirebaseConfigured) throw new Error('auth/unconfigured');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    if (!auth || !isFirebaseConfigured) throw new Error('auth/unconfigured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (): Promise<void> => {
    if (!auth || !googleProvider || !isFirebaseConfigured) throw new Error('auth/unconfigured');
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async (): Promise<void> => {
    if (!auth || !isFirebaseConfigured) return;
    await firebaseSignOut(auth);
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    if (!auth || !isFirebaseConfigured) throw new Error('auth/unconfigured');
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerification = async (): Promise<void> => {
    if (!auth || !auth.currentUser) throw new Error('auth/user-not-found');
    await sendEmailVerification(auth.currentUser);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth || !auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
      sendVerification,
      getIdToken,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
