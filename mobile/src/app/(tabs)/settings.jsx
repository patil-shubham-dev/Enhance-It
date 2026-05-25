import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Zap,
  Trash2,
  ChevronRight,
  Info,
  Cpu,
  Sparkles,
  MessageSquare,
  Briefcase,
  BookOpen,
  Palette,
  MessageCircle,
  Mail,
  Bot,
  FileText,
  ClipboardPaste,
  Moon,
  Sun,
} from "lucide-react-native";
import { useTheme } from "@/utils/theme";

const TONE_STORAGE_KEY = "enhance_default_tone";

const TONES = [
  {
    id: "auto",
    label: "Auto",
    subtitle: "AI selects the best tone",
    icon: Sparkles,
  },
  {
    id: "casual",
    label: "Casual",
    subtitle: "Warm and conversational",
    icon: MessageSquare,
  },
  {
    id: "professional",
    label: "Professional",
    subtitle: "Formal and polished",
    icon: Briefcase,
  },
  {
    id: "concise",
    label: "Concise",
    subtitle: "Short and to the point",
    icon: Zap,
  },
  {
    id: "detailed",
    label: "Detailed",
    subtitle: "Thorough and comprehensive",
    icon: BookOpen,
  },
  {
    id: "creative",
    label: "Creative",
    subtitle: "Expressive and engaging",
    icon: Palette,
  },
];

const CONTEXTS = [
  {
    icon: MessageCircle,
    label: "Message",
    desc: "Casual texts, chats, and short messages",
    color: "#10B981",
  },
  {
    icon: Mail,
    label: "Email",
    desc: "Structured with subject, greeting, and sign-off",
    color: "#3B82F6",
  },
  {
    icon: Bot,
    label: "AI Prompt",
    desc: "Engineer-grade instructions for AI systems",
    color: "#8B5CF6",
  },
  {
    icon: FileText,
    label: "General",
    desc: "Blog posts, notes, and long-form writing",
    color: "#F59E0B",
  },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggle } = useTheme();
  const [defaultTone, setDefaultTone] = useState("auto");

  useEffect(() => {
    AsyncStorage.getItem(TONE_STORAGE_KEY)
      .then((val) => {
        if (val) setDefaultTone(val);
      })
      .catch(() => {});
  }, []);

  const handleToneSelect = (id) => {
    setDefaultTone(id);
    AsyncStorage.setItem(TONE_STORAGE_KEY, id);
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "This will permanently delete all your enhancement history. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch("/api/history", { method: "DELETE" });
              Alert.alert("Cleared", "Your history has been removed.");
            } catch (err) {
              console.error(err);
              Alert.alert(
                "Error",
                "Could not clear history. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const SectionHeader = ({ title }) => (
    <Text
      style={{
        color: colors.textFaint,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1.4,
        textTransform: "uppercase",
        marginBottom: 12,
        paddingHorizontal: 24,
      }}
    >
      {title}
    </Text>
  );

  const Card = ({ children }) => (
    <View
      style={{
        marginHorizontal: 24,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 24,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderColor: colors.divider,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 24,
            fontWeight: "700",
            letterSpacing: -0.8,
          }}
        >
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 32,
          paddingBottom: insets.bottom + 100,
          gap: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance — Dark / Light Toggle */}
        <View>
          <SectionHeader title="Appearance" />
          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 18,
                paddingVertical: 16,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: isDark ? "#1C1207" : "#FEF3C7",
                  borderWidth: 1,
                  borderColor: isDark ? "#F59E0B20" : "#FDE68A",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                {isDark ? (
                  <Moon size={15} color="#F59E0B" />
                ) : (
                  <Sun size={15} color="#F59E0B" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontWeight: "500",
                    marginBottom: 2,
                  }}
                >
                  {isDark ? "Dark Mode" : "Light Mode"}
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                  {isDark
                    ? "Tap to switch to light theme"
                    : "Tap to switch to dark theme"}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggle}
                trackColor={{
                  false: colors.border,
                  true: colors.accent + "50",
                }}
                thumbColor={isDark ? colors.accent : colors.textGhost}
              />
            </View>
          </Card>
        </View>

        {/* Default Tone — persisted with AsyncStorage */}
        <View>
          <SectionHeader title="Default Tone" />
          <Card>
            {TONES.map((tone, index) => {
              const isSel = defaultTone === tone.id;
              const ToneIcon = tone.icon;
              return (
                <TouchableOpacity
                  key={tone.id}
                  onPress={() => handleToneSelect(tone.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingVertical: 15,
                    borderBottomWidth: index < TONES.length - 1 ? 1 : 0,
                    borderColor: colors.divider,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: isSel ? colors.accentBg : colors.inputBg,
                      borderWidth: 1,
                      borderColor: isSel
                        ? colors.accentBorder
                        : colors.inputBorderIdle,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <ToneIcon
                      size={15}
                      color={isSel ? colors.accentText : colors.textGhost}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: isSel ? colors.accentTextSoft : colors.textMuted,
                        fontSize: 14,
                        fontWeight: isSel ? "600" : "400",
                        marginBottom: 2,
                      }}
                    >
                      {tone.label}
                    </Text>
                    <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                      {tone.subtitle}
                    </Text>
                  </View>
                  {isSel && (
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: colors.accent,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </Card>
        </View>

        {/* Clipboard Enhancement Guide */}
        <View>
          <SectionHeader title="Clipboard Enhancement" />
          <Card>
            <View style={{ padding: 18, gap: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: colors.accentBg,
                    borderWidth: 1,
                    borderColor: colors.accentBorder,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ClipboardPaste size={16} color={colors.accentText} />
                </View>
                <Text
                  style={{
                    color: colors.textDim,
                    fontSize: 13,
                    lineHeight: 20,
                    flex: 1,
                  }}
                >
                  Copy text from any app, then open Enhance It. A banner detects
                  your clipboard automatically.
                </Text>
              </View>
              {[
                "Select and copy text in any app",
                "Open Enhance It",
                "Tap the Paste banner that appears",
                "Choose your tone and enhance",
              ].map((step, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.inputBg,
                      borderWidth: 1,
                      borderColor: colors.inputBorderIdle,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textGhost,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Context Detection Guide */}
        <View>
          <SectionHeader title="Context Detection" />
          <Card>
            {CONTEXTS.map((ctx, index) => {
              const CtxIcon = ctx.icon;
              return (
                <View
                  key={ctx.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingVertical: 15,
                    gap: 14,
                    borderBottomWidth: index < CONTEXTS.length - 1 ? 1 : 0,
                    borderColor: colors.divider,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: ctx.color + "12",
                      borderWidth: 1,
                      borderColor: ctx.color + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CtxIcon size={15} color={ctx.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: ctx.color,
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 3,
                      }}
                    >
                      {ctx.label}
                    </Text>
                    <Text
                      style={{
                        color: colors.textFaint,
                        fontSize: 12,
                        lineHeight: 18,
                      }}
                    >
                      {ctx.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Data */}
        <View>
          <SectionHeader title="Data" />
          <Card>
            <TouchableOpacity
              onPress={handleClearHistory}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 18,
                paddingVertical: 16,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: colors.errorBg,
                  borderWidth: 1,
                  borderColor: colors.errorBorder,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Trash2 size={15} color={colors.errorText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.errorText,
                    fontSize: 14,
                    fontWeight: "500",
                    marginBottom: 2,
                  }}
                >
                  Clear History
                </Text>
                <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                  Permanently remove all enhancements
                </Text>
              </View>
              <ChevronRight size={16} color={colors.textFaint} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* About */}
        <View>
          <SectionHeader title="About" />
          <Card>
            {[
              { icon: Zap, label: "Version", value: "1.0.0", color: "#3B82F6" },
              {
                icon: Cpu,
                label: "AI Engine",
                value: "Gemini 2.5 Flash",
                color: "#8B5CF6",
              },
              {
                icon: Info,
                label: "Context Types",
                value: "4",
                color: "#F59E0B",
              },
            ].map(({ icon: Icon, label, value, color }, index, arr) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 18,
                  paddingVertical: 15,
                  borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                  borderColor: colors.divider,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: color + "12",
                    borderWidth: 1,
                    borderColor: color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={15} color={color} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: colors.textMuted,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {label}
                </Text>
                <Text style={{ color: colors.textGhost, fontSize: 13 }}>
                  {value}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
