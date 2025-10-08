import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ItineraryActivity, GeneratedItinerary } from './ItineraryGenerator';

interface PreMountContextType {
  preMountedActivities: Set<string>;
  preMountActivity: (activity: ItineraryActivity) => void;
  preMountAllActivities: (itinerary: GeneratedItinerary) => void;
  isActivityPreMounted: (activityId: string) => boolean;
  clearPreMountedActivities: () => void;
}

const PreMountContext = createContext<PreMountContextType | undefined>(undefined);

export const usePreMount = () => {
  const context = useContext(PreMountContext);
  if (!context) {
    throw new Error('usePreMount must be used within a PreMountProvider');
  }
  return context;
};

interface PreMountProviderProps {
  children: ReactNode;
}

export const PreMountProvider: React.FC<PreMountProviderProps> = ({ children }) => {
  const [preMountedActivities, setPreMountedActivities] = useState<Set<string>>(new Set());

  const preMountActivity = (activity: ItineraryActivity) => {
    setPreMountedActivities(prev => new Set(prev).add(activity.id));
  };

  const preMountAllActivities = (itinerary: GeneratedItinerary) => {
    const allActivityIds = itinerary.days.flatMap(day => 
      day.activities.map(activity => activity.id)
    );
    setPreMountedActivities(new Set(allActivityIds));
  };

  const isActivityPreMounted = (activityId: string) => {
    return preMountedActivities.has(activityId);
  };

  const clearPreMountedActivities = () => {
    setPreMountedActivities(new Set());
  };

  return (
    <PreMountContext.Provider
      value={{
        preMountedActivities,
        preMountActivity,
        preMountAllActivities,
        isActivityPreMounted,
        clearPreMountedActivities,
      }}
    >
      {children}
    </PreMountContext.Provider>
  );
};