// Mock data for travel destinations and activities
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'attraction' | 'restaurant' | 'hotel' | 'activity';
  category: string[];
  description: string;
  rating: number;
  duration: number; // in hours
  imageUrl?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  locations: Location[];
}

export const destinations: Destination[] = [
  {
    id: 'accra',
    name: 'Accra',
    country: 'Ghana',
    latitude: 5.6037,
    longitude: -0.1870,
    locations: [
      {
        id: 'kwame-nkrumah-mausoleum',
        name: 'Kwame Nkrumah Mausoleum',
        latitude: 5.5600,
        longitude: -0.2050,
        type: 'attraction',
        category: ['History', 'Culture'],
        description: 'Memorial park and mausoleum of Ghana\'s first president',
        rating: 4.5,
        duration: 2,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      },
      {
        id: 'independence-square',
        name: 'Independence Square',
        latitude: 5.5465,
        longitude: -0.2080,
        type: 'attraction',
        category: ['History', 'Culture'],
        description: 'Historic square commemorating Ghana\'s independence',
        rating: 4.2,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        duration: 1,
      },
      {
        id: 'national-museum',
        name: 'National Museum of Ghana',
        latitude: 5.5564,
        longitude: -0.2063,
        type: 'attraction',
        category: ['History', 'Culture', 'Art'],
        description: 'Ghana\'s premier museum showcasing artifacts and cultural heritage',
        rating: 4.3,
        duration: 3,
      },
      {
        id: 'makola-market',
        name: 'Makola Market',
        latitude: 5.5564,
        longitude: -0.2063,
        type: 'attraction',
        category: ['Culture', 'Shopping'],
        description: 'Vibrant traditional market in the heart of Accra',
        rating: 4.0,
        duration: 2,
      },
      {
        id: 'labadi-beach',
        name: 'Labadi Beach',
        latitude: 5.5465,
        longitude: -0.1681,
        type: 'attraction',
        category: ['Nature', 'Recreation', 'Beach'],
        description: 'Popular beach destination with golden sand and local culture',
        rating: 4.1,
        duration: 4,
      },
      {
        id: 'elmina-castle',
        name: 'Elmina Castle',
        latitude: 5.0831,
        longitude: -1.3424,
        type: 'attraction',
        category: ['History', 'Culture'],
        description: 'Historic castle and UNESCO World Heritage site',
        rating: 4.7,
        duration: 3,
      },
      {
        id: 'arts-centre',
        name: 'Centre for National Culture',
        latitude: 5.5564,
        longitude: -0.2031,
        type: 'attraction',
        category: ['Art', 'Culture', 'Shopping'],
        description: 'Hub for traditional Ghanaian arts and crafts',
        rating: 4.2,
        duration: 2,
      },
      {
        id: 'cocoa-house',
        name: 'Cocoa House',
        latitude: 5.5564,
        longitude: -0.2010,
        type: 'attraction',
        category: ['History', 'Architecture'],
        description: 'Historic building showcasing Ghana\'s cocoa heritage',
        rating: 3.8,
        duration: 1,
      },
      {
        id: 'osu-castle',
        name: 'Osu Castle (Christiansborg)',
        latitude: 5.5465,
        longitude: -0.1915,
        type: 'attraction',
        category: ['History', 'Architecture'],
        description: 'Historic Danish-built castle, former seat of government',
        rating: 4.4,
        duration: 2,
      },
      {
        id: 'aburi-gardens',
        name: 'Aburi Botanical Gardens',
        latitude: 5.8500,
        longitude: -0.1700,
        type: 'attraction',
        category: ['Nature', 'Recreation'],
        description: 'Beautiful botanical gardens in the Eastern Region hills',
        rating: 4.6,
        duration: 3,
      },
      // Restaurants
      {
        id: 'buka-restaurant',
        name: 'Buka Restaurant',
        latitude: 5.5600,
        longitude: -0.1900,
        type: 'restaurant',
        category: ['Food', 'Local Cuisine'],
        description: 'Authentic Ghanaian cuisine in a traditional setting',
        rating: 4.3,
        duration: 2,
      },
      {
        id: 'republic-bar',
        name: 'Republic Bar & Grill',
        latitude: 5.5550,
        longitude: -0.1850,
        type: 'restaurant',
        category: ['Food', 'Modern'],
        description: 'Contemporary dining with international and local fusion',
        rating: 4.5,
        duration: 2,
      },
    ],
  },
  {
    id: 'cape-coast',
    name: 'Cape Coast',
    country: 'Ghana',
    latitude: 5.1053,
    longitude: -1.2466,
    locations: [
      {
        id: 'cape-coast-castle',
        name: 'Cape Coast Castle',
        latitude: 5.1053,
        longitude: -1.2466,
        type: 'attraction',
        category: ['History', 'Culture'],
        description: 'Historic slave trading post and UNESCO World Heritage site',
        rating: 4.8,
        duration: 3,
      },
      {
        id: 'kakum-national-park',
        name: 'Kakum National Park',
        latitude: 5.3500,
        longitude: -1.3833,
        type: 'attraction',
        category: ['Nature', 'Adventure', 'Wildlife'],
        description: 'Tropical rainforest with canopy walkway',
        rating: 4.7,
        duration: 4,
      },
    ],
  },
  {
    id: 'kumasi',
    name: 'Kumasi',
    country: 'Ghana',
    latitude: 6.6885,
    longitude: -1.6244,
    locations: [
      {
        id: 'manhyia-palace',
        name: 'Manhyia Palace Museum',
        latitude: 6.6885,
        longitude: -1.6244,
        type: 'attraction',
        category: ['History', 'Culture', 'Royalty'],
        description: 'Former palace of the Asantehene, now a museum',
        rating: 4.6,
        duration: 2,
      },
      {
        id: 'kejetia-market',
        name: 'Kejetia Market',
        latitude: 6.6980,
        longitude: -1.6280,
        type: 'attraction',
        category: ['Culture', 'Shopping'],
        description: 'One of the largest open-air markets in West Africa',
        rating: 4.2,
        duration: 3,
      },
    ],
  },
];

export const interestCategories = [
  { label: 'History', value: 'History' },
  { label: 'Culture', value: 'Culture' },
  { label: 'Nature', value: 'Nature' },
  { label: 'Art', value: 'Art' },
  { label: 'Food', value: 'Food' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Beach', value: 'Beach' },
  { label: 'Shopping', value: 'Shopping' },
  { label: 'Recreation', value: 'Recreation' },
  { label: 'Wildlife', value: 'Wildlife' },
];

export const durationOptions = [
  { label: '3 days', value: '3' },
  { label: '5 days', value: '5' },
  { label: '7 days', value: '7' },
  { label: '10 days', value: '10' },
  { label: '14 days', value: '14' },
];

export const destinationOptions = destinations.map(dest => ({
  label: `${dest.name}, ${dest.country}`,
  value: dest.id,
}));