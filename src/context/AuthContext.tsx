import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  FirebaseUser
} from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { syncUserProfile } from '../services/firestoreService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setFirebaseUser(currentUser);
          const userDocRef = doc(db, 'users', currentUser.uid);
          let userProfile: UserProfile;

          try {
            const userSnapshot = await getDoc(userDocRef);
            const now = new Date().toISOString();
            if (userSnapshot.exists()) {
              const data = userSnapshot.data();
              userProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || data.name || 'User',
                email: currentUser.email || data.email || '',
                photoURL: currentUser.photoURL || data.photoURL || null,
                role: data.role || 'customer',
                createdAt: data.createdAt || now.split('T')[0],
                lastLogin: now,
              };
              await updateDoc(userDocRef, {
                lastLogin: now,
                name: userProfile.name,
                email: userProfile.email,
                photoURL: userProfile.photoURL,
              });
            } else {
              userProfile = {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Authenticated User',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || null,
                role: 'customer',
                createdAt: now.split('T')[0],
                lastLogin: now,
              };
              await setDoc(userDocRef, userProfile);
            }
          } catch (dbErr) {
            console.warn('Could not read user profile from Firestore, using auth fallback:', dbErr);
            userProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Authenticated User',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || null,
              role: 'customer',
              createdAt: new Date().toISOString().split('T')[0],
              lastLogin: new Date().toISOString(),
            };
          }

          setUser(userProfile);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err: any) {
        console.error('Error handling auth state change:', err);
        setError(err.message || 'Authentication error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      setFirebaseUser(currentUser);

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      const now = new Date().toISOString();

      let userProfile: UserProfile;
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        userProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || data.name || 'User',
          email: currentUser.email || data.email || '',
          photoURL: currentUser.photoURL || data.photoURL || null,
          role: data.role || 'customer',
          createdAt: data.createdAt || now.split('T')[0],
          lastLogin: now,
        };
        await updateDoc(userDocRef, {
          lastLogin: now,
          name: userProfile.name,
          email: userProfile.email,
          photoURL: userProfile.photoURL,
        });
      } else {
        userProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Authenticated User',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || null,
          role: 'customer',
          createdAt: now.split('T')[0],
          lastLogin: now,
        };
        await setDoc(userDocRef, userProfile);
      }
      setUser(userProfile);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled by user. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Unauthorized domain. Please add this domain to Authorized Domains in Firebase Console.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in provider is not enabled in Firebase Console. Please enable Google in Firebase Authentication > Sign-in method.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Check Firebase Console configuration.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      const updated = { ...user, role: newRole };
      setUser(updated);
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { role: newRole });
    } catch (err) {
      console.warn('Could not persist role update to Firestore:', err);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signInWithGoogle,
        logout,
        setUserRole,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
