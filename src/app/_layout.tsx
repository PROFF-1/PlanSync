import { Stack } from 'expo-router/stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreMountProvider } from '../utils/PreMountContext';

const Layout = () => {
  return (
    <SafeAreaProvider>
      <PreMountProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="activity-details" options={{ headerShown: false }} />
        </Stack>
      </PreMountProvider>
    </SafeAreaProvider>
  );
};

export default Layout;
