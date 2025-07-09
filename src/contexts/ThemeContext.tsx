import { createContext, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  getThemeClasses: () => {
    gradient: string;
    primary: string;
    border: string;
    background: string;
    text: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS = {
  blue: {
    primary: '217 91% 60%',
    secondary: '221 83% 53%',
    gradient: 'gradient-theme-blue'
  },
  green: {
    primary: '142 76% 36%',
    secondary: '158 64% 52%',
    gradient: 'gradient-theme-green'
  },
  purple: {
    primary: '262 83% 58%',
    secondary: '263 70% 50%',
    gradient: 'gradient-theme-purple'
  },
  orange: {
    primary: '32 95% 44%',
    secondary: '25 95% 53%',
    gradient: 'gradient-theme-orange'
  },
  pink: {
    primary: '330 81% 60%',
    secondary: '340 82% 52%',
    gradient: 'gradient-theme-pink'
  },
  teal: {
    primary: '173 58% 39%',
    secondary: '175 60% 50%',
    gradient: 'gradient-theme-teal'
  },
  red: {
    primary: '0 84% 60%',
    secondary: '0 72% 51%',
    gradient: 'gradient-theme-red'
  },
  indigo: {
    primary: '231 48% 48%',
    secondary: '243 75% 59%',
    gradient: 'gradient-theme-indigo'
  }
};

interface ThemeProviderProps {
  children: ReactNode;
  themeColor?: string;
}

export const ThemeProvider = ({ children, themeColor = 'blue' }: ThemeProviderProps) => {
  const setThemeColor = (color: string) => {
    // Update CSS custom properties
    const theme = THEME_COLORS[color as keyof typeof THEME_COLORS] || THEME_COLORS.blue;
    
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-gradient', theme.gradient);
    
    // Also update the primary color to match the theme
    document.documentElement.style.setProperty('--primary', theme.primary);
  };

  const getThemeClasses = () => {
    const theme = THEME_COLORS[themeColor as keyof typeof THEME_COLORS] || THEME_COLORS.blue;
    
    return {
      gradient: theme.gradient,
      primary: `hsl(${theme.primary})`,
      border: `hsl(${theme.primary} / 0.2)`,
      background: `hsl(${theme.primary} / 0.05)`,
      text: `hsl(${theme.primary})`
    };
  };

  useEffect(() => {
    setThemeColor(themeColor);
  }, [themeColor]);

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        setThemeColor,
        getThemeClasses
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility function to get theme-aware classes
export const getThemeClasses = (themeColor: string) => {
  const theme = THEME_COLORS[themeColor as keyof typeof THEME_COLORS] || THEME_COLORS.blue;
  
  return {
    gradient: theme.gradient,
    primary: `text-[hsl(${theme.primary})]`,
    borderPrimary: `border-[hsl(${theme.primary}/0.2)]`,
    bgPrimary: `bg-[hsl(${theme.primary}/0.05)]`,
    bgPrimaryHover: `hover:bg-[hsl(${theme.primary}/0.1)]`,
    shadowPrimary: `shadow-[0_0_20px_hsl(${theme.primary}/0.1)]`,
    ringPrimary: `ring-[hsl(${theme.primary})]`
  };
};