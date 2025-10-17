import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { theme } from '../utils/Theme';
import { ItineraryActivity } from '../utils/ItineraryGenerator';

const ActivityDetailsScreen = () => {
  const params = useLocalSearchParams();
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // Parse the activity data from params
  const activity: ItineraryActivity = {
    id: params.id as string || 'unknown',
    name: params.name as string || 'Unknown Activity',
    description: params.description as string || 'No description available',
    type: (params.type as 'attraction' | 'restaurant' | 'hotel' | 'activity') || 'activity',
    rating: parseFloat(params.rating as string) || 0,
    duration: parseFloat(params.duration as string) || 0,
    timeSlot: params.timeSlot as string || 'Not specified',
    latitude: parseFloat(params.latitude as string) || 0,
    longitude: parseFloat(params.longitude as string) || 0,
    category: (() => {
      try {
        return params.category ? JSON.parse(params.category as string) : [];
      } catch (error) {
        console.warn('Failed to parse category:', params.category);
        return [];
      }
    })(),
  };

  // Mock photos for demo (in real app, these would come from API)
  const mockPhotos = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/400/300?random=4',
    'https://picsum.photos/400/300?random=5',
  ];

  // Mock weather data (in real app, this would come from weather API)
  const mockWeather = {
    temperature: '24°C',
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: '65%',
    windSpeed: '12 km/h',
  };

  const generateLocationMapHTML = (lat: number, lng: number, name: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .custom-marker {
            background: #007AFF;
            border: 3px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const map = L.map('map').setView([${lat}, ${lng}], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        const marker = L.marker([${lat}, ${lng}]).addTo(map);
        marker.bindPopup('<strong>${name}</strong><br/>Tap for directions').openPopup();
        
        // Add click handler for directions
        marker.on('click', function() {
            const url = 'https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}';
            // Note: In a real app, you'd handle this differently
            console.log('Open directions:', url);
        });
    </script>
</body>
</html>`;
  };

  const handleViewMap = () => {
    setShowMapModal(true);
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      attraction: '🏛️',
      restaurant: '🍽️',
      hotel: '🏨',
      activity: '🎯',
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.activityIcon}>{getActivityIcon(activity.type)}</Text>
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>⭐ {activity.rating}</Text>
                <Text style={styles.type}>{activity.type}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.timeSlot}>{activity.timeSlot}</Text>
          <Text style={styles.description}>{activity.description}</Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.duration}>Duration: {activity.duration}h</Text>
            <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
              <Text style={styles.mapButtonText}>🗺️ View on Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosContainer}>
            {mockPhotos.map((photo, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.photoContainer}
                onPress={() => handleImagePress(index)}
              >
                <Image source={{ uri: photo }} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Weather Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Weather</Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherIcon}>{mockWeather.icon}</Text>
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>{mockWeather.temperature}</Text>
                <Text style={styles.condition}>{mockWeather.condition}</Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherLabel}>Humidity</Text>
                <Text style={styles.weatherValue}>{mockWeather.humidity}</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={styles.weatherLabel}>Wind</Text>
                <Text style={styles.weatherValue}>{mockWeather.windSpeed}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {activity.category.map((cat, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{activity.name}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowMapModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ 
              html: generateLocationMapHTML(
                activity.latitude, 
                activity.longitude, 
                activity.name
              ) 
            }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </SafeAreaView>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalOverlay}
            onPress={() => setShowImageModal(false)}
          >
            <Image 
              source={{ uri: mockPhotos[selectedImageIndex] }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.imageCloseButton}
              onPress={() => setShowImageModal(false)}
            >
              <Text style={styles.imageCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ActivityDetailsScreen;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: theme.colors.background.secondary,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityIcon: {
    fontSize: 28,
  },
  titleContent: {
    flex: 1,
  },
  activityName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rating: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.semantic.warning[600],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  type: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  timeSlot: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as any,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    marginBottom: theme.spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  mapButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  mapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  photosContainer: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: theme.spacing.md,
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.md,
  },
  weatherCard: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  weatherIcon: {
    fontSize: 48,
    marginRight: theme.spacing.md,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
  },
  condition: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weatherDetail: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  weatherValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.text.primary,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryTag: {
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.tertiary,
  },
  webView: {
    flex: 1,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width * 0.9,
    height: height * 0.7,
  },
  imageCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCloseButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});