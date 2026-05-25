import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ClipboardPaste,
  MessageCircle,
  Mail,
  Bot,
  FileText,
  Sparkles,
  Briefcase,
  Zap,
  BookOpen,
  Palette,
  MessageSquare,
  ArrowRight,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    key: "clipboard",
    icon: ClipboardPaste,
    iconColor: "#3B82F6",
    iconBg: "#0F1629",
    iconBorder: "#1E3A6E",
    title: "Enhance from anywhere",
    subtitle:
      "Copy text in any app — WhatsApp, Gmail, Safari, Notes — then open Enhance It. A smart banner detects your clipboard and lets you paste with one tap.",
    steps: [
      "Copy text in any app",
      "Switch to Enhance It",
      "Tap the Paste banner",
      "Enhance and copy back",
    ],
  },
  {
    key: "context",
    icon: Zap,
    iconColor: "#8B5CF6",
    iconBg: "#130B24",
    iconBorder: "#4C1D9520",
    title: "Knows what you're writing",
    subtitle:
      "The AI automatically detects the type of your text and applies the right format — no manual selection needed.",
    contexts: [
      {
        icon: MessageCircle,
        label: "Message",
        desc: "Warm and conversational",
        color: "#10B981",
      },
      {
        icon: Mail,
        label: "Email",
        desc: "Subject + full structure",
        color: "#3B82F6",
      },
      {
        icon: Bot,
        label: "AI Prompt",
        desc: "Engineer-grade instructions",
        color: "#8B5CF6",
      },
      {
        icon: FileText,
        label: "General",
        desc: "Clarity and flow",
        color: "#F59E0B",
      },
    ],
  },
  {
    key: "tone",
    icon: Sparkles,
    iconColor: "#F59E0B",
    iconBg: "#1C1207",
    iconBorder: "#92400E20",
    title: "Your tone, your words",
    subtitle:
      "Pick a tone or let the AI decide. Enhance It preserves your intent while making every word count.",
    tones: [
      { icon: Sparkles, label: "Auto", color: "#F59E0B" },
      { icon: MessageSquare, label: "Casual", color: "#10B981" },
      { icon: Briefcase, label: "Professional", color: "#3B82F6" },
      { icon: Zap, label: "Concise", color: "#EF4444" },
      { icon: BookOpen, label: "Detailed", color: "#8B5CF6" },
      { icon: Palette, label: "Creative", color: "#EC4899" },
    ],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const animateProgress = (toIndex) => {
    Animated.timing(progressAnim, {
      toValue: toIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
      animateProgress(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
      animateProgress(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("enhance_onboarded", "true");
    } catch (_) {}
    router.replace("/(tabs)");
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: "#080808" }}>
      <StatusBar style="light" />

      {/* Skip */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 24,
          zIndex: 10,
        }}
      >
        {!isLast && (
          <TouchableOpacity onPress={handleGetStarted}>
            <Text style={{ color: "#374151", fontSize: 14, fontWeight: "500" }}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, idx) => {
          const SlideIcon = slide.icon;
          return (
            <View
              key={slide.key}
              style={{
                width,
                flex: 1,
                paddingTop: insets.top + 60,
                paddingHorizontal: 28,
                paddingBottom: insets.bottom + 140,
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  backgroundColor: slide.iconBg,
                  borderWidth: 1,
                  borderColor: slide.iconBorder,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 36,
                }}
              >
                <SlideIcon size={34} color={slide.iconColor} />
              </View>

              {/* Title */}
              <Text
                style={{
                  color: "#F1F5F9",
                  fontSize: 28,
                  fontWeight: "700",
                  letterSpacing: -0.8,
                  marginBottom: 14,
                  lineHeight: 36,
                }}
              >
                {slide.title}
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  color: "#4B5563",
                  fontSize: 15,
                  lineHeight: 25,
                  marginBottom: 36,
                }}
              >
                {slide.subtitle}
              </Text>

              {/* Slide 1: Steps */}
              {slide.steps && (
                <View style={{ gap: 14 }}>
                  {slide.steps.map((step, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: "#0F1629",
                          borderWidth: 1,
                          borderColor: "#1E3A6E",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#60A5FA",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          {i + 1}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Slide 2: Context cards */}
              {slide.contexts && (
                <View style={{ gap: 10 }}>
                  {slide.contexts.map((ctx) => {
                    const CtxIcon = ctx.icon;
                    return (
                      <View
                        key={ctx.label}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 14,
                          backgroundColor: "#0D0F14",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#111318",
                          paddingHorizontal: 16,
                          paddingVertical: 13,
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            backgroundColor: ctx.color + "15",
                            borderWidth: 1,
                            borderColor: ctx.color + "25",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CtxIcon size={15} color={ctx.color} />
                        </View>
                        <View>
                          <Text
                            style={{
                              color: ctx.color,
                              fontSize: 13,
                              fontWeight: "600",
                              marginBottom: 2,
                            }}
                          >
                            {ctx.label}
                          </Text>
                          <Text style={{ color: "#2D3748", fontSize: 12 }}>
                            {ctx.desc}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Slide 3: Tone chips */}
              {slide.tones && (
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {slide.tones.map((t) => {
                    const ToneIcon = t.icon;
                    return (
                      <View
                        key={t.label}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 7,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          backgroundColor: "#0D0F14",
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: "#111318",
                        }}
                      >
                        <ToneIcon size={13} color={t.color} />
                        <Text
                          style={{
                            color: "#4B5563",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          {t.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom — dots + button */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 36,
          left: 28,
          right: 28,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Dots */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                height: 6,
                width: activeIndex === i ? 22 : 6,
                borderRadius: 3,
                backgroundColor: activeIndex === i ? "#3B82F6" : "#1E2330",
              }}
            />
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#0F1629",
            borderRadius: 14,
            paddingHorizontal: 22,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "#2563EB",
          }}
        >
          <Text style={{ color: "#93C5FD", fontSize: 15, fontWeight: "600" }}>
            {isLast ? "Get Started" : "Next"}
          </Text>
          <ArrowRight size={16} color="#93C5FD" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
