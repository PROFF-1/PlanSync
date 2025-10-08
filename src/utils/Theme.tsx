// Design System extracted from designer specifications
export const theme = {
  colors: {
    // Primary Brand Colors (Blues & Purples from your design)
    primary: {
      50: '#eff6ff',   // Lightest blue
      100: '#dbeafe',  // Light blue
      200: '#bfdbfe',  // Medium light blue
      300: '#93c5fd',  // Medium blue
      400: '#60a5fa',  // Blue
      500: '#3b82f6',  // Main primary blue
      600: '#2563eb',  // Dark blue
      700: '#1d4ed8',  // Darker blue
      800: '#1e40af',  // Very dark blue
      900: '#1e3a8a',  // Darkest blue
    },
    
    // Secondary Colors (Purples from your design)
    secondary: {
      50: '#faf5ff',   // Lightest purple
      100: '#f3e8ff',  // Light purple
      200: '#e9d5ff',  // Medium light purple
      300: '#d8b4fe',  // Medium purple
      400: '#c084fc',  // Purple
      500: '#a855f7',  // Main secondary purple
      600: '#9333ea',  // Dark purple
      700: '#7c3aed',  // Darker purple
      800: '#6b21a8',  // Very dark purple
      900: '#581c87',  // Darkest purple
    },
    
    // Neutral Colors (Grays from your design)
    neutral: {
      0: '#ffffff',    // Pure white
      50: '#f9fafb',   // Lightest gray
      100: '#f3f4f6',  // Very light gray
      200: '#e5e7eb',  // Light gray
      300: '#d1d5db',  // Medium light gray
      400: '#9ca3af',  // Medium gray
      500: '#6b7280',  // Gray
      600: '#4b5563',  // Dark gray
      700: '#374151',  // Darker gray
      800: '#1f2937',  // Very dark gray
      900: '#111827',  // Darkest gray
      1000: '#000000', // Pure black
    },
    
    // Semantic Colors (from your color palette)
    semantic: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#22c55e',  // Main success green
        600: '#16a34a',
        700: '#15803d',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        500: '#f59e0b',  // Main warning orange
        600: '#d97706',
        700: '#b45309',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',  // Main error red
        600: '#dc2626',
        700: '#b91c1c',
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',  // Main info blue
        600: '#2563eb',
        700: '#1d4ed8',
      },
    },
    
    // Background Colors
    background: {
      primary: '#ffffff',      // Main background
      secondary: '#f9fafb',    // Secondary background
      tertiary: '#f3f4f6',     // Card backgrounds
      inverse: '#111827',      // Dark mode background
    },
    
    // Text Colors
    text: {
      primary: '#111827',      // Main text
      secondary: '#6b7280',    // Secondary text
      tertiary: '#9ca3af',     // Muted text
      inverse: '#ffffff',      // Text on dark backgrounds
      link: '#3b82f6',         // Link text
    },
    
    // Border Colors
    border: {
      light: '#e5e7eb',        // Light borders
      medium: '#d1d5db',       // Medium borders
      dark: '#9ca3af',         // Dark borders
      focus: '#3b82f6',        // Focus borders
      error: '#ef4444',        // Error borders
    },
  },
  
  // Typography System (based on your input fields and buttons)
  typography: {
    fontFamily: {
      primary: 'System',
      secondary: 'System',
    },
    fontSize: {
      xs: 12,      // Caption text
      sm: 14,      // Small text
      base: 16,    // Body text
      lg: 18,      // Large text
      xl: 20,      // Subheadings
      '2xl': 24,   // Headings
      '3xl': 30,   // Large headings
      '4xl': 36,   // Hero text
    },
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing System (based on your component layouts)
  spacing: {
    xs: 4,       // Micro spacing
    sm: 8,       // Small spacing
    md: 16,      // Medium spacing
    lg: 24,      // Large spacing
    xl: 32,      // Extra large spacing
    '2xl': 40,   // 2X large spacing
    '3xl': 48,   // 3X large spacing
    '4xl': 64,   // 4X large spacing
  },
  
  // Border Radius (from your design components)
  borderRadius: {
    none: 0,
    sm: 4,       // Small radius (buttons, inputs)
    md: 8,       // Medium radius (cards)
    lg: 12,      // Large radius
    xl: 16,      // Extra large radius
    full: 9999,  // Fully rounded
  },
  
  // Shadows (for depth and elevation)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 8,
    },
  },
  
  // Component Variants (based on your design system)
  components: {
    button: {
      variants: {
        primary: {
          backgroundColor: '#2D6E92',
          color: '#ffffff',
          borderColor: '#3b82f6',
        },
        secondary: {
          backgroundColor: 'transparent',
          color: '#3b82f6',
          borderColor: '#3b82f6',
        },
        ghost: {
          backgroundColor: 'transparent',
          color: '#6b7280',
          borderColor: 'transparent',
        },
      },
      sizes: {
        sm: { height: 36, paddingHorizontal: 16, fontSize: 14 },
        md: { height: 44, paddingHorizontal: 20, fontSize: 16 },
        lg: { height: 56, paddingHorizontal: 24, fontSize: 18 },
      },
    },
    
    input: {
      variants: {
        default: {
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          color: '#111827',
        },
        focus: {
          backgroundColor: '#ffffff',
          borderColor: '#3b82f6',
          color: '#111827',
        },
        error: {
          backgroundColor: '#ffffff',
          borderColor: '#ef4444',
          color: '#111827',
        },
      },
      sizes: {
        sm: { height: 36, paddingHorizontal: 12, fontSize: 14 },
        md: { height: 54, paddingHorizontal: 16, fontSize: 16 },
        lg: { height: 52, paddingHorizontal: 20, fontSize: 18 },
      },
    },
    
    card: {
      variants: {
        elevated: {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          padding: 16,
        },
        outlined: {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          borderRadius: 8,
          padding: 16,
        },
      },
    },
  },
};