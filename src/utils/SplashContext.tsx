import React, { createContext, useContext, useState, useEffect } from 'react';

interface SplashContextType {
  isLoading: boolean;
  hideSplash: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export const useSplash = () => {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
};

interface SplashProviderProps {
  children: React.ReactNode;
}

export const SplashProvider: React.FC<SplashProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const hideSplash = () => {
    setIsLoading(false);
  };

  // Auto-hide after 5 seconds as backup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SplashContext.Provider value={{ isLoading, hideSplash }}>
      {children}
    </SplashContext.Provider>
  );
};