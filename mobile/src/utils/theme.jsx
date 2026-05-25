import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "enhance_theme";

export const dark = {
  isDark: true,
  bg: "#080808",
  card: "#0D0F14",
  cardBorder: "#111318",
  border: "#1E2330",
  textPrimary: "#F1F5F9",
  textSecondary: "#CBD5E1",
  textMuted: "#6B7280",
  textDim: "#374151",
  textGhost: "#2D3748",
  textFaint: "#1E2330",
  accent: "#3B82F6",
  accentBg: "#0F1629",
  accentBorder: "#1E3A6E",
  accentText: "#60A5FA",
  accentTextSoft: "#93C5FD",
  inputBg: "#0D0F14",
  inputBorderIdle: "#111318",
  inputBorderActive: "#1E2330",
  successBg: "#071A12",
  successBorder: "#10B98125",
  successText: "#10B981",
  errorBg: "#150A0A",
  errorBorder: "#2D1010",
  errorText: "#EF4444",
  placeholder: "#1E2330",
  tabBg: "#080808",
  tabBorder: "#111318",
  tabActive: "#3B82F6",
  tabInactive: "#1E2330",
  divider: "#111318",
  skeletonBase: "#0D0F14",
  skeletonHighlight: "#111318",
};

export const light = {
  isDark: false,
  bg: "#F8FAFC",
  card: "#FFFFFF",
  cardBorder: "#F1F5F9",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#1E293B",
  textMuted: "#475569",
  textDim: "#64748B",
  textGhost: "#94A3B8",
  textFaint: "#CBD5E1",
  accent: "#2563EB",
  accentBg: "#EFF6FF",
  accentBorder: "#BFDBFE",
  accentText: "#2563EB",
  accentTextSoft: "#1D4ED8",
  inputBg: "#FFFFFF",
  inputBorderIdle: "#F1F5F9",
  inputBorderActive: "#E2E8F0",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#16A34A",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  errorText: "#DC2626",
  placeholder: "#CBD5E1",
  tabBg: "#FFFFFF",
  tabBorder: "#F1F5F9",
  tabActive: "#2563EB",
  tabInactive: "#94A3B8",
  divider: "#F1F5F9",
  skeletonBase: "#F1F5F9",
  skeletonHighlight: "#E2E8F0",
};

const ThemeContext = createContext({
  colors: dark,
  isDark: true,
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val !== null) setIsDark(val === "dark");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider
      value={{ colors: isDark ? dark : light, isDark, toggle }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
