import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/Theme';
import { itineraryGenerator, GeneratedItinerary, ItineraryDay, ItineraryActivity } from '../../utils/ItineraryGenerator';
import { usePreMount } from '../../utils/PreMountContext';
import PreMountableActivityDetails from '../../components/PreMountableActivityDetails';
import { useAuth } from '../../utils/AuthContext';
import { useItinerary } from '../../utils/ItineraryContext';
import { saveItinerary, ItineraryFirestore } from '../../utils/firebaseFirestore';

const ItineraryTab = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { refreshItineraries } = useItinerary();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isManuallyCleared, setIsManuallyCleared] = useState(false);
  const [lastParams, setLastParams] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<ItineraryActivity | null>(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const { preMountAllActivities } = usePreMount();

  const getDestinationImage = (destinationName: string) => {
    const destinationImages: { [key: string]: string } = {
      'Accra': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'Paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    };
    
    return destinationImages[destinationName] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
  };

  const getEmptyStateImage = () => {
    // Use destination image if available, otherwise use inspirational travel image
    if (params.destination) {
      return getDestinationImage(params.destination as string);
    }
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80';
  };

  const saveItineraryToFirebase = async (itineraryToSave: GeneratedItinerary) => {
    if (!user || !itineraryToSave) return;
    
    try {
      setSaving(true);
      
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + itineraryToSave.totalDays - 1);
      
      const itineraryData: Omit<ItineraryFirestore, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        title: `${itineraryToSave.destination.name} Trip`,
        destination: itineraryToSave.destination.name,
        startDate: startDate,
        endDate: endDate,
        totalDays: itineraryToSave.totalDays,
        preferences: {
          interests: itineraryToSave.preferences.interests,
          duration: itineraryToSave.totalDays.toString() + ' days',
        },
        days: itineraryToSave.days.map(day => ({
          day: day.day,
          date: day.date,
          activities: day.activities.map(activity => ({
            id: activity.id,
            name: activity.name,
            type: activity.type as 'activity' | 'attraction' | 'restaurant' | 'hotel',
            category: [activity.type],
            description: activity.description,
            latitude: activity.latitude,
            longitude: activity.longitude,
            duration: activity.duration,
            rating: activity.rating,
            timeSlot: activity.timeSlot,
          })),
          totalDuration: day.totalDuration,
        })),
        isPublic: false,
        likes: 0,
        tags: [itineraryToSave.preferences.interests.toLowerCase()],
      };
      
      const itineraryId = await saveItinerary(itineraryData);
      
      // Refresh the itineraries context to update the history screen
      await refreshItineraries();
      
      Alert.alert('Success', 'Your itinerary has been saved!');
    } catch (error) {
      console.error('Error saving itinerary:', error);
      Alert.alert('Error', 'Failed to save itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Skip regeneration if the itinerary was manually cleared
    if (isManuallyCleared) {
      return;
    }

    // Create a stable key from params to avoid unnecessary regenerations
    const currentParamsKey = `${params.destination}-${params.interests}-${params.duration}`;
    
    // Only regenerate if the actual values have changed, not just the object reference
    if (currentParamsKey !== lastParams && params.destination && params.duration) {
      setLastParams(currentParamsKey);
      generateItinerary();
    } else if (!params.destination || !params.duration) {
      // Handle case where no valid params are provided
      setLoading(false);
      setItinerary(null);
    }
  }, [params.destination, params.interests, params.duration, lastParams, isManuallyCleared]);

  const generateItinerary = async () => {
    try {
      setLoading(true);
      // Reset manual clear flag when generating new itinerary
      setIsManuallyCleared(false);
      
      // Check if we have valid parameters
      if (!params.destination || !params.duration) {
        setLoading(false);
        return;
      }
      
      // Simulate API delay (reduced for better UX)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const generated = itineraryGenerator.generateItinerary(
        params.destination as string,
        params.interests as string,
        params.duration as string
      );
      
      if (generated) {
        setItinerary(generated);
        // Pre-mount all activity details as soon as itinerary is generated
        preMountAllActivities(generated);
      } else {
        Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleViewOnMap = () => {
    if (itinerary) {
      console.log('Navigating to map with params:', {
        destination: params.destination,
        interests: params.interests,
        duration: params.duration,
      });
      
      router.push({
        pathname: '/(tabs)/map',
        params: {
          destination: params.destination,
          interests: params.interests,
          duration: params.duration,
        },
      });
    } else {
      console.log('No itinerary available for map navigation');
      Alert.alert('Error', 'No itinerary data available to display on map.');
    }
  };

  const handleActivityPress = (activity: ItineraryActivity) => {
    setSelectedActivity(activity);
    setShowActivityDetails(true);
  };

  const handleCloseActivityDetails = () => {
    setShowActivityDetails(false);
    setSelectedActivity(null);
  };

  const handleClearItinerary = () => {
    Alert.alert(
      'Clear Itinerary',
      'Are you sure you want to clear the current itinerary? This will return you to the empty state.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // Set flag to prevent automatic regeneration
            setIsManuallyCleared(true);
            // Clear itinerary state and params to show no itinerary view
            setItinerary(null);
            setLastParams('');
            // Note: We stay on the same screen, it will show the no itinerary view
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Loading State Header */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
          }}
          style={styles.emptyStateBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            style={styles.emptyStateOverlay}
          >
            <View style={styles.emptyStateContent}>
              {/* Hamburger Menu */}
              <View style={styles.topBar}>
                <TouchableOpacity 
                  style={styles.hamburgerButton}
                  onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                  <Ionicons name="menu" size={28} color={theme.colors.text.inverse} />
                </TouchableOpacity>
                <View /> {/* Spacer for loading state */}
              </View>
              
              {/* Loading State Message */}
              <View style={styles.emptyStateMessageContainer}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="hourglass-outline" size={80} color={theme.colors.text.inverse} />
                </View>
                <Text style={styles.emptyStateTitle}>
                  {saving ? 'Saving Trip' : 'Creating Your Itinerary'}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {saving 
                    ? 'Saving your amazing itinerary to your account...' 
                    : 'We\'re crafting the perfect travel experience for you. This may take a moment.'
                  }
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Same as generated itinerary */}
          <ImageBackground
            source={{
              uri: getEmptyStateImage()
            }}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
              style={styles.headerOverlay}
            >
              <View style={styles.headerContent}>
                <View style={styles.topBar}>
                  <TouchableOpacity 
                    style={styles.hamburgerButton}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                  >
                    <Ionicons name="menu" size={28} color={theme.colors.text.inverse} />
                  </TouchableOpacity>
                  
                  <View /> {/* Empty spacer for no itinerary view */}
                </View>
                
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Your Itinerary</Text>
                  <Text style={styles.headerSubtitle}>
                    {params.destination && params.duration 
                      ? `Ready for ${params.destination}` 
                      : 'Ready for Adventure'
                    }
                  </Text>
                  <Text style={styles.headerPreferences}>
                    {params.interests 
                      ? `Focused on ${params.interests}` 
                      : 'Create your perfect trip'
                    }
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Story Peek Content - Instead of itinerary cards */}
          <View style={styles.noItineraryContainer}>
            <View style={styles.storyPeekCard}>
              <View style={styles.storyPeekIconContainer}>
                <Ionicons name="map-outline" size={60} color={theme.colors.primary[500]} />
              </View>
              
              <Text style={styles.storyPeekTitle}>
                {isManuallyCleared || !params.destination || !params.duration
                  ? 'No Itinerary Yet'
                  : 'Failed to Load Itinerary'
                }
              </Text>
              
              <Text style={styles.storyPeekDescription}>
                {isManuallyCleared || !params.destination || !params.duration
                  ? 'Ready to plan your next adventure? Head home to create a personalized travel itinerary with amazing destinations, activities, and experiences tailored just for you!'
                  : 'Something went wrong while generating your itinerary. Please try again or return home to create a new one.'
                }
              </Text>

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.storyPeekButton}
                onPress={() => {
                  if (isManuallyCleared || !params.destination || !params.duration) {
                    router.push('/(tabs)/');
                  } else {
                    generateItinerary();
                  }
                }}
              >
                <Text style={styles.storyPeekButtonText}>
                  {isManuallyCleared || !params.destination || !params.duration ? '🏠 Go to Home' : '🔄 Try Again'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagery Header */}
        <ImageBackground
          source={{
            uri: getDestinationImage(itinerary.destination.name)
          }}
          style={styles.headerBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
            style={styles.headerOverlay}
          >
            <View style={styles.headerContent}>
              <View style={styles.topBar}>
                <TouchableOpacity 
                  style={styles.hamburgerButton}
                  onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                  <Ionicons name="menu" size={28} color={theme.colors.text.inverse} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={handleClearItinerary}
                >
                  <Ionicons name="refresh" size={24} color={theme.colors.text.inverse} />
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Your Itinerary</Text>
                <Text style={styles.headerSubtitle}>
                  {itinerary.totalDays} days in {itinerary.destination.name}
                </Text>
                <Text style={styles.headerPreferences}>
                  Focused on {itinerary.preferences.interests}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.mapButton} onPress={handleViewOnMap}>
            <Text style={styles.mapButtonText}>🗺️ View on Map</Text>
          </TouchableOpacity>
          
          {user && (
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={() => saveItineraryToFirebase(itinerary)}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? '💾 Saving...' : '💾 Save Trip'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Days List */}
        <View style={styles.daysList}>
          {itinerary.days.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              onActivityPress={handleActivityPress}
            />
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Trip Summary</Text>
          <View style={styles.summaryStats}>
            <StatItem 
              label="Total Days" 
              value={itinerary.totalDays.toString()} 
            />
            <StatItem 
              label="Activities" 
              value={itinerary.days.reduce((sum, day) => sum + day.activities.length, 0).toString()} 
            />
            <StatItem 
              label="Total Hours" 
              value={itinerary.days.reduce((sum, day) => sum + day.totalDuration, 0).toString()} 
            />
          </View>
        </View>
      </ScrollView>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <PreMountableActivityDetails
          activity={selectedActivity}
          visible={showActivityDetails}
          onClose={handleCloseActivityDetails}
        />
      )}

      {/* Pre-mounted Activity Details (for instant loading) */}
      {itinerary.days.map((day) =>
        day.activities.map((activity) => (
          <PreMountableActivityDetails
            key={`premount-${activity.id}`}
            activity={activity}
            visible={false}
            onClose={() => {}}
          />
        ))
      )}
    </View>
  );
};

interface DayCardProps {
  day: ItineraryDay;
  onActivityPress: (activity: ItineraryActivity) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, onActivityPress }) => (
  <View style={styles.daySection}>
    <View style={styles.dayHeader}>
      <View style={styles.dayHeaderLeft}>
        <Text style={styles.dayNumber}>Day {day.day}</Text>
        <Text style={styles.dayDate}>{day.date}</Text>
      </View>
      <View style={styles.dayHeaderRight}>
        <Text style={styles.dayDuration}>{day.totalDuration}h total</Text>
        <Text style={styles.activitiesCount}>{day.activities.length} activities</Text>
      </View>
    </View>
    
    <View style={styles.dayContent}>
      {day.activities.map((activity, index) => (
        <ActivityCard 
          key={`${activity.id}-${index}`} 
          activity={activity} 
          onPress={onActivityPress}
        />
      ))}
    </View>
  </View>
);

interface ActivityCardProps {
  activity: ItineraryActivity;
  onPress: (activity: ItineraryActivity) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const handleCardPress = () => {
    onPress(activity);
  };

  const getDefaultImage = (type: string) => {
    switch (type) {
      case 'restaurant':
        return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
      case 'hotel':
        return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
      case 'activity':
        return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
      default:
        return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80';
    }
  };

  return (
    <TouchableOpacity style={styles.activityCard} onPress={handleCardPress}>
      <Image 
        source={{ uri: activity.imageUrl || getDefaultImage(activity.type) }}
        style={styles.activityImage}
        resizeMode="cover"
      />
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityName}>{activity.name}</Text>
          <View style={styles.activityRatingContainer}>
            <Text style={styles.activityRating}>⭐ {activity.rating}</Text>
          </View>
        </View>
        <Text style={styles.activityTime}>{activity.timeSlot}</Text>
        <Text style={styles.activityDescription} numberOfLines={2}>
          {activity.description}
        </Text>
        <View style={styles.activityMeta}>
          <View style={styles.activityDurationContainer}>
            <Text style={styles.activityDuration}>{activity.duration}h</Text>
          </View>
          <View style={styles.activityTypeContainer}>
            <Text style={styles.activityType}>{activity.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default ItineraryTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  loadingSubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  // Empty State Styles
  emptyStateBackground: {
    flex: 1,
    width: '100%',
  },
  emptyStateOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyStateContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  emptyStateMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateIcon: {
    marginBottom: theme.spacing.xl,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  emptyStateSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
    elevation: 8,
  },
  emptyStateButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    textAlign: 'center',
  },
  // Story Peek Styles (for no itinerary state)
  noItineraryContainer: {
    padding: theme.spacing.lg,
  },
  storyPeekCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  },
  storyPeekIconContainer: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
  },
  storyPeekTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  storyPeekDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  storyPeekButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
    elevation: 8,
    minWidth: 200,
  },
  storyPeekButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    textAlign: 'center',
  },
  // Imagery Header Styles
  headerBackground: {
    height: 280,
    width: '100%',
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingTop: theme.spacing.md, // Add padding to avoid status bar overlap
  },
  hamburgerButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...theme.shadows.sm,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(220, 38, 38, 0.2)', // Red tint for clear action
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    gap: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(34, 197, 94, 0.2)', // Green tint for home action
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    gap: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  clearButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium as any,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerPreferences: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtonsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -theme.spacing.lg, // Slight overlap with header
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.md,
    zIndex: 1,
  },
  mapButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    ...theme.shadows.lg,
    elevation: 8,
  },
  mapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  saveButton: {
    backgroundColor: theme.colors.semantic.success[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    flex: 1,
    ...theme.shadows.lg,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.text.tertiary,
    opacity: 0.7,
  },
  saveButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  daysList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  daySection: {
    marginBottom: theme.spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.inverse,
  },
  dayDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  dayHeaderRight: {
    alignItems: 'flex-end',
  },
  dayDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  activitiesCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: 2,
  },
  dayContent: {
    gap: theme.spacing.sm,
  },
  activityCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  activityImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.sm,
  },
  activityContent: {
    flex: 1,
    padding: theme.spacing.sm,
    paddingLeft: 0,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  activityName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  activityRatingContainer: {
    backgroundColor: theme.colors.semantic.warning[50],
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activityRating: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.semantic.warning[700],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  activityDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  activityDurationContainer: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activityDuration: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  activityTypeContainer: {
    backgroundColor: theme.colors.text.tertiary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activityType: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  summary: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.primary[600],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
});