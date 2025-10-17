import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useItinerary, SavedItinerary } from '../utils/ItineraryContext';

const { width: screenWidth } = Dimensions.get('window');

const HistoryScreen = () => {
  const navigation = useNavigation();
  const { savedItineraries, loading, refreshItineraries, clearAllItineraries } = useItinerary();

  // Debug logging
  console.log('History screen - savedItineraries:', savedItineraries.length);
  console.log('History screen - loading:', loading);

  const handleRefresh = async () => {
    try {
      await refreshItineraries();
    } catch (error) {
      console.error('Error refreshing itineraries:', error);
    }
  };

  const handleClearHistory = () => {
    if (savedItineraries.length === 0) {
      Alert.alert('No History', 'There are no itineraries to clear.');
      return;
    }

    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all your saved itineraries? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllItineraries();
              Alert.alert('Success', 'All itineraries have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear itineraries. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderItinerary = ({ item }: { item: SavedItinerary }) => (
    <TouchableOpacity style={styles.itineraryCard}>
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.cardImageOverlay}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.destinationText}>{item.destination}</Text>
        <Text style={styles.durationText}>{item.duration}</Text>
        
        <View style={styles.interestsContainer}>
          {item.interests.slice(0, 2).map((interest: string, index: number) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
          {item.interests.length > 2 && (
            <View style={styles.moreTag}>
              <Text style={styles.moreText}>+{item.interests.length - 2}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.activitiesInfo}>
            <Ionicons name="list-outline" size={16} color="#64748B" />
            <Text style={styles.activitiesText}>{item.activities} activities</Text>
          </View>
          <Text style={styles.dateText}>
            {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="map-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No saved itineraries</Text>
      <Text style={styles.emptySubtitle}>
        Create your first travel plan to see it here
      </Text>
      <TouchableOpacity style={styles.createButton}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.createButtonGradient}
        >
          <Text style={styles.createButtonText}>Create Itinerary</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleRefresh} style={styles.actionButton}>
              <Ionicons name="refresh-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearHistory} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerTitle}>Travel History</Text>
        <Text style={styles.headerSubtitle}>Your saved itineraries</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.totalTripsBox}>
          <Text style={styles.statNumber}>{savedItineraries.length}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading itineraries...</Text>
        </View>
      ) : savedItineraries.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={savedItineraries}
          renderItem={renderItinerary}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
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
  statsContainer: {
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  totalTripsBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itineraryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImageContainer: {
    height: 150,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 15,
  },
  cardContent: {
    padding: 20,
  },
  destinationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  durationText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
  },
  interestsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  interestText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '500',
  },
  moreTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  moreText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  activitiesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activitiesText: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 5,
  },
  dateText: {
    color: '#64748B',
    fontSize: 14,
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
  createButton: {
    marginTop: 30,
    borderRadius: 15,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default HistoryScreen;