import React, { createContext, useContext, useState, useEffect } from 'react';

export type ExecutiveTheme = 'obsidian' | 'titanium' | 'sapphire';

export interface ThemeConfig {
  name: string;
  tagline: string;
  description: string;
  canvasBg: string;
  panelBg: string;
  panelBorder: string;
  cardBg: string;
  cardHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentColor: string;
  accentHover: string;
  accentText: string;
  accentBgSubtle: string;
  accentBorder: string;
  inputBg: string;
  navActiveBg: string;
  navActiveText: string;
  navInactiveText: string;
}

interface ThemeContextType {
  theme: ExecutiveTheme;
  setTheme: (theme: ExecutiveTheme) => void;
  themeConfig: ThemeConfig;
}

export const THEME_CONFIGS: Record<ExecutiveTheme, ThemeConfig> = {
  obsidian: {
    name: 'Obsidian Executive',
    tagline: 'Executive Night',
    description: 'Deep nocturnal architectural slate with warm brushed brass and amber accents',
    canvasBg: 'bg-[#090D16]',
    panelBg: 'bg-[#101726]',
    panelBorder: 'border-slate-800/80',
    cardBg: 'bg-[#131B2E]',
    cardHover: 'hover:bg-[#17223B]',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-500',
    accentColor: 'bg-amber-600',
    accentHover: 'hover:bg-amber-500',
    accentText: 'text-amber-400',
    accentBgSubtle: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    inputBg: 'bg-[#0A0F1D]',
    navActiveBg: 'bg-amber-500/15',
    navActiveText: 'text-amber-300',
    navInactiveText: 'text-slate-400 hover:text-slate-200',
  },
  titanium: {
    name: 'Oxford Boardroom',
    tagline: 'Architectural Light',
    description: 'Crisp daylight porcelain with Oxford graphite precision and warm cognac accents',
    canvasBg: 'bg-[#F8FAFC]',
    panelBg: 'bg-[#FFFFFF]',
    panelBorder: 'border-slate-200',
    cardBg: 'bg-[#FFFFFF]',
    cardHover: 'hover:bg-slate-50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-400',
    accentColor: 'bg-slate-900',
    accentHover: 'hover:bg-slate-800',
    accentText: 'text-amber-800',
    accentBgSubtle: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    inputBg: 'bg-slate-50',
    navActiveBg: 'bg-slate-900',
    navActiveText: 'text-white',
    navInactiveText: 'text-slate-600 hover:text-slate-900',
  },
  sapphire: {
    name: 'Silicon Vanguard',
    tagline: 'Midnight Navy',
    description: 'High-altitude corporate aerospace navy with ice-platinum and electric technical accents',
    canvasBg: 'bg-[#060B18]',
    panelBg: 'bg-[#0C152E]',
    panelBorder: 'border-sky-900/40',
    cardBg: 'bg-[#0F1B3B]',
    cardHover: 'hover:bg-[#14234C]',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    accentColor: 'bg-sky-600',
    accentHover: 'hover:bg-sky-500',
    accentText: 'text-sky-400',
    accentBgSubtle: 'bg-sky-500/10',
    accentBorder: 'border-sky-500/30',
    inputBg: 'bg-[#080E21]',
    navActiveBg: 'bg-sky-500/15',
    navActiveText: 'text-sky-300',
    navInactiveText: 'text-slate-400 hover:text-slate-200',
  },
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'obsidian',
  setTheme: () => {},
  themeConfig: THEME_CONFIGS.obsidian,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ExecutiveTheme>(() => {
    try {
      const saved = localStorage.getItem('execascent_theme');
      if (saved === 'titanium' || saved === 'sapphire' || saved === 'obsidian') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'obsidian';
  });

  const setTheme = (newTheme: ExecutiveTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('execascent_theme', newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-obsidian', 'theme-titanium', 'theme-sapphire');
    root.classList.add(`theme-${theme}`);
    if (theme === 'titanium') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig: THEME_CONFIGS[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useExecutiveTheme = () => useContext(ThemeContext);
