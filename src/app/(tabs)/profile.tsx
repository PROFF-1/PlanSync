import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../utils/AuthContext';
import { InputField } from '../../components/InputField';
import { MultiInputField } from '../../components/MultiInputField';
import { Button } from '../../components/Button';
import { theme } from '../../utils/Theme';
import { updateUserProfile, getUserProfile } from '../../utils/firebaseAuth';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../../utils/firebaseConfig';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

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

  // Handle saving interests
  const handleSaveInterests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user profile in Firestore
      await updateUserProfile(user.uid, {
        preferences: {
          interests: interests,
          preferredDestinations: [],
          budgetRange: 'medium',
        },
      });

      Alert.alert('Success', 'Interests updated successfully!');
      setIsEditingInterests(false);
    } catch (error: any) {
      console.error('Interests update error:', error);
      Alert.alert('Error', error.message || 'Failed to update interests');
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

        // Load additional profile data from Firestore
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.preferences?.interests) {
          setInterests(userProfile.preferences.interests);
        }
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
      <StatusBar style="dark" backgroundColor={theme.colors.background.primary} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Ionicons name="menu" size={28} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileImageContainer}>
            {user.photoURL ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageInitials}>
                  {getUserInitials(user.displayName || user.email || 'User')}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={handleEditProfileImage}
            >
              <Text style={styles.editImageButtonText}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.displayName || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        {/* Profile Information Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
          </View>

          {/* Name Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TouchableOpacity
                onPress={() => setIsEditingName(!isEditingName)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {isEditingName ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            <InputField
              label=""
              value={profileData.displayName}
              onChangeText={(text) => setProfileData({ ...profileData, displayName: text })}
              editable={isEditingName}
            />
            {isEditingName && (
              <Button
                title="Save Name"
                onPress={handleSaveName}
                loading={loading}
                style={styles.saveButton}
              />
            )}
          </View>

          {/* Email Field (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <InputField
              label=""
              value={profileData.email}
              editable={false}
              style={styles.disabledInput}
            />
          </View>

          {/* Interests Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>Travel Interests</Text>
              <TouchableOpacity
                onPress={() => setIsEditingInterests(!isEditingInterests)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {isEditingInterests ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
            <MultiInputField
              label=""
              values={interests}
              onValuesChange={setInterests}
              placeholder={isEditingInterests ? "Add your travel interests..." : "No interests added yet"}
              maxItems={10}
              editable={isEditingInterests}
            />
            {isEditingInterests && (
              <Button
                title="Save Interests"
                onPress={handleSaveInterests}
                loading={loading}
                style={styles.saveButton}
              />
            )}
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security</Text>
          </View>

          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity
                onPress={() => setIsEditingPassword(!isEditingPassword)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {isEditingPassword ? 'Cancel' : 'Change'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {!isEditingPassword ? (
              <Text style={styles.passwordPlaceholder}>••••••••</Text>
            ) : (
              <>
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
                  title="Change Password"
                  onPress={handleChangePassword}
                  loading={loading}
                  style={styles.saveButton}
                />
              </>
            )}
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background.secondary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.neutral[200],
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitials: {
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.inverse,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButtonText: {
    fontSize: 16,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  editButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  editButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  disabledInput: {
    opacity: 0.6,
  },
  passwordSectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginTop: 20,
    marginBottom: 15,
  },
  passwordPlaceholder: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: 10,
  },
  saveButton: {
    marginTop: 20,
  },
  signOutSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  signOutButton: {
    backgroundColor: theme.colors.semantic.error[500],
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
});

export default ProfileScreen;