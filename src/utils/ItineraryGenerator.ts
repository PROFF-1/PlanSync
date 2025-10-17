import { destinations, Location, Destination } from './MockData';

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
  totalDuration: number;
}

export interface ItineraryActivity {
  id: string;
  name: string;
  type: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  category: string[];
  description: string;
  latitude: number;
  longitude: number;
  duration: number;
  rating: number;
  timeSlot: string;
  imageUrl?: string;
}

export interface GeneratedItinerary {
  destination: Destination;
  days: ItineraryDay[];
  totalDays: number;
  preferences: {
    interests: string;
    duration: string;
  };
}

export class ItineraryGenerator {
  private getDestinationById(destinationId: string): Destination | null {
    return destinations.find(dest => dest.id === destinationId) || null;
  }

  private filterLocationsByInterest(locations: Location[], interest: string): Location[] {
    return locations.filter(location => 
      location.category.some(cat => 
        cat.toLowerCase().includes(interest.toLowerCase())
      )
    );
  }

  private sortLocationsByRating(locations: Location[]): Location[] {
    return [...locations].sort((a, b) => b.rating - a.rating);
  }

  private distributeActivitiesAcrossDays(
    locations: Location[], 
    totalDays: number
  ): ItineraryDay[] {
    const days: ItineraryDay[] = [];
    const startDate = new Date();
    
    // Calculate activities per day (aim for 2-4 activities per day)
    const activitiesPerDay = Math.max(2, Math.min(4, Math.ceil(locations.length / totalDays)));
    
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayNum - 1);
      
      const startIndex = (dayNum - 1) * activitiesPerDay;
      const endIndex = Math.min(startIndex + activitiesPerDay, locations.length);
      const dayLocations = locations.slice(startIndex, endIndex);
      
      const activities: ItineraryActivity[] = dayLocations.map((location, index) => {
        const timeSlots = ['Morning (9:00-12:00)', 'Afternoon (12:00-16:00)', 'Evening (16:00-20:00)'];
        const timeSlot = timeSlots[index % timeSlots.length];
        
        return {
          id: location.id,
          name: location.name,
          type: location.type,
          category: location.category,
          description: location.description,
          latitude: location.latitude,
          longitude: location.longitude,
          duration: location.duration,
          rating: location.rating,
          timeSlot,
          imageUrl: location.imageUrl,
        };
      });
      
      const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
      
      days.push({
        day: dayNum,
        date: currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        activities,
        totalDuration,
      });
    }
    
    return days;
  }

  private addRestaurantsAndActivities(days: ItineraryDay[], allLocations: Location[]): ItineraryDay[] {
    const restaurants = allLocations.filter(loc => loc.type === 'restaurant');
    
    return days.map(day => {
      // Add a restaurant for lunch/dinner if there's space and available restaurants
      if (day.activities.length < 4 && restaurants.length > 0) {
        const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
        const restaurantActivity: ItineraryActivity = {
          id: `${randomRestaurant.id}-day-${day.day}`,
          name: randomRestaurant.name,
          type: randomRestaurant.type,
          category: randomRestaurant.category,
          description: randomRestaurant.description,
          latitude: randomRestaurant.latitude,
          longitude: randomRestaurant.longitude,
          duration: randomRestaurant.duration,
          rating: randomRestaurant.rating,
          timeSlot: 'Lunch/Dinner (12:00-14:00)',
          imageUrl: randomRestaurant.imageUrl,
        };
        
        day.activities.push(restaurantActivity);
        day.totalDuration += restaurantActivity.duration;
      }
      
      return day;
    });
  }

  public generateItinerary(
    destinationId: string,
    interests: string,
    duration: string
  ): GeneratedItinerary | null {
    const destination = this.getDestinationById(destinationId);
    if (!destination) {
      return null;
    }

    const totalDays = parseInt(duration, 10);
    if (isNaN(totalDays) || totalDays <= 0) {
      return null;
    }

    // Filter locations based on interests
    let filteredLocations = this.filterLocationsByInterest(destination.locations, interests);
    
    // If no specific matches, include all attraction types
    if (filteredLocations.length === 0) {
      filteredLocations = destination.locations.filter(loc => loc.type === 'attraction');
    }
    
    // Sort by rating to prioritize better locations
    const sortedLocations = this.sortLocationsByRating(filteredLocations);
    
    // Limit locations to ensure reasonable itinerary size
    const maxLocations = totalDays * 3; // Max 3 main activities per day
    const selectedLocations = sortedLocations.slice(0, maxLocations);
    
    // Distribute activities across days
    let days = this.distributeActivitiesAcrossDays(selectedLocations, totalDays);
    
    // Add restaurants and additional activities
    days = this.addRestaurantsAndActivities(days, destination.locations);
    
    return {
      destination,
      days,
      totalDays,
      preferences: {
        interests,
        duration,
      },
    };
  }
}

// Export a singleton instance
export const itineraryGenerator = new ItineraryGenerator();