import { Dimensions, PixelRatio, Platform } from 'react-native';
import React from 'react';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define breakpoints (similar to Tailwind CSS)
export const BREAKPOINTS = {
  xs: 0,     // Extra small devices
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (small laptops)
  xl: 1280,  // Extra large devices (desktops)
  xxl: 1536, // 2X large devices (large desktops)
} as const;

// Device type detection
export const DEVICE_TYPES = {
  PHONE: SCREEN_WIDTH < BREAKPOINTS.md,
  TABLET: SCREEN_WIDTH >= BREAKPOINTS.md && SCREEN_WIDTH < BREAKPOINTS.lg,
  DESKTOP: SCREEN_WIDTH >= BREAKPOINTS.lg,
} as const;

// Screen dimensions
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  isPortrait: SCREEN_HEIGHT > SCREEN_WIDTH,
} as const;

// Responsive width function
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

// Responsive height function
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Responsive font size based on screen width
export const rf = (size: number): number => {
  const scale = SCREEN_WIDTH / 375; // Base width (iPhone X)
  const newSize = size * scale;
  
  // Ensure minimum and maximum font sizes
  const minSize = size * 0.8;
  const maxSize = size * 1.3;
  
  return Math.max(minSize, Math.min(newSize, maxSize));
};

// Pixel density responsive function
export const normalize = (size: number): number => {
  const pixelRatio = PixelRatio.get();
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(size));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(size)) - 2;
  }
};

// Responsive padding/margin based on screen size
export const spacing = {
  xs: wp(1),    // 1% of screen width
  sm: wp(2),    // 2% of screen width
  md: wp(4),    // 4% of screen width
  lg: wp(6),    // 6% of screen width
  xl: wp(8),    // 8% of screen width
  xxl: wp(10),  // 10% of screen width
} as const;

// Responsive border radius
export const borderRadius = {
  xs: wp(1),
  sm: wp(2),
  md: wp(3),
  lg: wp(4),
  xl: wp(6),
  full: wp(50),
} as const;

// Get responsive value based on screen size
export const getResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}): T | undefined => {
  const width = SCREEN_WIDTH;
  
  if (width >= BREAKPOINTS.xxl && values.xxl !== undefined) return values.xxl;
  if (width >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
  if (width >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
  if (width >= BREAKPOINTS.md && values.md !== undefined) return values.md;
  if (width >= BREAKPOINTS.sm && values.sm !== undefined) return values.sm;
  if (values.xs !== undefined) return values.xs;
  
  // Return the largest available value if no match
  return values.xxl || values.xl || values.lg || values.md || values.sm || values.xs;
};

// Responsive styles creator
export const createResponsiveStyles = <T extends Record<string, any>>(
  baseStyles: T,
  responsiveOverrides?: {
    xs?: Partial<T>;
    sm?: Partial<T>;
    md?: Partial<T>;
    lg?: Partial<T>;
    xl?: Partial<T>;
    xxl?: Partial<T>;
  }
): T => {
  if (!responsiveOverrides) return baseStyles;
  
  const width = SCREEN_WIDTH;
  let overrides = {};
  
  // Apply overrides based on current screen size
  if (width >= BREAKPOINTS.xxl && responsiveOverrides.xxl) {
    overrides = { ...overrides, ...responsiveOverrides.xxl };
  } else if (width >= BREAKPOINTS.xl && responsiveOverrides.xl) {
    overrides = { ...overrides, ...responsiveOverrides.xl };
  } else if (width >= BREAKPOINTS.lg && responsiveOverrides.lg) {
    overrides = { ...overrides, ...responsiveOverrides.lg };
  } else if (width >= BREAKPOINTS.md && responsiveOverrides.md) {
    overrides = { ...overrides, ...responsiveOverrides.md };
  } else if (width >= BREAKPOINTS.sm && responsiveOverrides.sm) {
    overrides = { ...overrides, ...responsiveOverrides.sm };
  } else if (responsiveOverrides.xs) {
    overrides = { ...overrides, ...responsiveOverrides.xs };
  }
  
  return { ...baseStyles, ...overrides };
};

// Hook for responsive updates (optional, if you want dynamic updates)
export const useResponsive = () => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    isPhone: dimensions.width < BREAKPOINTS.md,
    isTablet: dimensions.width >= BREAKPOINTS.md && dimensions.width < BREAKPOINTS.lg,
    isDesktop: dimensions.width >= BREAKPOINTS.lg,
    isLandscape: dimensions.width > dimensions.height,
    isPortrait: dimensions.height > dimensions.width,
  };
};

// Common responsive component sizes
export const COMPONENT_SIZES = {
  button: {
    height: getResponsiveValue({ xs: hp(6), md: hp(7), lg: hp(8) }),
    paddingHorizontal: getResponsiveValue({ xs: wp(4), md: wp(6), lg: wp(8) }),
  },
  input: {
    height: getResponsiveValue({ xs: hp(6), md: hp(7), lg: hp(8) }),
    paddingHorizontal: getResponsiveValue({ xs: wp(3), md: wp(4), lg: wp(5) }),
  },
  card: {
    padding: getResponsiveValue({ xs: wp(4), md: wp(6), lg: wp(8) }),
    borderRadius: getResponsiveValue({ xs: wp(2), md: wp(3), lg: wp(4) }),
  },
} as const;

// Responsive typography
export const TYPOGRAPHY = {
  h1: rf(32),
  h2: rf(28),
  h3: rf(24),
  h4: rf(20),
  h5: rf(18),
  h6: rf(16),
  body: rf(14),
  caption: rf(12),
  small: rf(10),
} as const;

// Export everything as default object
export default {
  wp,
  hp,
  rf,
  normalize,
  spacing,
  borderRadius,
  getResponsiveValue,
  createResponsiveStyles,
  useResponsive,
  BREAKPOINTS,
  DEVICE_TYPES,
  SCREEN_DIMENSIONS,
  COMPONENT_SIZES,
  TYPOGRAPHY,
};