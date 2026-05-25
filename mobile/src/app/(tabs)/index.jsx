import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  AppState,
  Animated,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Zap,
  Copy,
  RotateCcw,
  CheckCircle,
  MessageCircle,
  Mail,
  Bot,
  FileText,
  Sparkles,
  MessageSquare,
  Briefcase,
  BookOpen,
  Palette,
  ClipboardPaste,
  X,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Share2,
  RefreshCcw,
} from "lucide-react-native";
import { MotiView } from "moti";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { useTheme } from "@/utils/theme";
import { enhanceEvents } from "@/utils/enhanceEvents";

const CONTEXT_CONFIG = {
  MESSAGE: {
    icon: MessageCircle,
    label: "Message",
    color: "#10B981",
    darkBg: "#071A12",
    lightBg: "#F0FDF4",
    darkBorder: "#10B98120",
    lightBorder: "#BBF7D0",
  },
  EMAIL: {
    icon: Mail,
    label: "Email",
    color: "#3B82F6",
    darkBg: "#071220",
    lightBg: "#EFF6FF",
    darkBorder: "#3B82F620",
    lightBorder: "#BFDBFE",
  },
  AI_PROMPT: {
    icon: Bot,
    label: "AI Prompt",
    color: "#8B5CF6",
    darkBg: "#130B24",
    lightBg: "#F5F3FF",
    darkBorder: "#8B5CF620",
    lightBorder: "#DDD6FE",
  },
  GENERAL: {
    icon: FileText,
    label: "General",
    color: "#F59E0B",
    darkBg: "#1C1207",
    lightBg: "#FFFBEB",
    darkBorder: "#F59E0B20",
    lightBorder: "#FDE68A",
  },
};

const TONE_LABELS = {
  auto: "Auto",
  casual: "Casual",
  professional: "Professional",
  concise: "Concise",
  detailed: "Detailed",
  creative: "Creative",
};
const TONES = [
  { id: "auto", label: "Auto", icon: Sparkles },
  { id: "casual", label: "Casual", icon: MessageSquare },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "concise", label: "Concise", icon: Zap },
  { id: "detailed", label: "Detailed", icon: BookOpen },
  { id: "creative", label: "Creative", icon: Palette },
];

const MAX_CHARS = 2000;
const CLIP_COOLDOWN_MS = 30000;
const countWords = (t) => t.trim().split(/\s+/).filter(Boolean).length;

const quickDetect = (text) => {
  if (!text || text.length < 15) return null;
  const l = text.toLowerCase();
  if (
    l.includes("subject:") ||
    l.includes("dear ") ||
    l.includes("best regards") ||
    l.includes("sincerely") ||
    /hi,\s*\n/.test(l)
  )
    return "EMAIL";
  if (
    l.startsWith("you are") ||
    l.startsWith("act as") ||
    l.includes("generate a") ||
    l.includes("write me") ||
    l.startsWith("create a")
  )
    return "AI_PROMPT";
  if (text.length < 300 && (text.match(/\n/g) || []).length < 3)
    return "MESSAGE";
  return "GENERAL";
};

export default function EnhanceScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("auto");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [clipBanner, setClipBanner] = useState(null);

  const scrollRef = useRef(null);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const appStateRef = useRef(AppState.currentState);
  const lastCheckedClip = useRef("");
  const lastClipCheck = useRef(0);

  useEffect(() => {
    const checkClip = async () => {
      const now = Date.now();
      if (now - lastClipCheck.current < CLIP_COOLDOWN_MS) return;
      lastClipCheck.current = now;
      try {
        const text = await Clipboard.getStringAsync();
        if (
          text &&
          text.trim().length > 10 &&
          text !== lastCheckedClip.current &&
          text !== inputText
        ) {
          lastCheckedClip.current = text;
          setClipBanner(text.trim());
          Animated.spring(bannerAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      } catch (_) {}
    };
    const sub = AppState.addEventListener("change", (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === "active")
        checkClip();
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [inputText, bannerAnim]);

  const dismissBanner = useCallback(() => {
    Animated.timing(bannerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setClipBanner(null));
  }, [bannerAnim]);

  const pasteFromClipboard = useCallback(() => {
    if (!clipBanner) return;
    setInputText(clipBanner.substring(0, MAX_CHARS));
    setResult(null);
    setError(null);
    dismissBanner();
  }, [clipBanner, dismissBanner]);

  const handleEnhance = useCallback(async () => {
    if (!inputText.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setResult(null);
    setError(null);
    setShowOriginal(false);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, tone: selectedTone }),
      });
      if (!res.ok) throw new Error("Enhancement failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      enhanceEvents.emit();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not enhance text. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsEnhancing(false);
    }
  }, [inputText, selectedTone, isEnhancing]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const text = result.subject
      ? `Subject: ${result.subject}\n\n${result.enhancedText}`
      : result.enhancedText;
    await Clipboard.setStringAsync(text);
    lastCheckedClip.current = text;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [result]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    const text = result.subject
      ? `Subject: ${result.subject}\n\n${result.enhancedText}`
      : result.enhancedText;
    try {
      await Share.share({ message: text });
    } catch (err) {
      console.error(err);
    }
  }, [result]);

  const handleClear = () => {
    setInputText("");
    setResult(null);
    setError(null);
    setShowOriginal(false);
  };
  const handleRetry = () => {
    setError(null);
    handleEnhance();
  };

  const quickContext = quickDetect(inputText);
  const ctxKey = result ? result.detectedContext : quickContext;
  const displayCtx = ctxKey ? CONTEXT_CONFIG[ctxKey] : null;
  const ctxBg = displayCtx
    ? isDark
      ? displayCtx.darkBg
      : displayCtx.lightBg
    : null;
  const ctxBorder = displayCtx
    ? isDark
      ? displayCtx.darkBorder
      : displayCtx.lightBorder
    : null;
  const canEnhance = inputText.trim().length > 0 && !isEnhancing;
  const charsWarning = inputText.length > MAX_CHARS * 0.85;
  const wordDelta = result
    ? countWords(result.enhancedText) - countWords(inputText)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingAnimatedView style={{ flex: 1 }}>
        {/* ── Clipboard Banner ── */}
        {clipBanner && (
          <Animated.View
            style={{
              position: "absolute",
              top: insets.top + 12,
              left: 20,
              right: 20,
              zIndex: 100,
              opacity: bannerAnim,
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0],
                  }),
                },
              ],
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.5 : 0.1,
                shadowRadius: 16,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
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
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 2,
                  }}
                >
                  Text in clipboard
                </Text>
                <Text
                  style={{ color: colors.textFaint, fontSize: 12 }}
                  numberOfLines={1}
                >
                  {clipBanner}
                </Text>
              </View>
              <TouchableOpacity
                onPress={pasteFromClipboard}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: colors.accentBg,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  borderWidth: 1,
                  borderColor: colors.accentBorder,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    color: colors.accentText,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Paste
                </Text>
                <ArrowRight size={12} color={colors.accentText} />
              </TouchableOpacity>
              <TouchableOpacity onPress={dismissBanner} style={{ padding: 4 }}>
                <X size={14} color={colors.textGhost} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View
            style={{
              paddingTop: insets.top + 24,
              paddingHorizontal: 24,
              paddingBottom: 32,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: colors.accentBg,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.accentBorder,
                }}
              >
                <Zap
                  size={22}
                  color={colors.accentText}
                  fill={colors.accentText}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: 24,
                    fontWeight: "700",
                    letterSpacing: -0.8,
                  }}
                >
                  Enhance It
                </Text>
                <Text
                  style={{
                    color: colors.textFaint,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  AI-powered text enhancement
                </Text>
              </View>
            </View>
          </View>

          {/* ── Context Badge ── */}
          {displayCtx && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 240 }}
              style={{ paddingHorizontal: 24, marginBottom: 18 }}
            >
              {(() => {
                const Icon = displayCtx.icon;
                return (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: ctxBg,
                      borderWidth: 1,
                      borderColor: ctxBorder,
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <Icon size={13} color={displayCtx.color} />
                    <Text
                      style={{
                        color: displayCtx.color,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {displayCtx.label}
                    </Text>
                  </View>
                );
              })()}
            </MotiView>
          )}

          {/* ── Input ── */}
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <View
              style={{
                backgroundColor: colors.inputBg,
                borderRadius: 18,
                borderWidth: 1,
                borderColor:
                  inputText.length > 0
                    ? colors.inputBorderActive
                    : colors.inputBorderIdle,
                minHeight: 220,
              }}
            >
              <TextInput
                multiline
                placeholder="Type or paste your text here..."
                placeholderTextColor={colors.placeholder}
                value={inputText}
                onChangeText={(t) => setInputText(t.substring(0, MAX_CHARS))}
                style={{
                  color: colors.textSecondary,
                  fontSize: 16,
                  lineHeight: 27,
                  padding: 20,
                  minHeight: 220,
                  textAlignVertical: "top",
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 10,
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  color: charsWarning ? "#F59E0B" : colors.textFaint,
                  fontSize: 12,
                  fontWeight: charsWarning ? "600" : "400",
                }}
              >
                {inputText.length} / {MAX_CHARS}
              </Text>
              {inputText.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                  <Text
                    style={{
                      color: colors.textGhost,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* ── Tone Selector ── */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: colors.textFaint,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 1.4,
                textTransform: "uppercase",
                paddingHorizontal: 24,
                marginBottom: 12,
              }}
            >
              Tone
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
            >
              {TONES.map((tone) => {
                const isSel = selectedTone === tone.id;
                const ToneIcon = tone.icon;
                return (
                  <TouchableOpacity
                    key={tone.id}
                    onPress={() => setSelectedTone(tone.id)}
                    activeOpacity={0.75}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 7,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: isSel ? colors.accentBg : colors.inputBg,
                      borderWidth: 1,
                      borderColor: isSel
                        ? colors.accent
                        : colors.inputBorderIdle,
                    }}
                  >
                    <ToneIcon
                      size={13}
                      color={isSel ? colors.accentText : colors.textGhost}
                    />
                    <Text
                      style={{
                        color: isSel ? colors.accentTextSoft : colors.textDim,
                        fontSize: 13,
                        fontWeight: isSel ? "600" : "400",
                      }}
                    >
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Enhance Button ── */}
          <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
            <TouchableOpacity
              onPress={handleEnhance}
              disabled={!canEnhance}
              activeOpacity={0.8}
              style={{
                backgroundColor: canEnhance ? colors.accentBg : colors.inputBg,
                borderRadius: 16,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                borderWidth: 1,
                borderColor: canEnhance
                  ? colors.accent
                  : colors.inputBorderIdle,
              }}
            >
              {isEnhancing ? (
                <ActivityIndicator color={colors.accentText} size="small" />
              ) : (
                <Zap
                  size={18}
                  color={canEnhance ? colors.accentText : colors.textFaint}
                  fill={canEnhance ? colors.accentText : "transparent"}
                />
              )}
              <Text
                style={{
                  color: canEnhance ? colors.accentTextSoft : colors.textFaint,
                  fontSize: 16,
                  fontWeight: "600",
                  letterSpacing: -0.2,
                }}
              >
                {isEnhancing ? "Enhancing..." : "Enhance"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Error ── */}
          {error && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ paddingHorizontal: 24, marginBottom: 24 }}
            >
              <View
                style={{
                  backgroundColor: colors.errorBg,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.errorBorder,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: colors.errorText,
                    fontSize: 14,
                    lineHeight: 22,
                    marginBottom: 14,
                  }}
                >
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={handleRetry}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    alignSelf: "flex-start",
                    backgroundColor: colors.card,
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <RefreshCcw size={14} color={colors.textMuted} />
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Try again
                  </Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          )}

          {/* ── Result Card ── */}
          {result && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 380 }}
              style={{ paddingHorizontal: 24 }}
            >
              {/* Divider */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.divider,
                  }}
                />
                <Text
                  style={{
                    color: colors.textFaint,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                  }}
                >
                  Result
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.divider,
                  }}
                />
              </View>

              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  overflow: "hidden",
                }}
              >
                {/* Card Header */}
                <View
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderColor: colors.divider,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    {(() => {
                      const ctx = CONTEXT_CONFIG[result.detectedContext];
                      const Icon = ctx?.icon || FileText;
                      return (
                        <>
                          <Icon
                            size={14}
                            color={ctx?.color || colors.accentText}
                          />
                          <Text
                            style={{
                              color: ctx?.color || colors.accentText,
                              fontSize: 13,
                              fontWeight: "600",
                            }}
                          >
                            {ctx?.label || "Enhanced"}
                          </Text>
                        </>
                      );
                    })()}
                    {/* Tone applied badge — shown when Auto was selected */}
                    {selectedTone === "auto" && result.toneApplied && (
                      <View
                        style={{
                          backgroundColor: colors.accentBg,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderWidth: 1,
                          borderColor: colors.accentBorder,
                          marginLeft: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.accentText,
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                        >
                          {TONE_LABELS[result.toneApplied] ||
                            result.toneApplied}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* Word delta + before/after toggle */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.successBg,
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: colors.successBorder,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.successText,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {wordDelta >= 0 ? `+${wordDelta}` : wordDelta} words
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowOriginal((v) => !v)}
                    >
                      {showOriginal ? (
                        <ToggleRight size={24} color={colors.accent} />
                      ) : (
                        <ToggleLeft size={24} color={colors.textGhost} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Label */}
                <View style={{ paddingHorizontal: 18, paddingTop: 14 }}>
                  <Text
                    style={{
                      color: colors.textFaint,
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                    }}
                  >
                    {showOriginal ? "Original" : "Enhanced"}
                  </Text>
                </View>

                {/* Email Subject */}
                {!showOriginal && result.subject && (
                  <View
                    style={{
                      paddingHorizontal: 18,
                      paddingTop: 12,
                      paddingBottom: 8,
                      borderBottomWidth: 1,
                      borderColor: colors.divider,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textFaint,
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1.4,
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      Subject
                    </Text>
                    <Text
                      style={{
                        color: colors.textPrimary,
                        fontSize: 16,
                        fontWeight: "600",
                        lineHeight: 24,
                      }}
                    >
                      {result.subject}
                    </Text>
                  </View>
                )}

                {/* Body */}
                <View style={{ padding: 18 }}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 15,
                      lineHeight: 27,
                      letterSpacing: 0.1,
                    }}
                  >
                    {showOriginal ? inputText : result.enhancedText}
                  </Text>
                </View>

                {/* Explanation */}
                {result.explanation && !showOriginal && (
                  <View
                    style={{
                      paddingHorizontal: 18,
                      paddingTop: 14,
                      paddingBottom: 16,
                      borderTopWidth: 1,
                      borderColor: colors.divider,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textFaint,
                        fontSize: 12,
                        lineHeight: 18,
                        fontStyle: "italic",
                      }}
                    >
                      {result.explanation}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    padding: 16,
                    borderTopWidth: 1,
                    borderColor: colors.divider,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleCopy}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      backgroundColor: copied
                        ? colors.successBg
                        : colors.accentBg,
                      borderRadius: 12,
                      paddingVertical: 14,
                      borderWidth: 1,
                      borderColor: copied
                        ? colors.successBorder
                        : colors.accentBorder,
                    }}
                  >
                    {copied ? (
                      <CheckCircle size={16} color={colors.successText} />
                    ) : (
                      <Copy size={16} color={colors.accentText} />
                    )}
                    <Text
                      style={{
                        color: copied ? colors.successText : colors.accentText,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleShare}
                    activeOpacity={0.8}
                    style={{
                      width: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.inputBg,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.inputBorderIdle,
                    }}
                  >
                    <Share2 size={16} color={colors.textDim} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleClear}
                    activeOpacity={0.8}
                    style={{
                      width: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.inputBg,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.inputBorderIdle,
                    }}
                  >
                    <RotateCcw size={16} color={colors.textGhost} />
                  </TouchableOpacity>
                </View>
              </View>
            </MotiView>
          )}
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
