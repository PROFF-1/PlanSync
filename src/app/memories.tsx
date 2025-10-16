import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface Memory {
  id: string;
  imageUri: string;
  location: string;
  timestamp: Date;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const MemoriesScreen = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('');

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      setPermissionStatus('Camera and media library permissions are required');
    } else if (locationStatus !== 'granted') {
      setPermissionStatus('Location permission is required for better memories');
    } else {
      setPermissionStatus('granted');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return {
          locationName: `${address.city || address.subregion || 'Unknown'}, ${address.country || ''}`,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        };
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
    return { locationName: 'Unknown Location', coordinates: undefined };
  };

  const captureMemory = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const { locationName, coordinates } = await getCurrentLocation();
      
      const newMemory: Memory = {
        id: Date.now().toString(),
        imageUri: result.assets[0].uri,
        location: locationName,
        timestamp: new Date(),
        coordinates,
      };

      setMemories(prev => [newMemory, ...prev]);
    }
  };

  const selectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const { locationName, coordinates } = await getCurrentLocation();
      
      const newMemory: Memory = {
        id: Date.now().toString(),
        imageUri: result.assets[0].uri,
        location: locationName,
        timestamp: new Date(),
        coordinates,
      };

      setMemories(prev => [newMemory, ...prev]);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Memory',
      'Choose how to add your travel memory',
      [
        { text: 'Take Photo', onPress: captureMemory },
        { text: 'Choose from Gallery', onPress: selectFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMemory = ({ item }: { item: Memory }) => (
    <TouchableOpacity style={styles.memoryCard}>
      <Image source={{ uri: item.imageUri }} style={styles.memoryImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.memoryOverlay}
      >
        <View style={styles.memoryInfo}>
          <Text style={styles.memoryLocation}>{item.location}</Text>
          <Text style={styles.memoryDate}>
            {item.timestamp.toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Travel Memories</Text>
        <Text style={styles.headerSubtitle}>Capture your journey moments</Text>
      </LinearGradient>

      {memories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptySubtitle}>
            Start capturing your travel moments
          </Text>
        </View>
      ) : (
        <FlatList
          data={memories}
          renderItem={renderMemory}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.memoriesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={showImageOptions}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
  memoriesList: {
    padding: 15,
  },
  memoryCard: {
    width: (screenWidth - 45) / 2,
    height: 200,
    margin: 7.5,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
  },
  memoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
  },
  memoryInfo: {
    padding: 12,
  },
  memoryLocation: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  memoryDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MemoriesScreen;