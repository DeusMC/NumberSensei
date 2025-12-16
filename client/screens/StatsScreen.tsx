import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Spacing, BorderRadius, GameModeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useGame } from "@/lib/game-context";
import { getSkillLevelName } from "@/lib/skill-model";
import { getModeIcon } from "@/lib/level-generator";
import { GameMode } from "@/lib/types";

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(300)}
      style={styles.statCardWrapper}
    >
      <Card elevation={1} style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
          <Feather name={icon as any} size={20} color={color} />
        </View>
        <ThemedText type="h3" style={styles.statValue}>
          {value}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {label}
        </ThemedText>
      </Card>
    </Animated.View>
  );
}

function ModeStatRow({ mode }: { mode: GameMode }) {
  const { theme } = useTheme();
  const { playerStats } = useGame();
  const stats = playerStats.modeStats[mode];
  const color = GameModeColors[mode];
  const icon = getModeIcon(mode);

  const modeNames: Record<GameMode, string> = {
    classic: "Classic",
    depth: "Depth",
    strategic: "Strategic",
    tactical: "Tactical",
  };

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

  return (
    <View style={[styles.modeRow, { borderBottomColor: theme.border }]}>
      <View style={styles.modeInfo}>
        <View style={[styles.modeIcon, { backgroundColor: color + "20" }]}>
          <Feather name={icon as any} size={18} color={color} />
        </View>
        <ThemedText type="body">{modeNames[mode]}</ThemedText>
      </View>
      <View style={styles.modeStats}>
        <View style={styles.modeStat}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {stats.gamesPlayed}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Games
          </ThemedText>
        </View>
        <View style={styles.modeStat}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {winRate}%
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Win
          </ThemedText>
        </View>
        <View style={styles.modeStat}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {stats.averageAttempts.toFixed(1)}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Avg
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function AccuracyGraph() {
  const { theme } = useTheme();
  const { playerStats } = useGame();
  const history = playerStats.accuracyHistory.slice(-10);

  if (history.length < 2) {
    return (
      <View style={styles.emptyGraph}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Play more games to see accuracy trend
        </ThemedText>
      </View>
    );
  }

  const maxVal = Math.max(...history, 1);

  return (
    <View style={styles.graphContainer}>
      {history.map((val, idx) => (
        <View key={idx} style={styles.graphBarWrapper}>
          <View
            style={[
              styles.graphBar,
              {
                height: (val / maxVal) * 80,
                backgroundColor: GameModeColors.classic,
              },
            ]}
          />
          <ThemedText
            type="small"
            style={[styles.graphLabel, { color: theme.textSecondary }]}
          >
            {idx + 1}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { playerStats, skillMetrics } = useGame();

  const winRate =
    playerStats.totalGames > 0
      ? Math.round((playerStats.totalWins / playerStats.totalGames) * 100)
      : 0;

  const avgTime = playerStats.averageTime > 0
    ? `${Math.round(playerStats.averageTime)}s`
    : "-";

  const modes: GameMode[] = ["classic", "depth", "strategic", "tactical"];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={styles.skillSection}
        >
          <Card elevation={1} style={styles.skillCard}>
            <ThemedText type="h4" style={styles.skillTitle}>
              Skill Level
            </ThemedText>
            <View style={styles.skillProgress}>
              <View
                style={[
                  styles.skillBar,
                  { backgroundColor: theme.backgroundTertiary },
                ]}
              >
                <View
                  style={[
                    styles.skillFill,
                    {
                      width: `${skillMetrics.skillLevel}%`,
                      backgroundColor: GameModeColors.classic,
                    },
                  ]}
                />
              </View>
              <ThemedText type="h2" style={{ color: GameModeColors.classic }}>
                {Math.round(skillMetrics.skillLevel)}
              </ThemedText>
            </View>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {getSkillLevelName(skillMetrics.skillLevel)}
            </ThemedText>
          </Card>
        </Animated.View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="play"
            label="Total Games"
            value={playerStats.totalGames}
            color={GameModeColors.classic}
            delay={100}
          />
          <StatCard
            icon="percent"
            label="Win Rate"
            value={`${winRate}%`}
            color={GameModeColors.strategic}
            delay={150}
          />
          <StatCard
            icon="trending-up"
            label="Best Streak"
            value={playerStats.bestStreak}
            color={GameModeColors.depth}
            delay={200}
          />
          <StatCard
            icon="clock"
            label="Avg Time"
            value={avgTime}
            color={GameModeColors.tactical}
            delay={250}
          />
        </View>

        <Animated.View entering={FadeInUp.delay(300).duration(300)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Accuracy Trend
          </ThemedText>
          <Card elevation={1} style={styles.graphCard}>
            <AccuracyGraph />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(300)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Mode Breakdown
          </ThemedText>
          <Card elevation={1} style={styles.modesCard}>
            {modes.map((mode) => (
              <ModeStatRow key={mode} mode={mode} />
            ))}
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).duration(300)}
          style={styles.metricsSection}
        >
          <ThemedText type="h4" style={styles.sectionTitle}>
            Performance Metrics
          </ThemedText>
          <Card elevation={1}>
            <View style={styles.metricRow}>
              <ThemedText type="body">Success Rate</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {Math.round(skillMetrics.successRate * 100)}%
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText type="body">Consistency</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {Math.round(skillMetrics.consistencyScore * 100)}%
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <ThemedText type="body">Reaction Speed</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {Math.round(skillMetrics.reactionSpeed * 100)}%
              </ThemedText>
            </View>
            <View style={[styles.metricRow, { borderBottomWidth: 0 }]}>
              <ThemedText type="body">Current Streak</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {skillMetrics.winStreak > 0
                  ? `+${skillMetrics.winStreak}`
                  : skillMetrics.failureStreak > 0
                  ? `-${skillMetrics.failureStreak}`
                  : "0"}
              </ThemedText>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
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
  skillSection: {
    marginBottom: Spacing.xl,
  },
  skillCard: {
    alignItems: "center",
  },
  skillTitle: {
    marginBottom: Spacing.md,
  },
  skillProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
    width: "100%",
  },
  skillBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  skillFill: {
    height: "100%",
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCardWrapper: {
    width: "48%",
  },
  statCard: {
    alignItems: "center",
    padding: Spacing.lg,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  graphCard: {
    marginBottom: Spacing.xl,
    minHeight: 120,
  },
  graphContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
    paddingTop: Spacing.sm,
  },
  graphBarWrapper: {
    flex: 1,
    alignItems: "center",
  },
  graphBar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  graphLabel: {
    marginTop: Spacing.xs,
    fontSize: 10,
  },
  emptyGraph: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  modesCard: {
    marginBottom: Spacing.xl,
    padding: 0,
    overflow: "hidden",
  },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  modeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modeStats: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  modeStat: {
    alignItems: "center",
    minWidth: 40,
  },
  metricsSection: {
    marginBottom: Spacing.xl,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3748",
  },
});
