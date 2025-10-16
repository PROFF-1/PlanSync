import { Stack } from 'expo-router/stack';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PreMountProvider } from '../utils/PreMountContext';
import { AuthProvider } from '../utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/Theme';

const Layout = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PreMountProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
              screenOptions={{
                drawerStyle: {
                  backgroundColor: theme.colors.background.primary,
                  width: 280,
                },
                drawerActiveTintColor: theme.colors.primary[500],
                drawerInactiveTintColor: theme.colors.text.secondary,
                drawerLabelStyle: {
                  fontSize: 16,
                  fontWeight: '500',
                },
              }}
            >
              <Drawer.Screen 
                name="index" 
                options={{ 
                  headerShown: false,
                  drawerLabel: 'Login',
                  drawerIcon: ({ color, size }: { color: string; size: number }) => (
                    <Ionicons name="log-in-outline" size={size} color={color} />
                  ),
                }} 
              />
              <Drawer.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  drawerLabel: 'Home',
                  drawerIcon: ({ color, size }: { color: string; size: number }) => (
                    <Ionicons name="home-outline" size={size} color={color} />
                  ),
                }} 
              />
              <Drawer.Screen 
                name="activity-details" 
                options={{ 
                  headerShown: false,
                  drawerLabel: 'Activity Details',
                  drawerIcon: ({ color, size }: { color: string; size: number }) => (
                    <Ionicons name="information-circle-outline" size={size} color={color} />
                  ),
                }} 
              />
            </Drawer>
          </GestureHandlerRootView>
        </PreMountProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default Layout;
