# Design Guidelines: Advanced Guess the Number Game

## Architecture Decisions

### Authentication
**No Auth Required** - This is a single-player game with local data persistence.
- Include a **Profile/Settings screen** accessible via header button
- Profile includes:
  - Customizable avatar (generate 4 game-themed avatars: geometric cube, strategic knight piece, tactical crosshair, classic lightbulb)
  - Display name field (default: "Player")
  - Game preferences: sound toggle, haptics toggle, theme variant selector
  - Stats reset option (with confirmation alert)

### Navigation Architecture
**Stack-Only Navigation** with modal overlays:
- Primary flow: Main Menu → Game Screen → Level Complete → Next Level (loop)
- Modal screens: Stats Dashboard, Settings, Mode Selection, Pause Menu
- No tab bar - game uses full-screen immersive experience
- Floating action buttons for secondary actions (pause, settings)

## Screen Specifications

### 1. Main Menu Screen
**Purpose:** Entry point, mode selection, stats preview
**Layout:**
- Header: Transparent, right button (Settings icon)
- Main content: Non-scrollable, centered layout
- Components:
  - App logo/title (large, bold typography)
  - Current difficulty indicator (subtle badge)
  - "Continue Game" button (if saved state exists) - primary CTA
  - "New Game" button - secondary style
  - Game mode cards (4 horizontal scrollable cards showing Classic, Depth, Strategic, Tactical)
  - Quick stats summary (games played, win rate, current streak)
  - Floating Settings button (bottom-right, safe area: bottom inset + Spacing.xl)
- Safe area insets: 
  - Top: insets.top + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

### 2. Game Screen
**Purpose:** Active gameplay - guessing numbers
**Layout:**
- Header: Custom transparent header with centered level indicator, left: Pause button, right: Hint count badge
- Main content: Non-scrollable, vertically centered
- Components:
  - Level metadata banner (range, attempts left, timer - if applicable)
  - Mode-specific visual theme indicator (subtle background gradient or icon)
  - Large number input area (centered, prominent)
  - Number pad or slider (mode-dependent input method)
  - Feedback zone (displays "Higher/Lower" hints with directional indicators)
  - Attempt history (compact list showing previous guesses with feedback)
  - Submit guess button (large, always accessible)
- Safe area insets:
  - Top: headerHeight + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
  - Floating elements use full safe area + Spacing.xl

### 3. Level Complete Modal
**Purpose:** Celebrate success, show performance, proceed
**Layout:**
- Native modal (semi-transparent backdrop)
- Card-style container (centered, max 85% screen width)
- Components:
  - Success/fail icon (animated entrance)
  - Performance stats (attempts used, time taken, accuracy %)
  - XP/score gained indicator
  - Difficulty adjustment preview (e.g., "Next level: Harder range")
  - "Continue" button (primary)
  - "View Stats" button (secondary, optional)
- Dismissible with tap outside or button

### 4. Stats Dashboard Screen
**Purpose:** Comprehensive performance tracking
**Layout:**
- Header: Default navigation with "Statistics" title, left: Back button
- Main content: Scrollable vertical layout
- Components:
  - Overall stats cards (total games, win rate, best streak, avg time)
  - Performance graph (accuracy over last 20 levels)
  - Mode-specific breakdown (expandable sections)
  - Difficulty progression timeline
  - Personal records section
- Safe area insets:
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

### 5. Settings/Profile Screen
**Purpose:** Customize experience and preferences
**Layout:**
- Header: Default navigation with "Settings" title, left: Back button
- Main content: Scrollable form layout
- Components:
  - Avatar selector (4-column grid of preset avatars)
  - Display name input field
  - Sound toggle with volume slider
  - Haptics toggle
  - Theme selector (if variants exist)
  - "Reset Progress" button (destructive style, bottom of screen)
  - Privacy notice and credits
- Form layout with submit/cancel in header
- Safe area insets:
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

### 6. Pause Menu Modal
**Purpose:** Mid-game actions without losing state
**Layout:**
- Native modal overlay (semi-transparent dark backdrop)
- Centered menu card
- Components:
  - "Resume" button
  - "Restart Level" button
  - "View Stats" button
  - "Main Menu" button (with save confirmation)

## Design System

### Color Palette
**Dark-mode optimized** (low-end Android friendly):
- **Background:** 
  - Primary: `#0A0E1A` (deep dark blue-black)
  - Secondary: `#141B2D` (card backgrounds)
- **Accent Colors** (mode-specific):
  - Classic: `#4ECDC4` (teal - logic/clarity)
  - Depth: `#8B4513` (earth brown - mining aesthetic)
  - Strategic: `#FFD700` (gold - chess prestige)
  - Tactical: `#FF6B6B` (alert red - urgency)
- **Text:**
  - Primary: `#FFFFFF` (100% white)
  - Secondary: `#A0A8B8` (60% opacity)
  - Disabled: `#4A5568` (30% opacity)
- **Semantic:**
  - Success: `#48BB78`
  - Error: `#F56565`
  - Warning: `#ECC94B`
- **Borders:** `#2D3748` (subtle separation)

### Typography
- **Title:** System font, 32pt, Bold, Letter-spacing: -0.5
- **Heading:** System font, 24pt, Semibold
- **Body:** System font, 16pt, Regular
- **Caption:** System font, 14pt, Regular, Secondary color
- **Number Display:** Monospace font, 48pt, Bold (for guess input)

### Interactive Elements
**All touchables have press feedback:**
- Primary buttons: Scale down to 0.95 + opacity to 0.8 on press
- Cards: Subtle scale to 0.98 + slight shadow increase
- Icons: Opacity to 0.6 on press
- Number pad keys: Background color change + haptic feedback

**Floating Action Buttons:**
- Use drop shadow:
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Background: Secondary with 80% opacity
- Icon: Feather icons from @expo/vector-icons

### Critical Assets
**Generate these unique assets:**
1. **4 Player Avatars** (geometric, game-themed):
   - Cube avatar (Minecraft-inspired aesthetic)
   - Knight piece avatar (Chess aesthetic)
   - Crosshair avatar (Tactical aesthetic)
   - Brain/lightbulb avatar (Classic logic aesthetic)
2. **Mode Indicator Icons** (minimal, single-color):
   - Classic mode icon
   - Depth mode icon
   - Strategic mode icon  
   - Tactical mode icon
3. **Success/Fail Celebration Icons:**
   - Victory checkmark (animated)
   - Failure X mark (animated)

**NO emojis.** Use Feather icons for all UI actions (pause, settings, info, chevrons, etc.)

### Animations
- **Screen transitions:** Slide from right (200ms, easeOut)
- **Modal entrance:** Fade + scale from 0.9 (250ms, spring)
- **Button press:** Immediate scale (100ms)
- **Number feedback:** Slide up + fade for hints (300ms)
- **Level complete:** Celebration icon bounces in (400ms, spring config)
- **Stat counters:** Animated count-up effect (500ms, easeOut)

### Sound & Haptics
- **Haptic patterns:**
  - Correct guess: Success pattern (medium impact)
  - Wrong guess: Light impact
  - Level complete: Notification pattern
  - Button press: Selection (light)
- **Sound effects needed:**
  - Guess submit (subtle beep)
  - Correct answer (victory chime)
  - Wrong answer (error tone)
  - Level up (progression sound)
  - Timer warning (ticking at <10s)

### Accessibility
- Minimum touch targets: 44x44pt
- High contrast for text on backgrounds (4.5:1 minimum)
- Haptic feedback reinforces visual feedback
- Sound is optional (toggleable)
- Timer has visual + audio alerts
- Clear error states with descriptive text

### Performance Optimization
- Use FlatList for any lists (attempt history)
- Lazy load stats graphs
- Debounce rapid button presses
- Cache generated levels with seeds
- Minimize re-renders during gameplay
- Use React.memo for static components