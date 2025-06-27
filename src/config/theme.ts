/**
 * theme.ts - Untitled UI Theme Configuration
 * 
 * Configures the Untitled UI design system for upVoice.
 * Provides consistent, professional styling across
 * the entire application.
 * 
 * Customizations:
 * - Brand colors
 * - Typography scale
 * - Spacing system
 * - Component variants
 * - Animation settings
 * 
 * Design principles:
 * - Clean and professional
 * - Mobile-optimized
 * - Accessible (WCAG AA)
 * - Performance-focused
 * 
 * Related files:
 * - main.tsx: Theme provider setup
 * - styles/global.css: Global overrides
 * - components/*: Component usage
 */

import { createTheme } from '@untitled-ui/react'

// Brand colors
const colors = {
  // Primary - Professional blue
  primary: {
    25: '#F5FAFF',
    50: '#EFF8FF',
    100: '#D1E9FF',
    200: '#B2DDFF',
    300: '#84CAFF',
    400: '#53B1FD',
    500: '#2E90FA', // Main brand color
    600: '#1570EF',
    700: '#175CD3',
    800: '#1849A9',
    900: '#194185',
  },
  
  // Gray scale - Neutral UI
  gray: {
    25: '#FCFCFD',
    50: '#F9FAFB',
    100: '#F2F4F7',
    200: '#EAECF0',
    300: '#D0D5DD',
    400: '#98A2B3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1D2939',
    900: '#101828',
  },
  
  // Semantic colors
  success: {
    500: '#12B76A',
  },
  warning: {
    500: '#F79009',
  },
  error: {
    500: '#F04438',
  },
}

// Typography configuration
const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: 'SF Mono, Monaco, Consolas, monospace',
  },
  
  // Type scale
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

// Spacing system (4px base unit)
const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
}

// Border radius
const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  full: '9999px',
}

// Shadows
const shadows = {
  xs: '0px 1px 2px rgba(16, 24, 40, 0.05)',
  sm: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
  md: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
  lg: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  xl: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
}

// Animation settings
const animation = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

// Create and export theme
export const theme = createTheme({
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  
  // Component overrides
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        variant: 'primary',
      },
    },
    Input: {
      defaultProps: {
        size: 'md',
      },
    },
  },
})

// Export individual values for use in CSS-in-JS
export { colors, typography, spacing, borderRadius, shadows, animation }