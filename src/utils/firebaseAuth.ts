import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  preferences?: {
    interests: string[];
    preferredDestinations: string[];
    budgetRange: string;
  };
}

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's profile
    await updateProfile(user, {
      displayName: displayName,
    });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName,
      createdAt: new Date(),
      preferences: {
        interests: [],
        preferredDestinations: [],
        budgetRange: 'medium',
      },
    };

    // Only add photoURL if it exists
    if (user.photoURL) {
      userProfile.photoURL = user.photoURL;
    }

    await setDoc(doc(firestore, 'users', user.uid), userProfile);

    return user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return null;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    await setDoc(doc(firestore, 'users', uid), updates, { merge: true });
  } catch (error: any) {
    console.error('Update user profile error:', error);
    throw new Error('Failed to update profile');
  }
};

// Get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};
