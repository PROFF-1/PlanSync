import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from './firebaseConfig';

export interface ItineraryFirestore {
  id?: string;
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  preferences: {
    interests: string;
    duration: string;
    budget?: string;
  };
  days: ItineraryDayFirestore[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  likes: number;
  tags: string[];
}

export interface ItineraryDayFirestore {
  day: number;
  date: string;
  activities: ItineraryActivityFirestore[];
  totalDuration: number;
  estimatedCost?: number;
}

export interface ItineraryActivityFirestore {
  id: string;
  name: string;
  type: 'activity' | 'attraction' | 'restaurant' | 'hotel';
  category: string[];
  description: string;
  latitude: number;
  longitude: number;
  duration: number;
  rating: number;
  timeSlot: string;
  estimatedCost?: number;
  bookingRequired?: boolean;
  website?: string;
  phoneNumber?: string;
  address?: string;
}

// Save a new itinerary
export const saveItinerary = async (itinerary: Omit<ItineraryFirestore, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const itineraryData = {
      ...itinerary,
      startDate: Timestamp.fromDate(itinerary.startDate),
      endDate: Timestamp.fromDate(itinerary.endDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(firestore, 'itineraries'), itineraryData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving itinerary:', error);
    throw new Error('Failed to save itinerary');
  }
};

// Get user's itineraries
export const getUserItineraries = async (userId: string): Promise<ItineraryFirestore[]> => {
  try {
    const q = query(
      collection(firestore, 'itineraries'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const itineraries: ItineraryFirestore[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      itineraries.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as ItineraryFirestore);
    });
    
    return itineraries;
  } catch (error: any) {
    console.error('Error getting user itineraries:', error);
    throw new Error('Failed to load itineraries');
  }
};

// Get a specific itinerary
export const getItinerary = async (itineraryId: string): Promise<ItineraryFirestore | null> => {
  try {
    const docRef = doc(firestore, 'itineraries', itineraryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as ItineraryFirestore;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting itinerary:', error);
    throw new Error('Failed to load itinerary');
  }
};

// Update an itinerary
export const updateItinerary = async (itineraryId: string, updates: Partial<ItineraryFirestore>): Promise<void> => {
  try {
    const docRef = doc(firestore, 'itineraries', itineraryId);
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    // Convert Date objects to Timestamps if they exist in updates
    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate);
    }
    
    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error('Error updating itinerary:', error);
    throw new Error('Failed to update itinerary');
  }
};

// Delete an itinerary
export const deleteItinerary = async (itineraryId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, 'itineraries', itineraryId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error deleting itinerary:', error);
    throw new Error('Failed to delete itinerary');
  }
};

// Get public itineraries (for browsing/inspiration)
export const getPublicItineraries = async (limitCount: number = 10): Promise<ItineraryFirestore[]> => {
  try {
    const q = query(
      collection(firestore, 'itineraries'),
      where('isPublic', '==', true),
      orderBy('likes', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const itineraries: ItineraryFirestore[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      itineraries.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as ItineraryFirestore);
    });
    
    return itineraries;
  } catch (error: any) {
    console.error('Error getting public itineraries:', error);
    throw new Error('Failed to load public itineraries');
  }
};

// Like/Unlike an itinerary
export const toggleItineraryLike = async (itineraryId: string, increment: boolean): Promise<void> => {
  try {
    const docRef = doc(firestore, 'itineraries', itineraryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0;
      const newLikes = increment ? currentLikes + 1 : Math.max(0, currentLikes - 1);
      
      await updateDoc(docRef, {
        likes: newLikes,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error('Error toggling itinerary like:', error);
    throw new Error('Failed to update like status');
  }
};
