import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Clock,
  Trash2,
  Copy,
  CheckCircle,
  MessageCircle,
  Mail,
  Bot,
  FileText,
  Search,
  X,
} from "lucide-react-native";
import { MotiView } from "moti";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useTheme } from "@/utils/theme";
import { enhanceEvents } from "@/utils/enhanceEvents";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const CONTEXT_CONFIG = {
  MESSAGE: { icon: MessageCircle, label: "Message", color: "#10B981" },
  EMAIL: { icon: Mail, label: "Email", color: "#3B82F6" },
  AI_PROMPT: { icon: Bot, label: "AI Prompt", color: "#8B5CF6" },
  GENERAL: { icon: FileText, label: "General", color: "#F59E0B" },
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function SkeletonCard({ colors }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmer]);
  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });
  return (
    <Animated.View
      style={{
        opacity,
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 16,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View
          style={{
            width: 80,
            height: 12,
            backgroundColor: colors.skeletonHighlight,
            borderRadius: 6,
          }}
        />
        <View
          style={{
            width: 50,
            height: 12,
            backgroundColor: colors.skeletonHighlight,
            borderRadius: 6,
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          height: 12,
          backgroundColor: colors.skeletonHighlight,
          borderRadius: 6,
        }}
      />
      <View
        style={{
          width: "80%",
          height: 12,
          backgroundColor: colors.skeletonHighlight,
          borderRadius: 6,
        }}
      />
      <View
        style={{
          width: "60%",
          height: 12,
          backgroundColor: colors.skeletonHighlight,
          borderRadius: 6,
        }}
      />
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory]),
  );

  // Auto-refresh when a new enhancement is saved from the Enhance tab
  useEffect(() => {
    return enhanceEvents.on(fetchHistory);
  }, [fetchHistory]);

  const handleDelete = (id) => {
    Alert.alert("Delete Enhancement", "Remove this from your history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`/api/history?id=${id}`, { method: "DELETE" });
            setHistory((prev) => prev.filter((item) => item.id !== id));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All History",
      "This will permanently delete all your enhancements.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch("/api/history", { method: "DELETE" });
              setHistory([]);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } catch (err) {
              console.error(err);
            }
          },
        },
      ],
    );
  };

  const handleCopy = async (item) => {
    const text = item.subject_line
      ? `Subject: ${item.subject_line}\n\n${item.enhanced_text}`
      : item.enhanced_text;
    await Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const filtered = query.trim()
    ? history.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.enhanced_text?.toLowerCase().includes(q) ||
          item.original_text?.toLowerCase().includes(q) ||
          item.subject_line?.toLowerCase().includes(q) ||
          item.detected_context?.toLowerCase().includes(q)
        );
      })
    : history;

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderColor: colors.divider,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 24,
                fontWeight: "700",
                letterSpacing: -0.8,
              }}
            >
              History
            </Text>
            {history.length > 0 && (
              <View
                style={{
                  backgroundColor: colors.inputBg,
                  borderRadius: 999,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: colors.inputBorderIdle,
                }}
              >
                <Text
                  style={{
                    color: colors.textGhost,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {history.length}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity
              onPress={() => {
                setShowSearch((v) => !v);
                setQuery("");
              }}
            >
              <Search
                size={20}
                color={showSearch ? colors.accent : colors.textGhost}
              />
            </TouchableOpacity>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text
                  style={{
                    color: colors.textGhost,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  Clear all
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <MotiView
            from={{ opacity: 0, translateY: -6 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 200 }}
            style={{ marginTop: 14 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.inputBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.inputBorderActive,
                paddingHorizontal: 14,
                paddingVertical: 10,
                gap: 10,
              }}
            >
              <Search size={15} color={colors.textGhost} />
              <TextInput
                autoFocus
                placeholder="Search enhancements..."
                placeholderTextColor={colors.placeholder}
                value={query}
                onChangeText={setQuery}
                style={{ flex: 1, color: colors.textPrimary, fontSize: 14 }}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <X size={15} color={colors.textGhost} />
                </TouchableOpacity>
              )}
            </View>
          </MotiView>
        )}
      </View>

      {/* Content */}
      {loading ? (
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            gap: 12,
            paddingBottom: insets.bottom + 100,
          }}
        >
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} colors={colors} />
          ))}
        </ScrollView>
      ) : filtered.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 48,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: colors.card,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.cardBorder,
              marginBottom: 20,
            }}
          >
            {query ? (
              <Search size={26} color={colors.textFaint} />
            ) : (
              <Clock size={26} color={colors.textFaint} />
            )}
          </View>
          <Text
            style={{
              color: colors.textDim,
              fontSize: 17,
              fontWeight: "600",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {query ? "No results found" : "No enhancements yet"}
          </Text>
          <Text
            style={{
              color: colors.textFaint,
              fontSize: 14,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {query
              ? `Nothing matched "${query}"`
              : "Every text you enhance will be saved here"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 24,
            gap: 12,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((item, index) => {
            const ctx =
              CONTEXT_CONFIG[item.detected_context] || CONTEXT_CONFIG.GENERAL;
            const CtxIcon = ctx.icon;
            const isCopied = copiedId === item.id;

            return (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  duration: 260,
                  delay: index * 25,
                }}
              >
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    overflow: "hidden",
                  }}
                >
                  {/* Row header */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderColor: colors.divider,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <CtxIcon size={13} color={ctx.color} />
                      <Text
                        style={{
                          color: ctx.color,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {ctx.label}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textFaint, fontSize: 11 }}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>

                  {/* Subject */}
                  {item.subject_line && (
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingTop: 14,
                        paddingBottom: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.textFaint,
                          fontSize: 10,
                          fontWeight: "700",
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                          marginBottom: 5,
                        }}
                      >
                        Subject
                      </Text>
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 14,
                          fontWeight: "600",
                        }}
                        numberOfLines={1}
                      >
                        {item.subject_line}
                      </Text>
                    </View>
                  )}

                  {/* Preview */}
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingTop: item.subject_line ? 10 : 14,
                      paddingBottom: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textDim,
                        fontSize: 14,
                        lineHeight: 22,
                      }}
                      numberOfLines={3}
                    >
                      {item.enhanced_text}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      paddingHorizontal: 14,
                      paddingBottom: 14,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleCopy(item)}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        backgroundColor: isCopied
                          ? colors.successBg
                          : colors.inputBg,
                        borderRadius: 10,
                        paddingVertical: 11,
                        borderWidth: 1,
                        borderColor: isCopied
                          ? colors.successBorder
                          : colors.inputBorderIdle,
                      }}
                    >
                      {isCopied ? (
                        <CheckCircle size={14} color={colors.successText} />
                      ) : (
                        <Copy size={14} color={colors.textGhost} />
                      )}
                      <Text
                        style={{
                          color: isCopied
                            ? colors.successText
                            : colors.textGhost,
                          fontSize: 13,
                          fontWeight: "500",
                        }}
                      >
                        {isCopied ? "Copied" : "Copy"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      activeOpacity={0.8}
                      style={{
                        width: 42,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.inputBg,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.inputBorderIdle,
                      }}
                    >
                      <Trash2 size={14} color={colors.textGhost} />
                    </TouchableOpacity>
                  </View>
                </View>
              </MotiView>
            );
          })}
        </ScrollView>
      )}
    </KeyboardAvoidingAnimatedView>
  );
}
