import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserItineraries, ItineraryFirestore, deleteItinerary } from './firebaseFirestore';
import { useAuth } from './AuthContext';

export interface SavedItinerary {
  id: string;
  destination: string;
  duration: string;
  interests: string[];
  createdAt: Date;
  imageUrl: string;
  activities: number;
  status: 'completed' | 'cancelled';
  title: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

interface ItineraryContextType {
  savedItineraries: SavedItinerary[];
  loading: boolean;
  addItinerary: (itinerary: SavedItinerary) => void;
  refreshItineraries: () => Promise<void>;
  updateItineraryStatus: (id: string, status: 'completed' | 'cancelled') => void;
  clearAllItineraries: () => Promise<void>;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const useItinerary = () => {
  const context = useContext(ItineraryContext);
  if (context === undefined) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
};

// Helper function to convert Firebase itinerary to our format
const convertFirebaseItinerary = (fbItinerary: ItineraryFirestore): SavedItinerary => {
  try {
    // Generate a sample image based on destination
    const getDestinationImage = (destination: string): string => {
      const imageMap: { [key: string]: string } = {
        'paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500',
        'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500',
        'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500',
        'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500',
        'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500',
        'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=500',
      };
      
      const destinationLower = destination.toLowerCase();
      for (const key in imageMap) {
        if (destinationLower.includes(key)) {
          return imageMap[key];
        }
      }
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500'; // Default travel image
    };

    // Count total activities
    const totalActivities = fbItinerary.days?.reduce((total, day) => total + (day.activities?.length || 0), 0) || 0;

    // All saved itineraries default to completed status
    const status: 'completed' | 'cancelled' = 'completed';

    // Parse dates
    const startDate = fbItinerary.startDate instanceof Date ? fbItinerary.startDate : new Date(fbItinerary.startDate);
    const endDate = fbItinerary.endDate instanceof Date ? fbItinerary.endDate : new Date(fbItinerary.endDate);

    // Handle interests - could be string or array
    let interests: string[] = [];
    if (fbItinerary.preferences?.interests) {
      if (Array.isArray(fbItinerary.preferences.interests)) {
        interests = fbItinerary.preferences.interests;
      } else if (typeof fbItinerary.preferences.interests === 'string') {
        interests = fbItinerary.preferences.interests.split(',').map(s => s.trim());
      }
    }

    return {
      id: fbItinerary.id || '',
      destination: fbItinerary.destination || 'Unknown Destination',
      duration: `${fbItinerary.totalDays || 1} days`,
      interests,
      createdAt: fbItinerary.createdAt instanceof Date ? fbItinerary.createdAt : new Date(fbItinerary.createdAt),
      imageUrl: getDestinationImage(fbItinerary.destination || ''),
      activities: totalActivities,
      status,
      title: fbItinerary.title || `${fbItinerary.destination} Trip`,
      startDate,
      endDate,
      totalDays: fbItinerary.totalDays || 1,
    };
  } catch (error) {
    console.error('Error converting Firebase itinerary:', error, fbItinerary);
    // Return a default object to prevent crashes
    return {
      id: fbItinerary.id || 'error',
      destination: 'Error Loading',
      duration: '1 day',
      interests: [],
      createdAt: new Date(),
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      activities: 0,
      status: 'completed',
      title: 'Error Loading Itinerary',
      startDate: new Date(),
      endDate: new Date(),
      totalDays: 1,
    };
  }
};

export const ItineraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshItineraries = async () => {
    if (!user) {
      console.log('No user found, clearing itineraries');
      setSavedItineraries([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching itineraries for user:', user.uid);
      const firebaseItineraries = await getUserItineraries(user.uid);
      console.log('Firebase itineraries found:', firebaseItineraries.length);
      
      if (firebaseItineraries.length > 0) {
        console.log('First itinerary:', firebaseItineraries[0]);
      }
      
      const convertedItineraries = firebaseItineraries.map(convertFirebaseItinerary);
      
      // Sort by creation date (newest first)
      convertedItineraries.sort((a: SavedItinerary, b: SavedItinerary) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('Converted itineraries:', convertedItineraries.length);
      setSavedItineraries(convertedItineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItinerary = (itinerary: SavedItinerary) => {
    setSavedItineraries(prev => [itinerary, ...prev]);
  };

  const updateItineraryStatus = (id: string, status: 'completed' | 'cancelled') => {
    setSavedItineraries(prev => 
      prev.map(itinerary => 
        itinerary.id === id ? { ...itinerary, status } : itinerary
      )
    );
  };

  const clearAllItineraries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Delete all itineraries from Firebase
      const deletePromises = savedItineraries.map(itinerary => 
        deleteItinerary(itinerary.id)
      );
      
      await Promise.all(deletePromises);
      
      // Clear local state
      setSavedItineraries([]);
      
      console.log('All itineraries cleared successfully');
    } catch (error) {
      console.error('Error clearing itineraries:', error);
      throw new Error('Failed to clear itineraries');
    } finally {
      setLoading(false);
    }
  };

  // Load itineraries when user changes
  useEffect(() => {
    refreshItineraries();
  }, [user]);

  const value: ItineraryContextType = {
    savedItineraries,
    loading,
    addItinerary,
    refreshItineraries,
    updateItineraryStatus,
    clearAllItineraries,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
};