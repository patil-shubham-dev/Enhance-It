import { useAuth } from "@/utils/auth/useAuth";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@/utils/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const [onboarded, setOnboarded] = useState(null); // null = loading

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    AsyncStorage.getItem("enhance_onboarded")
      .then((val) => setOnboarded(val === "true"))
      .catch(() => setOnboarded(true));
  }, []);

  useEffect(() => {
    if (isReady && onboarded !== null) {
      SplashScreen.hideAsync();
    }
  }, [isReady, onboarded]);

  if (!isReady || onboarded === null) return null;

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName={onboarded ? "(tabs)" : "onboarding"}
          >
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
