import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/Theme';
import { PickerField } from '../../components/PickerField';
import { Button } from '../../components/Button';
import { destinationOptions, interestCategories, durationOptions } from '../../utils/MockData';
import { useAuth } from '../../utils/AuthContext';
import { useItinerary } from '../../utils/ItineraryContext';
import { ItineraryActivityFirestore } from '../../utils/firebaseFirestore';

interface TravelPreferences {
  destination: string;
  interests: string;
  duration: string;
}

const index = () => {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const { savedItineraries } = useItinerary();
  const navigation = useNavigation();
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: '',
    interests: '',
    duration: '',
  });
  const [errors, setErrors] = useState<Partial<TravelPreferences>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<TravelPreferences> = {};
    
    if (!preferences.destination) {
      newErrors.destination = 'Please select a destination';
    }
    if (!preferences.interests) {
      newErrors.interests = 'Please select your interests';
    }
    if (!preferences.duration) {
      newErrors.duration = 'Please select trip duration';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateItinerary = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to itinerary tab with preferences
      router.push({
        pathname: '/(tabs)/itinerary',
        params: {
          destination: preferences.destination,
          interests: preferences.interests,
          duration: preferences.duration,
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof TravelPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Function to get unique visited places from saved itineraries
  const getVisitedPlaces = () => {
    const uniqueLocations = new Set<string>();
    const visitedPlaces: { destination: string; image: string; rating: number; location: string }[] = [];

    savedItineraries.forEach(itinerary => {
      // Extract activities from all days in the itinerary
      itinerary.days?.forEach(day => {
        day.activities?.forEach((activity: ItineraryActivityFirestore) => {
          // Use activity name as the unique identifier
          if (!uniqueLocations.has(activity.name)) {
            uniqueLocations.add(activity.name);
            
            // Default images based on activity type and category
            const getActivityImage = (activity: ItineraryActivityFirestore): string => {
              const activityImages: { [key: string]: string } = {
                // Attractions
                'attraction': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'museum': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'historical': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'temple': 'https://images.unsplash.com/photo-1580971139398-dc3b2a8554d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'nature': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'nightlife': 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              };

              // Try to match by activity type first
              if (activityImages[activity.type]) {
                return activityImages[activity.type];
              }

              // Try to match by category
              const category = activity.category?.[0]?.toLowerCase() || '';
              if (activityImages[category]) {
                return activityImages[category];
              }

              // Default fallback based on activity name keywords
              const name = activity.name.toLowerCase();
              if (name.includes('museum')) return activityImages['museum'];
              if (name.includes('park') || name.includes('garden')) return activityImages['park'];
              if (name.includes('beach')) return activityImages['beach'];
              if (name.includes('temple') || name.includes('church') || name.includes('cathedral')) return activityImages['temple'];
              if (name.includes('restaurant') || name.includes('cafe') || name.includes('food')) return activityImages['restaurant'];
              if (name.includes('market') || name.includes('shop')) return activityImages['shopping'];
              if (name.includes('tower') || name.includes('palace') || name.includes('castle')) return activityImages['historical'];

              // Default image
              return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            };

            visitedPlaces.push({
              destination: activity.name,
              image: getActivityImage(activity),
              rating: activity.rating || (4.0 + Math.random() * 1.0), // Use actual rating or generate between 4.0-5.0
              location: itinerary.destination, // Show which city/destination this activity is in
            });
          }
        });
      });
    });

    return visitedPlaces;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80' }}
          style={styles.heroSection}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
            style={styles.heroGradient}
          >
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Ionicons name="menu" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.profileSection}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileImage}>
                  <Text style={styles.profileInitial}>{userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.heroContent}>
              <Text style={styles.greeting}>Hello {userProfile?.displayName || 'Explorer'}</Text>
              <Text style={styles.heroTitle}>Explore Beautiful World</Text>
              
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Where do you want to go?"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons name="options" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* Category Selection */}
        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <CategoryChip label="🏖️ Beach" active />
            <CategoryChip label="🏔️ Mountain" />
            <CategoryChip label="🏛️ Culture" />
            <CategoryChip label="🌃 City" />
            <CategoryChip label="🏕️ Adventure" />
            <CategoryChip label="🍕 Food" />
          </ScrollView>
        </View>

        {/* Places for You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Locations You've Visited</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesContainer}
          >
            {getVisitedPlaces().length > 0 ? (
              getVisitedPlaces().map((place, index) => (
                <PlaceCard 
                  key={index}
                  image={place.image}
                  title={place.destination}
                  rating={Number(place.rating.toFixed(1))}
                  location={place.location}
                />
              ))
            ) : (
              <View style={styles.emptyPlacesContainer}>
                <Ionicons name="location-outline" size={60} color="#ccc" />
                <Text style={styles.emptyPlacesText}>No locations visited yet</Text>
                <Text style={styles.emptyPlacesSubtext}>Start planning trips to see your visited attractions and places here!</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Plan Your Trip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Your Trip</Text>
          <View style={styles.planningForm}>
            <PickerField
              label="Destination"
              placeholder="Select your destination"
              items={destinationOptions}
              value={preferences.destination}
              onValueChange={(value) => handleFieldChange('destination', value)}
              error={errors.destination}
            />

            <PickerField
              label="Interests"
              placeholder="What interests you most?"
              items={interestCategories}
              value={preferences.interests}
              onValueChange={(value) => handleFieldChange('interests', value)}
              error={errors.interests}
            />

            <PickerField
              label="Trip Duration"
              placeholder="How long is your trip?"
              items={durationOptions}
              value={preferences.duration}
              onValueChange={(value) => handleFieldChange('duration', value)}
              error={errors.duration}
            />

            <Button
              title={loading ? "Generating Itinerary..." : "Generate Itinerary"}
              onPress={handleGenerateItinerary}
              loading={loading}
              disabled={loading}
              style={styles.generateButton}
            />
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Get</Text>
          <View style={styles.featuresList}>
            <FeatureItem 
              icon="📅" 
              title="Day-by-day itinerary" 
              description="Structured plan with activities for each day"
            />
            <FeatureItem 
              icon="🗺️" 
              title="Interactive map" 
              description="See all locations plotted on an interactive map"
            />
            <FeatureItem 
              icon="⭐" 
              title="Curated recommendations" 
              description="Handpicked attractions based on your interests"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Component Definitions
interface CategoryChipProps {
  label: string;
  active?: boolean;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ label, active = false }) => (
  <TouchableOpacity style={[styles.categoryChip, active && styles.categoryChipActive]}>
    <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

interface PlaceCardProps {
  image: string;
  title: string;
  rating: number;
  location: string;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ image, title, rating, location }) => (
  <TouchableOpacity style={styles.placeCard}>
    <ImageBackground source={{ uri: image }} style={styles.placeCardImage} resizeMode="cover">
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.placeCardGradient}
      >
        <View style={styles.placeCardContent}>
          <Text style={styles.placeCardTitle}>{title}</Text>
          <View style={styles.placeCardInfo}>
            <Text style={styles.placeCardLocation}>{location}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  </TouchableOpacity>
);

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon as any} size={24} color="#4A90E2" />
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export default index;

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  
  // Hero Section
  heroSection: {
    height: 280,
    marginBottom: 20,
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  // Search Section
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 5,
  },
  
  // Categories Section
  categoriesSection: {
    marginBottom: 25,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  
  // Section Styles
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  
  // Places Cards
  placesContainer: {
    paddingLeft: 0,
    gap: 15,
  },
  emptyPlacesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minWidth: screenWidth - 40,
  },
  emptyPlacesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  emptyPlacesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  placeCard: {
    width: 180,
    height: 220,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeCardImage: {
    flex: 1,
  },
  placeCardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  placeCardContent: {
    padding: 15,
  },
  placeCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  placeCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeCardLocation: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Button Styles
  primaryButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    paddingVertical: 8,
    marginTop: 10,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Planning Form
  planningForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  generateButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 15,
    paddingVertical: 8,
    marginTop: 20,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Features List
  featuresList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  
  featureTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
});