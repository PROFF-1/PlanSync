import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { theme } from '../../utils/Theme';
import { PickerField } from '../../components/PickerField';
import { Button } from '../../components/Button';
import { destinationOptions, interestCategories, durationOptions } from '../../utils/MockData';

interface TravelPreferences {
  destination: string;
  interests: string;
  duration: string;
}

const index = () => {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    destination: '',
    interests: '',
    duration: '',
  });
  const [errors, setErrors] = useState<Partial<TravelPreferences>>({});
  const [loading, setLoading] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Plan Your Trip</Text>
          <Text style={styles.subtitle}>
            Tell us your preferences and we'll create a perfect itinerary for you
          </Text>
        </View>

        <View style={styles.form}>
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

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What You'll Get</Text>
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

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export default index;

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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  form: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  generateButton: {
    marginTop: theme.spacing.lg,
  },
  features: {
    paddingHorizontal: theme.spacing.lg,
  },
  featuresTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  featuresList: {
    gap: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
  },
});