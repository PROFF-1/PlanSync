import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { theme } from '../../utils/Theme';
import { itineraryGenerator, GeneratedItinerary, ItineraryActivity } from '../../utils/ItineraryGenerator';

const MapTab = () => {
  const params = useLocalSearchParams();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ItineraryActivity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lastParams, setLastParams] = useState<string>('');

  useEffect(() => {
    // Create a stable key from params to avoid unnecessary regenerations
    const currentParamsKey = `${params.destination}-${params.interests}-${params.duration}`;
    
    // Only regenerate if the actual values have changed, not just the object reference
    if (currentParamsKey !== lastParams && params.destination && params.duration) {
      setLastParams(currentParamsKey);
      loadItinerary();
    } else if (!params.destination || !params.duration) {
      // Handle case where no valid params are provided
      setLoading(false);
      setItinerary(null);
    }
  }, [params.destination, params.interests, params.duration, lastParams]);

  const loadItinerary = async () => {
    try {
      setLoading(true);

      // Check if required parameters exist
      if (!params?.destination || !params?.duration) {
        setLoading(false);
        setItinerary(null);
        return;
      }
      
      const generated = itineraryGenerator.generateItinerary(
        params.destination as string,
        params.interests as string,
        params.duration as string
      );
      
      if (generated) {
        setItinerary(generated);
      } else {
        Alert.alert(
          'Error',
          'Failed to generate itinerary data.',
          [
            { text: 'Go to Home', onPress: () => router.push('/(tabs)/') },
            { text: 'Try Again', onPress: loadItinerary }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPress = (activity: ItineraryActivity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedActivity(null);
  };

  const openInMaps = (activity: ItineraryActivity) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  };

  const getLocationIcon = (type: string) => {
    const icons = {
      attraction: '🏛️',
      restaurant: '🍽️',
      hotel: '🏨',
      activity: '🎯',
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  const LocationCard = ({ 
    activity, 
    onPress, 
    onOpenMaps 
  }: { 
    activity: ItineraryActivity & { day: number }; 
    onPress: () => void; 
    onOpenMaps: () => void; 
  }) => (
    <TouchableOpacity style={styles.locationCard} onPress={onPress}>
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <View style={styles.locationTitleRow}>
            <Text style={styles.locationIcon}>
              {getLocationIcon(activity.type)}
            </Text>
            <Text style={styles.locationName}>{activity.name}</Text>
          </View>
          <Text style={styles.locationDetails}>
            Day {activity.day} • {activity.timeSlot}
          </Text>
          <Text style={styles.locationType}>{activity.type}</Text>
        </View>
        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={(e) => {
            e.stopPropagation();
            onOpenMaps();
          }}
        >
          <Text style={styles.mapButtonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
      {activity.description && (
        <Text style={styles.locationDescription} numberOfLines={2}>
          {activity.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {!params.destination || !params.duration 
              ? 'No locations found' 
              : 'Failed to load location data'
            }
          </Text>
          <Text style={styles.errorSubtext}>
            {!params.destination || !params.duration
              ? 'Please create an itinerary from the Home tab first.'
              : 'Something went wrong while loading your locations.'
            }
          </Text>
          <View style={styles.errorButtons}>
            {!params.destination || !params.duration ? (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => router.push('/(tabs)/')}
              >
                <Text style={styles.retryButtonText}>Go to Home</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.retryButton} onPress={loadItinerary}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const allActivities = itinerary.days.flatMap(day => 
    day.activities.map(activity => ({ ...activity, day: day.day }))
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Locations</Text>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowMap(!showMap)}
        >
          <Text style={styles.toggleButtonText}>
            {showMap ? 'List' : 'Map'}
          </Text>
        </TouchableOpacity>
      </View>

      {showMap ? (
        /* Map View */
        <View style={styles.mapContainer}>
          <ScrollView style={styles.mapScrollView} contentContainerStyle={styles.mapContent}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
              <Text style={styles.mapPlaceholderSubtitle}>
                {allActivities.length} locations in {itinerary.destination.name}
              </Text>
              
              {/* Location pins in a grid layout */}
              <View style={styles.locationGrid}>
                {allActivities.map((activity, index) => (
                  <TouchableOpacity
                    key={`${activity.id}-${activity.day}-${index}`}
                    style={styles.locationPin}
                    onPress={() => handleLocationPress(activity)}
                  >
                    <View style={styles.pinIcon}>
                      <Text style={styles.pinEmoji}>
                        {getLocationIcon(activity.type)}
                      </Text>
                    </View>
                    <Text style={styles.pinName} numberOfLines={2}>
                      {activity.name}
                    </Text>
                    <Text style={styles.pinDetails}>
                      Day {activity.day}
                    </Text>
                    <TouchableOpacity 
                      style={styles.pinMapButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        openInMaps(activity);
                      }}
                    >
                      <Text style={styles.pinMapButtonText}>📍 Open</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.openAllMapsButton}
                onPress={() => {
                  const query = allActivities.map(a => `${a.name}, ${itinerary.destination.name}`).join(' | ');
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                  Linking.openURL(url);
                }}
              >
                <Text style={styles.openAllMapsButtonText}>🗺️ View All on Google Maps</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      ) : (
        /* Location List */
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationTitle}>{itinerary.destination.name}</Text>
            <Text style={styles.destinationSubtitle}>
              {allActivities.length} locations • {itinerary.totalDays} days
            </Text>
          </View>

          <View style={styles.locationsContainer}>
            {allActivities.map((activity, index) => (
              <LocationCard
                key={`${activity.id}-${activity.day}-${index}`}
                activity={activity}
                onPress={() => handleLocationPress(activity)}
                onOpenMaps={() => openInMaps(activity)}
              />
            ))}
          </View>
        </ScrollView>
      )}

      {/* Activity Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedActivity && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedActivity.name}</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalBody}>
                  <Text style={styles.modalDay}>Day {(selectedActivity as any).day}</Text>
                  <Text style={styles.modalTime}>{selectedActivity.timeSlot}</Text>
                  <Text style={styles.modalRating}>⭐ {selectedActivity.rating} rating</Text>
                  <Text style={styles.modalDescription}>{selectedActivity.description}</Text>
                  
                  <View style={styles.modalMeta}>
                    <Text style={styles.modalDuration}>Duration: {selectedActivity.duration} hours</Text>
                    <Text style={styles.modalType}>Type: {selectedActivity.type}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MapTab;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.semantic.error[500],
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorButtons: {
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
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
  toggleButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  toggleButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  mapContainer: {
    flex: 1,
  },
  mapScrollView: {
    flex: 1,
  },
  mapContent: {
    padding: theme.spacing.lg,
  },
  mapPlaceholder: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  mapPlaceholderTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  mapPlaceholderSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  locationPin: {
    width: '48%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  pinIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pinEmoji: {
    fontSize: 24,
  },
  pinName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    minHeight: 32,
  },
  pinDetails: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  pinMapButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  pinMapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  openAllMapsButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  openAllMapsButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  destinationInfo: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  destinationTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  destinationSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  locationsContainer: {
    gap: theme.spacing.md,
  },
  locationCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  locationInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  locationName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
  },
  locationDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  locationType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    textTransform: 'capitalize',
  },
  locationDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    marginTop: theme.spacing.sm,
  },
  mapButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  mapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  closeButton: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.tertiary,
    padding: theme.spacing.sm,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalDay: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  modalTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  modalRating: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.semantic.warning[600],
    marginBottom: theme.spacing.md,
  },
  modalDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    marginBottom: theme.spacing.lg,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  modalType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textTransform: 'capitalize',
  },
});