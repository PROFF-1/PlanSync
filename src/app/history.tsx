import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface SavedItinerary {
  id: string;
  destination: string;
  duration: string;
  interests: string[];
  createdAt: Date;
  imageUrl: string;
  activities: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const HistoryScreen = () => {
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([
    {
      id: '1',
      destination: 'Paris, France',
      duration: '5 days',
      interests: ['Culture', 'Food', 'History'],
      createdAt: new Date('2024-03-15'),
      imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500',
      activities: 12,
      status: 'completed',
    },
    {
      id: '2',
      destination: 'Tokyo, Japan',
      duration: '7 days',
      interests: ['Culture', 'Food', 'Shopping'],
      createdAt: new Date('2024-02-10'),
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500',
      activities: 18,
      status: 'upcoming',
    },
    {
      id: '3',
      destination: 'New York, USA',
      duration: '4 days',
      interests: ['City Life', 'Shopping', 'Entertainment'],
      createdAt: new Date('2024-01-20'),
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500',
      activities: 10,
      status: 'completed',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'upcoming': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'upcoming': return 'time-outline';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderItinerary = ({ item }: { item: SavedItinerary }) => (
    <TouchableOpacity style={styles.itineraryCard}>
      <View style={styles.cardImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.cardImageOverlay}
        >
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={14} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.destinationText}>{item.destination}</Text>
        <Text style={styles.durationText}>{item.duration}</Text>
        
        <View style={styles.interestsContainer}>
          {item.interests.slice(0, 2).map((interest, index) => (
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
        <Text style={styles.headerTitle}>Travel History</Text>
        <Text style={styles.headerSubtitle}>Your saved itineraries</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{savedItineraries.length}</Text>
          <Text style={styles.statLabel}>Total Trips</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {savedItineraries.filter(i => i.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {savedItineraries.filter(i => i.status === 'upcoming').length}
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
      </View>

      {savedItineraries.length === 0 ? (
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  statBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 14,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
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
});

export default HistoryScreen;