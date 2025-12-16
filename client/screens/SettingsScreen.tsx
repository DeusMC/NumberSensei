import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  Spacing,
  BorderRadius,
  GameModeColors,
  SemanticColors,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useGame } from "@/lib/game-context";

const AVATARS = [
  { id: 0, icon: "cpu", color: GameModeColors.classic },
  { id: 1, icon: "layers", color: GameModeColors.depth },
  { id: 2, icon: "target", color: GameModeColors.strategic },
  { id: 3, icon: "crosshair", color: GameModeColors.tactical },
];

function SettingRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
      <View style={styles.settingLabel}>
        <View
          style={[styles.settingIcon, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Feather name={icon as any} size={18} color={theme.text} />
        </View>
        <ThemedText type="body">{label}</ThemedText>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { profile, updateProfile, resetProgress, playerStats } = useGame();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [hapticsEnabled, setHapticsEnabled] = useState(profile.hapticsEnabled);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);

  const handleSave = () => {
    updateProfile({
      displayName: displayName.trim() || "Player",
      avatarId: selectedAvatar,
      soundEnabled,
      hapticsEnabled,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "This will delete all your game data including stats, level progress, and achievements. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetProgress();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAvatarSelect = (id: number) => {
    setSelectedAvatar(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
        <Animated.View entering={FadeInUp.duration(300)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Profile
          </ThemedText>
          <Card elevation={1} style={styles.profileCard}>
            <ThemedText
              type="small"
              style={[styles.fieldLabel, { color: theme.textSecondary }]}
            >
              Avatar
            </ThemedText>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar) => (
                <Pressable
                  key={avatar.id}
                  onPress={() => handleAvatarSelect(avatar.id)}
                  style={[
                    styles.avatarItem,
                    {
                      backgroundColor:
                        selectedAvatar === avatar.id
                          ? avatar.color + "30"
                          : theme.backgroundSecondary,
                      borderColor:
                        selectedAvatar === avatar.id
                          ? avatar.color
                          : "transparent",
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Feather name={avatar.icon as any} size={28} color={avatar.color} />
                </Pressable>
              ))}
            </View>

            <ThemedText
              type="small"
              style={[styles.fieldLabel, { color: theme.textSecondary }]}
            >
              Display Name
            </ThemedText>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textDisabled}
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              maxLength={20}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(300)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <Card elevation={1} style={styles.preferencesCard}>
            <SettingRow icon="volume-2" label="Sound Effects">
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: GameModeColors.classic,
                }}
                thumbColor={theme.text}
              />
            </SettingRow>
            <SettingRow icon="smartphone" label="Haptic Feedback">
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{
                  false: theme.backgroundTertiary,
                  true: GameModeColors.classic,
                }}
                thumbColor={theme.text}
              />
            </SettingRow>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(300)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Game Stats
          </ThemedText>
          <Card elevation={1}>
            <View style={styles.statsInfo}>
              <View style={styles.statsInfoRow}>
                <ThemedText type="body">Total Games</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {playerStats.totalGames}
                </ThemedText>
              </View>
              <View style={styles.statsInfoRow}>
                <ThemedText type="body">Wins / Losses</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {playerStats.totalWins} / {playerStats.totalLosses}
                </ThemedText>
              </View>
              <View style={[styles.statsInfoRow, { borderBottomWidth: 0 }]}>
                <ThemedText type="body">Best Streak</ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {playerStats.bestStreak}
                </ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(300)}
          style={styles.actions}
        >
          <Button onPress={handleSave}>Save Changes</Button>
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetButton,
              {
                backgroundColor: SemanticColors.error + "20",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="trash-2" size={18} color={SemanticColors.error} />
            <ThemedText type="body" style={{ color: SemanticColors.error }}>
              Reset All Progress
            </ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(300)}
          style={styles.footer}
        >
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
            NumberMind v1.0.0
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.xs }}
          >
            A procedurally generated number guessing game
          </ThemedText>
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  profileCard: {
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    marginBottom: Spacing.sm,
  },
  avatarGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarItem: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  preferencesCard: {
    marginBottom: Spacing.xl,
    padding: 0,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsInfo: {
    paddingVertical: Spacing.sm,
  },
  statsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#2D3748",
  },
  actions: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
  },
  footer: {
    marginTop: Spacing["4xl"],
    paddingTop: Spacing.xl,
  },
});
