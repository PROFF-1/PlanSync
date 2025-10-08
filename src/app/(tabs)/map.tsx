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
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { theme } from '../../utils/Theme';
import { itineraryGenerator, GeneratedItinerary, ItineraryActivity } from '../../utils/ItineraryGenerator';

const MapTab = () => {
  const params = useLocalSearchParams();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ItineraryActivity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMap, setShowMap] = useState(true); // Default to map view
  const [lastParams, setLastParams] = useState<string>('');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocationForMap, setSelectedLocationForMap] = useState<ItineraryActivity | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

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

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      } else {
        setLocationPermission(false);
      }
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  };

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
    setSelectedLocationForMap(activity);
    setMapModalVisible(true);
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
    setSelectedLocationForMap(null);
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

  const generateMapHTML = () => {
    if (!itinerary) return '';

    const allActivities = itinerary.days.flatMap(day => 
      day.activities.map(activity => ({ ...activity, day: day.day }))
    );

    // Calculate center point
    const lats = allActivities.map(a => a.latitude);
    const lngs = allActivities.map(a => a.longitude);
    const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
    const centerLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;

    // Generate markers data
    const markersData = allActivities.map((activity, index) => ({
      lat: activity.latitude,
      lng: activity.longitude,
      title: activity.name,
      description: `Day ${(activity as any).day} • ${activity.timeSlot}`,
      icon: getLocationIcon(activity.type),
      type: activity.type,
      index
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          }
          #map { height: 100%; width: 100%; }
          .custom-marker {
            background: white;
            border: 3px solid #3B82F6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }
          .popup-content {
            padding: 10px;
            max-width: 200px;
            text-align: center;
          }
          .popup-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #1F2937;
          }
          .popup-description {
            color: #6B7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 12);

          // Add tile layer (OpenStreetMap)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          const markers = ${JSON.stringify(markersData)};
          const bounds = [];

          // Add markers
          markers.forEach((markerData, index) => {
            const lat = markerData.lat;
            const lng = markerData.lng;
            bounds.push([lat, lng]);

            // Create custom marker
            const customIcon = L.divIcon({
              html: \`<div class="custom-marker">\${markerData.icon}</div>\`,
              className: 'custom-div-icon',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });

            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

            // Add popup
            marker.bindPopup(\`
              <div class="popup-content">
                <div class="popup-title">\${markerData.icon} \${markerData.title}</div>
                <div class="popup-description">\${markerData.description}</div>
              </div>
            \`);
          });

          // Fit map to show all markers
          if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [20, 20] });
          }

          // Add user location if available
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const userIcon = L.divIcon({
                  html: '<div style="background: #3B82F6; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                  className: 'user-location-icon',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                });

                L.marker([userLat, userLng], { icon: userIcon })
                  .addTo(map)
                  .bindPopup('<div class="popup-content"><div class="popup-title">📍 Your Location</div></div>');
              },
              (error) => {
                console.log('Geolocation error:', error);
              }
            );
          }
        </script>
      </body>
      </html>
    `;
  };

  const generateSingleLocationMapHTML = (activity: ItineraryActivity) => {
    if (!activity) return '';

    const icon = getLocationIcon(activity.type);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          }
          #map { height: 100%; width: 100%; }
          .custom-marker {
            background: white;
            border: 3px solid #3B82F6;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          }
          .user-location {
            background: #10B981;
            border: 3px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          }
          .popup-content {
            padding: 15px;
            max-width: 250px;
            text-align: center;
          }
          .popup-title {
            font-weight: bold;
            margin-bottom: 8px;
            color: #1F2937;
            font-size: 16px;
          }
          .popup-description {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .popup-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 10px;
          }
          .popup-button {
            background: #3B82F6;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
          }
          .popup-button:hover {
            background: #2563EB;
          }
          .directions-panel {
            position: absolute;
            top: 10px;
            right: 10px;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 200px;
            z-index: 1000;
          }
          .directions-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #1F2937;
          }
          .directions-content {
            font-size: 12px;
            color: #6B7280;
          }
          .leaflet-routing-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
        <script>
          const destinationLat = ${activity.latitude};
          const destinationLng = ${activity.longitude};
          
          // Initialize map centered on destination
          const map = L.map('map').setView([destinationLat, destinationLng], 15);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Add destination marker
          const destinationIcon = L.divIcon({
            html: \`<div class="custom-marker">${icon}</div>\`,
            className: 'custom-div-icon',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
          });

          const destinationMarker = L.marker([destinationLat, destinationLng], { 
            icon: destinationIcon 
          }).addTo(map);

          destinationMarker.bindPopup(\`
            <div class="popup-content">
              <div class="popup-title">${icon} ${activity.name}</div>
              <div class="popup-description">${activity.description || 'No description available'}</div>
              <div class="popup-description">⭐ ${activity.rating} rating</div>
              <div class="popup-actions">
                <button class="popup-button" onclick="openInGoogleMaps()">Google Maps</button>
                <button class="popup-button" onclick="copyAddress()">Copy Location</button>
              </div>
            </div>
          \`);

          let routingControl = null;
          let userMarker = null;

          // Get user location and show directions
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Add user location marker
                const userIcon = L.divIcon({
                  html: '<div class="user-location"></div>',
                  className: 'user-location-icon',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                });

                userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
                userMarker.bindPopup('<div class="popup-content"><div class="popup-title">📍 Your Location</div></div>');

                // Add routing
                routingControl = L.Routing.control({
                  waypoints: [
                    L.latLng(userLat, userLng),
                    L.latLng(destinationLat, destinationLng)
                  ],
                  routeWhileDragging: false,
                  addWaypoints: false,
                  createMarker: function() { return null; }, // Don't create default markers
                  lineOptions: {
                    styles: [{ color: '#3B82F6', weight: 4, opacity: 0.8 }]
                  }
                }).addTo(map);

                // Fit map to show both locations
                const group = new L.featureGroup([userMarker, destinationMarker]);
                map.fitBounds(group.getBounds().pad(0.1));
              },
              (error) => {
                console.log('Geolocation error:', error);
                // If location fails, just show the destination
                map.setView([destinationLat, destinationLng], 15);
              }
            );
          }

          // Global functions for popup buttons
          window.openInGoogleMaps = function() {
            const url = \`https://www.google.com/maps/search/?api=1&query=\${destinationLat},\${destinationLng}\`;
            window.open(url, '_blank');
          };

          window.copyAddress = function() {
            const text = \`\${destinationLat},\${destinationLng}\`;
            if (navigator.clipboard) {
              navigator.clipboard.writeText(text);
              alert('Coordinates copied to clipboard!');
            } else {
              // Fallback for older browsers
              const textArea = document.createElement('textarea');
              textArea.value = text;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              alert('Coordinates copied to clipboard!');
            }
          };
        </script>
      </body>
      </html>
    `;
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
          <Text style={styles.mapButtonText}>View Map</Text>
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
          <WebView
            style={styles.map}
            source={{ html: generateMapHTML() }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
          
          {/* Floating info card */}
          <View style={styles.mapInfoCard}>
            <Text style={styles.mapInfoTitle}>
              {itinerary.destination.name}
            </Text>
            <Text style={styles.mapInfoSubtitle}>
              {allActivities.length} locations • {itinerary.totalDays} days
            </Text>
          </View>
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

                  {/* Add View Map button in the modal */}
                  <TouchableOpacity 
                    style={styles.modalMapButton} 
                    onPress={() => {
                      closeModal();
                      openInMaps(selectedActivity);
                    }}
                  >
                    <Text style={styles.modalMapButtonText}>🗺️ View Map & Directions</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Individual Location Map Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={mapModalVisible}
        onRequestClose={closeMapModal}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={closeMapModal} style={styles.mapModalBackButton}>
              <Text style={styles.mapModalBackText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>
              {selectedLocationForMap ? `${getLocationIcon(selectedLocationForMap.type)} ${selectedLocationForMap.name}` : 'Location Map'}
            </Text>
            <View style={styles.mapModalSpacer} />
          </View>
          
          {selectedLocationForMap && (
            <WebView
              style={styles.fullMap}
              source={{ html: generateSingleLocationMapHTML(selectedLocationForMap) }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              geolocationEnabled={true}
            />
          )}
        </SafeAreaView>
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
  map: {
    flex: 1,
  },
  mapInfoCard: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.lg,
  },
  mapInfoTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  mapInfoSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
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
  modalMapButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  modalMapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  mapModalBackButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  mapModalBackText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  mapModalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  mapModalSpacer: {
    width: 60, // Same width as back button for centering
  },
  fullMap: {
    flex: 1,
  },
});