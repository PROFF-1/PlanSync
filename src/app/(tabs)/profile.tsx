import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../utils/AuthContext';
import { useItinerary } from '../../utils/ItineraryContext';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { theme } from '../../utils/Theme';
import { updateUserProfile, getUserProfile } from '../../utils/firebaseAuth';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { savedItineraries } = useItinerary();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Calculate user stats
  const userStats = {
    totalTrips: savedItineraries.length,
    completedTrips: savedItineraries.filter(trip => trip.status === 'completed').length,
    totalDays: savedItineraries.reduce((sum, trip) => sum + trip.totalDays, 0),
    favoriteDestination: savedItineraries.length > 0 
      ? savedItineraries.reduce((acc, curr) => {
          acc[curr.destination] = (acc[curr.destination] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {},
  };

  const topDestination = Object.entries(userStats.favoriteDestination)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No trips yet';

  // Helper function to get user initials
  const getUserInitials = (name: string): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Handle profile image editing
  const handleEditProfileImage = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose from Gallery',
          onPress: () => Alert.alert('Feature Coming Soon', 'Image selection will be available in the next update!'),
        },
        {
          text: 'Take Photo',
          onPress: () => Alert.alert('Feature Coming Soon', 'Camera functionality will be available in the next update!'),
        },
      ]
    );
  };

  // Handle saving display name
  const handleSaveName = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: profileData.displayName,
      });

      // Update user profile in Firestore
      await updateUserProfile(user.uid, {
        displayName: profileData.displayName,
      });

      Alert.alert('Success', 'Name updated successfully!');
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Name update error:', error);
      Alert.alert('Error', error.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!user) return;

    if (profileData.newPassword !== profileData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (profileData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(user, profileData.newPassword);
      Alert.alert('Success', 'Password updated successfully!');
      setIsEditingPassword(false);
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      console.error('Password update error:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        setProfileData({
          displayName: user.displayName || '',
          email: user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    };

    loadProfileData();
  }, [user]);



  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Please sign in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80' }}
          style={styles.heroSection}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={styles.heroGradient}
          >
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Ionicons name="menu" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsButton}>
                <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeaderContent}>
              <View style={styles.profileImageContainer}>
                {user?.photoURL ? (
                  <Image
                    source={{ uri: user.photoURL }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageInitials}>
                      {getUserInitials(user?.displayName || user?.email || 'User')}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editImageButton}
                  onPress={handleEditProfileImage}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.userName}>{user?.displayName || 'Travel Explorer'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              {/* User Stats Cards */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.totalTrips}</Text>
                  <Text style={styles.statLabel}>Trips</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.totalDays}</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{userStats.completedTrips}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Quick Info Card */}
        <View style={styles.quickInfoCard}>
          <View style={styles.quickInfoItem}>
            <Ionicons name="location" size={20} color="#4ECDC4" />
            <View style={styles.quickInfoText}>
              <Text style={styles.quickInfoLabel}>Favorite Destination</Text>
              <Text style={styles.quickInfoValue}>{topDestination}</Text>
            </View>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Ionicons name="calendar" size={20} color="#4ECDC4" />
            <View style={styles.quickInfoText}>
              <Text style={styles.quickInfoLabel}>Member Since</Text>
              <Text style={styles.quickInfoValue}>
                {user?.metadata?.creationTime ? 
                  new Date(user.metadata.creationTime).getFullYear() : 
                  new Date().getFullYear()
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color="#667eea" />
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          {/* Name Field */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Full Name</Text>
              <TouchableOpacity
                onPress={() => setIsEditingName(!isEditingName)}
                style={[styles.actionButton, isEditingName && styles.actionButtonCancel]}
              >
                <Ionicons 
                  name={isEditingName ? "close" : "create-outline"} 
                  size={16} 
                  color={isEditingName ? "#ef4444" : "#4ECDC4"} 
                />
                <Text style={[styles.actionButtonText, isEditingName && styles.actionButtonCancelText]}>
                  {isEditingName ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            <InputField
              label=""
              value={profileData.displayName}
              onChangeText={(text) => setProfileData({ ...profileData, displayName: text })}
              editable={isEditingName}
              style={!isEditingName && styles.disabledInput}
            />
            {isEditingName && (
              <Button
                title="Save Changes"
                onPress={handleSaveName}
                loading={loading}
                style={styles.saveButton}
              />
            )}
          </View>

          {/* Email Field */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Email Address</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <InputField
              label=""
              value={profileData.email}
              editable={false}
              style={styles.disabledInput}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#667eea" />
            <Text style={styles.sectionTitle}>Security & Privacy</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Password</Text>
              <TouchableOpacity
                onPress={() => setIsEditingPassword(!isEditingPassword)}
                style={[styles.actionButton, isEditingPassword && styles.actionButtonCancel]}
              >
                <Ionicons 
                  name={isEditingPassword ? "close" : "create-outline"} 
                  size={16} 
                  color={isEditingPassword ? "#ef4444" : "#4ECDC4"} 
                />
                <Text style={[styles.actionButtonText, isEditingPassword && styles.actionButtonCancelText]}>
                  {isEditingPassword ? 'Cancel' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {!isEditingPassword ? (
              <View style={styles.passwordDisplay}>
                <Text style={styles.passwordPlaceholder}>••••••••••••</Text>
                <Text style={styles.passwordHint}>Last updated {new Date().toLocaleDateString()}</Text>
              </View>
            ) : (
              <View style={styles.passwordForm}>
                <InputField
                  label="New Password"
                  value={profileData.newPassword}
                  onChangeText={(text) => setProfileData({ ...profileData, newPassword: text })}
                  secureTextEntry
                  placeholder="Enter new password"
                />
                <InputField
                  label="Confirm New Password"
                  value={profileData.confirmPassword}
                  onChangeText={(text) => setProfileData({ ...profileData, confirmPassword: text })}
                  secureTextEntry
                  placeholder="Confirm new password"
                />
                <Button
                  title="Update Password"
                  onPress={handleChangePassword}
                  loading={loading}
                  style={styles.saveButton}
                />
              </View>
            )}
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color="#667eea" />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <Ionicons name="notifications-outline" size={20} color="#6b7280" />
                <Text style={styles.actionItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <Ionicons name="shield-outline" size={20} color="#6b7280" />
                <Text style={styles.actionItemText}>Privacy Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionItemLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
                <Text style={styles.actionItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.signOutAction]} onPress={handleSignOut}>
              <View style={styles.actionItemLeft}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={[styles.actionItemText, styles.signOutText]}>Sign Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Hero Section
  heroSection: {
    height: 320,
    marginBottom: -60,
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileImageInitials: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Quick Info Card
  quickInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickInfoText: {
    marginLeft: 15,
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickInfoDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  actionButtonCancel: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  actionButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  actionButtonCancelText: {
    color: '#ef4444',
  },
  
  // Verified Badge
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Form Elements
  disabledInput: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
  },
  saveButton: {
    marginTop: 15,
    backgroundColor: '#4ECDC4',
  },
  
  // Password Section
  passwordDisplay: {
    paddingVertical: 10,
  },
  passwordPlaceholder: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 5,
  },
  passwordHint: {
    fontSize: 12,
    color: '#9ca3af',
  },
  passwordForm: {
    marginTop: 10,
  },

  // Actions List
  actionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionItemText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 15,
    fontWeight: '500',
  },
  signOutAction: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ef4444',
  },
});

export default ProfileScreen;