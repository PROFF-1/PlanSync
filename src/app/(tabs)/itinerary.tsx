import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { theme } from '../../utils/Theme';
import { itineraryGenerator, GeneratedItinerary, ItineraryDay, ItineraryActivity } from '../../utils/ItineraryGenerator';

const ItineraryTab = () => {
  const params = useLocalSearchParams();
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    generateItinerary();
  }, [params]);

  const generateItinerary = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const generated = itineraryGenerator.generateItinerary(
        params.destination as string,
        params.interests as string,
        params.duration as string
      );
      
      if (generated) {
        setItinerary(generated);
      } else {
        Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDayExpansion = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  const handleViewOnMap = () => {
    if (itinerary) {
      router.push({
        pathname: '/(tabs)/map',
        params: {
          destination: params.destination,
          interests: params.interests,
          duration: params.duration,
        },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating your itinerary...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load itinerary</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateItinerary}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Itinerary</Text>
          <Text style={styles.subtitle}>
            {itinerary.totalDays} days in {itinerary.destination.name}
          </Text>
          <Text style={styles.preferences}>
            Focused on {itinerary.preferences.interests}
          </Text>
        </View>

        {/* View on Map Button */}
        <View style={styles.mapButtonContainer}>
          <TouchableOpacity style={styles.mapButton} onPress={handleViewOnMap}>
            <Text style={styles.mapButtonText}>🗺️ View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Days List */}
        <View style={styles.daysList}>
          {itinerary.days.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              isExpanded={expandedDay === day.day}
              onToggle={() => toggleDayExpansion(day.day)}
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
    </SafeAreaView>
  );
};

interface DayCardProps {
  day: ItineraryDay;
  isExpanded: boolean;
  onToggle: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, isExpanded, onToggle }) => (
  <View style={styles.dayCard}>
    <TouchableOpacity style={styles.dayHeader} onPress={onToggle}>
      <View style={styles.dayHeaderLeft}>
        <Text style={styles.dayNumber}>Day {day.day}</Text>
        <Text style={styles.dayDate}>{day.date}</Text>
      </View>
      <View style={styles.dayHeaderRight}>
        <Text style={styles.dayDuration}>{day.totalDuration}h</Text>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </View>
    </TouchableOpacity>
    
    {isExpanded && (
      <View style={styles.dayContent}>
        {day.activities.map((activity, index) => (
          <ActivityCard key={`${activity.id}-${index}`} activity={activity} />
        ))}
      </View>
    )}
  </View>
);

interface ActivityCardProps {
  activity: ItineraryActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => (
  <View style={styles.activityCard}>
    <View style={styles.activityHeader}>
      <Text style={styles.activityName}>{activity.name}</Text>
      <Text style={styles.activityRating}>⭐ {activity.rating}</Text>
    </View>
    <Text style={styles.activityTime}>{activity.timeSlot}</Text>
    <Text style={styles.activityDescription}>{activity.description}</Text>
    <View style={styles.activityMeta}>
      <Text style={styles.activityDuration}>{activity.duration}h</Text>
      <Text style={styles.activityType}>{activity.type}</Text>
    </View>
  </View>
);

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
    paddingBottom: theme.spacing['2xl'],
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.semantic.error[500],
    marginBottom: theme.spacing.lg,
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  preferences: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[600],
  },
  mapButtonContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  mapButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  mapButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  daysList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dayCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary[50],
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayNumber: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
  },
  dayDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  dayHeaderRight: {
    alignItems: 'flex-end',
  },
  dayDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  expandIcon: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  dayContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  activityCard: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary[400],
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
  activityRating: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.semantic.warning[600],
  },
  activityTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
  },
  activityDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  activityType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textTransform: 'capitalize',
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