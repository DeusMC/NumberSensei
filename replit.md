# NumberMind - Procedural Number Guessing Game

## Overview
NumberMind is an advanced "Guess the Number" mobile game built with Expo React Native. Features procedural level generation with dynamic difficulty adjustment based on player performance.

## Current State
**Status**: Frontend Complete (Prototype)
- Full game loop with procedural level generation
- Player skill tracking and adaptive difficulty
- Four game modes: Classic, Depth, Strategic, Tactical
- Dark mode optimized UI
- In-memory state management

## Project Architecture

### Frontend (client/)
```
client/
├── App.tsx              # Root component with providers
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── HeaderTitle.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/
│   └── theme.ts         # Design tokens and colors
├── hooks/               # Custom React hooks
├── lib/
│   ├── game-context.tsx # Game state management
│   ├── level-generator.ts # Procedural level creation
│   ├── seeded-random.ts  # Deterministic RNG
│   ├── skill-model.ts    # Player skill tracking
│   └── types.ts          # TypeScript interfaces
├── navigation/
│   └── RootStackNavigator.tsx
└── screens/
    ├── MainMenuScreen.tsx
    ├── GameScreen.tsx
    ├── StatsScreen.tsx
    └── SettingsScreen.tsx
```

### Game Modes
1. **Classic** - Pure logic, no time limit, basic hints
2. **Depth** - Wider ranges, distance-based hints
3. **Strategic** - Penalties for low attempts, careful play
4. **Tactical** - Time pressure, hot/cold hints

### Level Generator Engine
- Seeded RNG for reproducible levels
- Non-linear difficulty scaling
- Adjusts based on: accuracy, attempts, time, streaks
- Validates levels to prevent impossible scenarios

### Player Skill Model
Tracks:
- Success rate and consistency
- Reaction time
- Win/loss streaks
- Mode-specific performance

## Recent Changes
- December 2024: Initial build with procedural generation
- Full game UI with dark theme
- Four game modes implemented
- Stats dashboard and settings

## User Preferences
- Dark mode optimized UI
- No emojis in UI
- Haptic feedback enabled
- Mobile-first design

## Commands
- `npm run all:dev` - Start development servers
- `npm run expo:dev` - Start Expo only
- `npm run server:dev` - Start Express server only
