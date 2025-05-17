export const themeConfig = {
  light: {
    // Main colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#FAFAFA',
    },
    foreground: {
      primary: '#212121',
      secondary: '#424242',
      tertiary: '#616161',
      muted: '#757575',
    },
    // Brand colors
    primary: {
      main: '#6D4AFF', // Brand primary
      hover: '#5B3FD9',
      foreground: '#FFFFFF',
    },
    secondary: {
      main: '#FF9D4A', // Brand secondary
      hover: '#F08C3E',
      foreground: '#FFFFFF',
    },
    // UI colors
    surface: {
      main: '#FFFFFF',
      elevated: '#FFFFFF',
      foreground: '#212121',
    },
    border: {
      main: 'rgba(0, 0, 0, 0.12)',
      focus: '#6D4AFF',
    },
    // Feedback colors
    success: {
      main: '#4CAF50',
      light: '#E8F5E9',
      foreground: '#FFFFFF',
    },
    error: {
      main: '#F44336',
      light: '#FFEBEE',
      foreground: '#FFFFFF',
    },
    warning: {
      main: '#FF9800',
      light: '#FFF3E0',
      foreground: '#FFFFFF',
    },
    info: {
      main: '#2196F3',
      light: '#E3F2FD',
      foreground: '#FFFFFF',
    },
  },
  dark: {
    // Main colors
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#282828',
    },
    foreground: {
      primary: '#E0E0E0',
      secondary: '#BDBDBD',
      tertiary: '#9E9E9E',
      muted: '#757575',
    },
    // Brand colors
    primary: {
      main: '#8E6CFF', // Brand primary (slightly lighter for dark mode)
      hover: '#9F7DFF',
      foreground: '#FFFFFF',
    },
    secondary: {
      main: '#FFAE5A', // Brand secondary (slightly lighter for dark mode)
      hover: '#FFBD6F',
      foreground: '#121212',
    },
    // UI colors
    surface: {
      main: '#1E1E1E',
      elevated: '#282828',
      foreground: '#E0E0E0',
    },
    border: {
      main: 'rgba(255, 255, 255, 0.12)',
      focus: '#8E6CFF',
    },
    // Feedback colors
    success: {
      main: '#66BB6A',
      light: '#1B3320',
      foreground: '#FFFFFF',
    },
    error: {
      main: '#EF5350',
      light: '#321B1B',
      foreground: '#FFFFFF',
    },
    warning: {
      main: '#FFA726',
      light: '#322A1B',
      foreground: '#FFFFFF',
    },
    info: {
      main: '#42A5F5',
      light: '#1B2832',
      foreground: '#FFFFFF',
    },
  },
  // Shared values
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  typography: {
    fontFamily: {
      sans: "'Inter', sans-serif",
      serif: "'Playfair Display', serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  breakpoints: {
    mobile: '320px',
    mobileLg: '480px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    desktopLg: '1440px',
  },
  transitions: {
    default: '0.3s ease',
    fast: '0.15s ease',
    slow: '0.5s ease',
  },
};

// Helper function to get color with proper contrast
export const getContrastColor = (bgColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance (4.5:1 contrast ratio)
  return luminance > 0.5 ? '#212121' : '#FFFFFF';
};

// Helper to check contrast ratio
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hexColor: string) => {
    const rgb = hexColor.slice(1).match(/.{2}/g)!.map(x => parseInt(x, 16) / 255);
    const [r, g, b] = rgb.map(val => {
      val = val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      return val;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
