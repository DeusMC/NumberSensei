import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius, GameModeColors, Shadows } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useGame } from "@/lib/game-context";
import { getModeDescription, getModeIcon } from "@/lib/level-generator";
import { getSkillLevelName } from "@/lib/skill-model";
import { GameMode } from "@/lib/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "MainMenu">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ModeCard({ mode, isActive }: { mode: GameMode; isActive: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const color = GameModeColors[mode];
  const icon = getModeIcon(mode);
  const description = getModeDescription(mode);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const modeNames: Record<GameMode, string> = {
    classic: "Classic",
    depth: "Depth",
    strategic: "Strategic",
    tactical: "Tactical",
  };

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.95);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.modeCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: isActive ? color : theme.border,
          borderWidth: isActive ? 2 : 1,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.modeIconContainer, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={24} color={color} />
      </View>
      <ThemedText type="h4" style={styles.modeName}>
        {modeNames[mode]}
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.modeDescription, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {description}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function MainMenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const {
    playerStats,
    skillMetrics,
    hasSavedGame,
    startNewGame,
    continueGame,
    profile,
  } = useGame();

  const winRate =
    playerStats.totalGames > 0
      ? Math.round((playerStats.totalWins / playerStats.totalGames) * 100)
      : 0;

  const handleStartGame = () => {
    startNewGame();
    navigation.navigate("Game");
  };

  const handleContinueGame = () => {
    continueGame();
    navigation.navigate("Game");
  };

  const modes: GameMode[] = ["classic", "depth", "strategic", "tactical"];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Animated.Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.title}>
            NumberMind
          </ThemedText>
          <View style={styles.skillBadge}>
            <ThemedText type="small" style={{ color: GameModeColors.classic }}>
              {getSkillLevelName(skillMetrics.skillLevel)} - Level{" "}
              {Math.round(skillMetrics.skillLevel)}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.actions}
        >
          {hasSavedGame ? (
            <Button onPress={handleContinueGame} style={styles.primaryButton}>
              Continue Game
            </Button>
          ) : null}
          <Button
            onPress={handleStartGame}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: hasSavedGame
                  ? theme.backgroundSecondary
                  : theme.link,
              },
            ]}
          >
            {hasSavedGame ? "New Game" : "Start Playing"}
          </Button>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(300).duration(400)}
          style={styles.modesSection}
        >
          <ThemedText type="h4" style={styles.sectionTitle}>
            Game Modes
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modesScroll}
          >
            {modes.map((mode, index) => (
              <ModeCard key={mode} mode={mode} isActive={index === 0} />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(400).duration(400)}
          style={styles.statsPreview}
        >
          <Card elevation={1} style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText type="h3">{playerStats.totalGames}</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Games
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText type="h3">{winRate}%</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Win Rate
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText type="h3">{playerStats.bestStreak}</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  Best Streak
                </ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeIn.delay(500).duration(400)}
        style={[
          styles.floatingButtons,
          { bottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Pressable
          onPress={() => navigation.navigate("Stats")}
          style={({ pressed }) => [
            styles.floatingButton,
            {
              backgroundColor: theme.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="bar-chart-2" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [
            styles.floatingButton,
            {
              backgroundColor: theme.backgroundSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  skillBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: GameModeColors.classic + "20",
  },
  actions: {
    gap: Spacing.md,
    marginBottom: Spacing["3xl"],
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
  modesSection: {
    marginBottom: Spacing["3xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  modesScroll: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  modeCard: {
    width: 160,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  modeName: {
    marginBottom: Spacing.xs,
  },
  modeDescription: {
    lineHeight: 18,
  },
  statsPreview: {
    marginBottom: Spacing["4xl"],
  },
  statsCard: {
    padding: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#2D3748",
  },
  floatingButtons: {
    position: "absolute",
    right: Spacing.xl,
    flexDirection: "row",
    gap: Spacing.md,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.small,
  },
});
