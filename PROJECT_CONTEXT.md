# TORNADO APP — COMPLETE PROJECT CONTEXT
## Last Updated: May 2026 — Full Session Summary

---

## 0. TOKENS & ACCESS — START HERE EVERY NEW CHAT

### GitHub
- Repo: https://github.com/ahmedashraf-cyber/tornado-app.git
- Token: GITHUB_TOKEN_HERE
- Branch: main

### Firebase (Project: tornado-app-a8bb9)
- apiKey: AIzaSyD0CDRRUII_4NNXpFzmaQwnvSgCWzkcZJk
- authDomain: tornado-app-a8bb9.firebaseapp.com
- projectId: tornado-app-a8bb9
- appId: 1:1035711714347:web:cf852a046174689eed066e

### Super Admin Account
- Email: ahmed.ashraf@hudl.com
- Password: Tornado@2025!
- UID: HKy9hWjFOsXVv3x3FPTgpAyJmPz2
- Note: Hardcoded UID in AuthContext — instant login, no Firestore needed

### Live Web URL
- https://ahmedashraf-cyber.github.io/tornado-app/
- Deployed from gh-pages branch (orphan branch, only /dist contents)
- To deploy: build dist/, push -f to gh-pages branch

### Desktop App (DISABLED — web only now)
- GitHub Actions workflow exists but is disabled (only workflow_dispatch, no auto-trigger)
- .github/workflows/build-desktop.yml — kept for future use

### How to start a new chat
1. Paste full system prompt (project instructions block)
2. Paste this entire document
3. Say: "Continue building from where we left off"
4. Clone: `git clone https://TOKEN@github.com/ahmedashraf-cyber/tornado-app.git`
5. Run: `npm install`

---

## 1. WHAT IS TORNADO APP

A **web-only** platform (React + Vite + Firebase) where employed data collectors record live football performance data. Built on Statsbomb Data Spec v2.0.

**Roles:**
- Super Admin (Omar) — full control
- Organization Admin — manages one org's scope
- Manager/Coach — views live + final data, approves submissions
- Data Collector — enters data live during matches

**Scale:** Up to 100 simultaneous collectors, all football levels

---

## 2. TECH STACK

- React 19 + Vite 6 + Tailwind CSS 3
- Firebase Auth (email/password, browserLocalPersistence)
- Firestore (instant save per event, no submit button ever)
- SheetJS (xlsx) — for roster Excel/CSV upload in Starting XI
- GitHub Pages (web deployment)
- GitHub Actions — desktop build workflow EXISTS but is DISABLED
- $0 cost — all free tier

**Firebase Config:**
```
apiKey:       "AIzaSyD0CDRRUII_4NNXpFzmaQwnvSgCWzkcZJk"
authDomain:   "tornado-app-a8bb9.firebaseapp.com"
projectId:    "tornado-app-a8bb9"
appId:        "1:1035711714347:web:cf852a046174689eed066e"
```

---

## 3. FILE STRUCTURE

```
.github/
  workflows/
    build-desktop.yml       — DISABLED desktop build (workflow_dispatch only)
public/
  icon.ico
  icon.png
  roster_template.xlsx      — downloadable Excel template for roster upload
src/
  App.jsx                   — HashRouter with all routes
  main.jsx                  — React entry
  index.css                 — Tailwind base
  firebase/
    config.js               — Firebase init, auth, db, setPersistence
  context/
    AuthContext.jsx          — onAuthStateChanged, hardcoded UID for super_admin
  hooks/
    useActivityTracker.js   — session tracking, events/min, idle detection → Firestore
  components/
    ProtectedRoute.jsx
    StartingXIScreen.jsx    — drag-to-position formation builder + Excel roster upload + pitch background
    KeyboardOverlay.jsx     — keyboard shortcut reference overlay
    HamburgerMenu.jsx       — slide-in left panel: Tasks (clean toggle, no badges) + Settings
    PitchView.jsx           — portrait SVG pitch, grid overlay, click markers
    DynamicSidebar.jsx      — context-aware event sidebar
    EventQualifierPanel.jsx — MASTER qualifier component
    PassQualifierSteps.jsx
    FoulQualifierSteps.jsx
    DribbleQualifierSteps.jsx
    ClearanceQualifierSteps.jsx
    GKQualifierSteps.jsx         — 3-step (normal) + 4-step (smother: Kind→Extras)
    GKSaveQualifierSteps.jsx     — 5-step save attempt
    ShotQualifierSteps.jsx
    TackleQualifierSteps.jsx     — 2-step Outcome→Type
    StoppageQualifierSteps.jsx   — 2-step Type→Paused
    SubstitutionScreen.jsx       — full pitch screen for substitutions
    TacticalShiftScreen.jsx      — full pitch formation editor
    LocationPitchPanel.jsx       — landscape pitch for XY location tagging
    PlayersPanel.jsx             — pitch grid with jersey shirt cards for player assignment
    EventChain.jsx               — event pills with dots, auto-scroll, click to jump video
  pages/
    LoginPage.jsx
    MatchSelectionPage.jsx
    CollectionLoadingPage.jsx
    CollectionActivePage.jsx     — MAIN: full collection UI (step machine + task workflow)
    ActivityDashboard.jsx        — collector performance tracking dashboard (admin only)
    PlaceholderPages.jsx         — ManagerDashboardPage, OrgAdminPage, SuperAdminPage (with Activity tab)
  data/
    matches.js
    formations.js               — FORMATIONS, POSITION_COORDS, FORMATION_LIST, ALL_POSITIONS
    events.js
    eventDefinitions.js         — MASTER DATA: all qualifiers, sequences, sidebar groups
    eventSequences.js
```

---

## 4. ROUTES

- /login → LoginPage
- / → RoleRouter
- /matches → MatchSelectionPage
- /collection → CollectionLoadingPage
- /collection/active → CollectionActivePage
- /manager → ManagerDashboardPage (placeholder)
- /org-admin → OrgAdminPage (placeholder)
- /admin → SuperAdminPage (real dashboard with Overview + Collector Activity tabs)

**Role routing:** super_admin→/admin, org_admin→/org-admin, manager→/manager, collector→/matches

---

## 5. TASK SYSTEM — CRITICAL

Tasks are selected in the hamburger menu. Each task activates a workflow layer. All start unchecked, no badges, full freedom to select any combination.

### Task keys (bookedTasks state):
- `base` — enables left/right sidebars for event tagging
- `extras` — additional qualifier fields
- `players_home` — shows Players panel for home team
- `players_away` — shows Players panel for away team
- `location_home` / `location_away` — shows Location pitch panel
- `impact`, `goal_location`, `clocks`, `formation`, `ball_placement` — future tasks

### Sidebar visibility rules:
- Base NOT booked → both sidebars hidden entirely
- During location step → only the event-team's sidebar shows (home event = left, away event = right)
- During players step → both sidebars hidden
- Normal idle → both sidebars shown (if Base booked)

### Step machine (activeStep):
When an event fires, the app computes a sequence of steps based on booked tasks:
1. `qualifiers` — if Base booked
2. `location` — if Location task booked
3. `players_home` / `players_away` — if Players task booked AND event has a player

**Full sequence when all tasks active:** qualifiers → location → players

**Step transitions:**
- Qualifiers → confirm button or auto-confirm → advances
- Location → placing first dot auto-advances
- Players → selecting a player shows confirm button → advances
- Last step → finalizeEvent() → saves to Firestore

### Center layout (50/50 ALWAYS):
- Task panel (location pitch OR players panel) always on **LEFT**
- Video always on **RIGHT**
- Both are exactly `w-1/2 flex-shrink-0` when task panel is active
- When no task panel active → video takes full width (`flex-1`)

### Events with NO player (skip players step):
`half_start, half_end, stoppage, end_stoppage, out, referee_ball_drop, tactical_shift, substitution, camera_on, camera_off`

### Events with 2 players (Tackle, Dribble, 50/50):
Show home panel first → then away panel sequentially in same slot.

---

## 6. COMPLETE SIDEBAR CONTEXT ENGINE

| lastEvent | Offense side | Defense side |
|---|---|---|
| half_start | new_half | new_half |
| pass | flight_o | flight_d |
| ball_receipt/reception | carry | defense |
| carry/dribble | carry | defense |
| shot | shot_flight_o | shot_flight_d |
| end_shot | carry | defense |
| ball_recovery/interception | carry | defense |
| out | loose_d | loose_o |
| stoppage | stoppage_active | stoppage_active |
| end_stoppage | restart_stoppage | restart_stoppage |
| pressure_start | pressure_active | pressure_idle |
| pressure_end | pressure_start | pressure_start |
| foul_committed | restart_foul | idle |
| own_goal_against | idle | restart_kickoff |
| default | standard | standard |

**IMPORTANT:** Initial `lastEvent` = `'default'` so Half Start appears in sidebars on first load.

**STANDARD_EVENTS includes `half_start`** (shortcut: S) — this was added in this session.

**restart_kickoff** (after own_goal_against, defense side):
- Pass E, Shot S

---

## 7. ALL EVENT QUALIFIERS — FULL DETAIL

### STOPPAGE — StoppageQualifierSteps.jsx (2-step)
Step 1 — Type: [1] Injury [2] Review [3] Other [4] Abandoned → auto-advances
Step 2 — Paused: [1] Yes [2] No → auto-confirms

### TACKLE — TackleQualifierSteps.jsx (2-step)
Step 1 — Outcome: [1] Won [2] Success → auto-advances
Step 2 — Type: [1] Dribble attempted → auto-confirms

### GK SMOTHER — GKQualifierSteps.jsx (4-step)
Type → Outcome → Kind (checkbox: Dribble attempted) → Extras (checkboxes: No touch, Nutmeg)

### GK Normal — GKQualifierSteps.jsx (3-step)
Type → Outcome → Miscommunication → auto-confirms
Save attempt → branches to GKSaveQualifierSteps (5 steps)

### PASS — PassQualifierSteps.jsx (4 steps)
Step 1 — Height: [1] Ground [2] Low [3] High
Step 2 — Body part: Right foot/Left foot/Head/Keeper arm/Drop kick/No touch/Other
Step 3 — Extras (context-dependent)
Step 4 — Technique (corner only)

**Pass Type auto-population:**
- half_start → Kick off | foul_committed → Free kick
- out sideline → Throw in | out endline → Corner/Goal kick choice
- ball_recovery → Recovery | interception → Interception | default → Open play

### SHOT — ShotQualifierSteps.jsx (3 steps + Outcome)
Step 1 — Body part | Step 2 — Technique | Step 3 — GK body state
Outcome: Post/Wayward/Out endline → auto-confirms

### FOUL — FoulQualifierSteps.jsx (3 steps)
Step 1 — Type (8 options) | Step 2 — Outcome | Step 3 — Action → auto-confirms

### CARD — inline (1 step)
Action: Yellow/Second yellow/Red → auto-confirms

### CLEARANCE — ClearanceQualifierSteps.jsx (2 steps)
Body part → Miscommunication

### DRIBBLE — DribbleQualifierSteps.jsx (2 steps)
Type: Overrun → Extras: No touch/Nutmeg

### INTERCEPTION — inline (1 step): Won/Success → auto-confirms
### MISCONTROL — inline (1 step): Regular/Aerial won → auto-confirms
### OUT — inline (1 step): Sideline/Endline → auto-confirms
### BLOCK — inline (2 steps): Type → Miscommunication
### BALL RECOVERY — dropdown: Complete/Fail
### HALF START — no qualifiers; triggers keyboard overlay 600ms → Starting XI screen
### HALF END — dropdown: None/Early Video End/Match Suspended
### SUBSTITUTION — opens SubstitutionScreen (full pitch)
### TACTICAL SHIFT — opens TacticalShiftScreen (full pitch)
### FIFTY FIFTY — dropdowns: Outcome (Won/Success) + Extra (Sliding variants)
### ERROR / END STOPPAGE / REFEREE BALL DROP / PRESSURE START/END — instant save
### OWN GOAL AGAINST — instant save → idle (offense) / restart_kickoff (defense)

---

## 8. NO_TEAM_SELECT_EVENTS
card, half_start, half_end, stoppage, own_goal_against, substitution, player_off,
error, reception, end_shot, referee_ball_drop, end_stoppage, pressure_start,
pressure_end, player_off_event, player_on_event, tactical_shift

## 9. INSTANT-SAVE EVENTS (autoConfirmEvent)
error, end_shot, referee_ball_drop, end_stoppage, pressure_start, pressure_end,
player_off_event, player_on_event

---

## 10. KEYBOARD SHORTCUTS

| Key | Event | Context |
|-----|-------|---------|
| S | Half Start | always (standard) |
| E | Pass | new_half, carry, restart_foul, restart_gk_corner, restart_stoppage, restart_kickoff |
| Q | Pass | flight_o |
| D | Dribble | carry |
| T | Miscontrol | carry, flight_o |
| W | Reception | flight_o |
| B | Block | flight_o, flight_d, shot variants, loose |
| R | Ball recovery | flight_d, loose |
| F | Clearance | flight_d, loose |
| G | Goal keeper | flight_d, defense, shot_flight_d, loose |
| G | Pressure start | pressure_start |
| G | Pressure end | pressure_active |
| A | Tackle | defense |
| V | Interception | flight_d |
| X | Foul committed | standard (always) |
| O | Out | standard (always) |
| C | Shield | standard (always) |
| S | End shot | shot_flight_o |
| Z | Shot | shot_flight_o |
| S | Shot | restart_stoppage, stoppage_active, restart_kickoff |
| 1 | Home team | team_select step |
| 2 | Away team | team_select step |
| [1]-[8] | Radio option | active qualifier step |
| ESC | Cancel event | always |
| Enter | Confirm event | qualifiers active |

---

## 11. FIRESTORE COLLECTIONS

### `events` collection
```javascript
{
  matchId, half, collectionType, eventType,
  team: 'home'|'away',
  timestamp: "7:14.960",
  videoTime: number,
  qualifiers: {
    // Pass
    passType, passHeight, passBody, passExtra, passTechnique,
    // Shot
    shotType, shotBody, shotTechnique, shotGkBodyState, shotOutcome,
    // Foul
    foulType, foulOutcome, foulAction,
    // Out
    outLocation,
    // GK standard
    gkType, gkOutcome, gkMiscommunication, gkBodyPart, gkTechnique, gkBodyState,
    // GK smother
    gkSmotherKind, gkSmotherExtras,
    // GK save attempt
    gkBodyState, gkBodyPart, gkTechnique, gkExtras, gkMiscommunicationText,
    // Clearance
    clearanceBody, clearanceMiscommunication,
    // Dribble
    dribbleType, dribbleExtras,
    // Block
    blockOutcome, blockType, blockMiscommunication,
    // Tackle
    tackleOutcome, tackleType,
    // Ball Recovery
    ballRecoveryOutcome,
    // Miscontrol
    miscontrolType,
    // Interception
    interceptionOutcome,
    // Card
    cardType,
    // Stoppage
    stoppageType, stoppagePaused,
    // Substitution
    subReason,
    // Half End
    halfEndExtra,
    // Fifty Fifty
    fiftyFiftyOutcome, fiftyFiftyExtra,
    // XY Location (when location task active)
    locationX, locationY, destinationX, destinationY,
    // Players (when players task active)
    playerHomePosition, playerHomeNumber, playerHomeName,
    playerAwayPosition, playerAwayNumber, playerAwayName,
  },
  attackingDirection: 'left_to_right'|'right_to_left',
  collectorId, collectorEmail,
  createdAt: serverTimestamp()
}
```

### `sessions` collection (NEW — activity tracking)
```javascript
{
  sessionId,          // uid_matchId_half_timestamp
  collectorId,
  collectorEmail,
  collectorName,
  matchId,
  matchName,          // "HomeTeam vs AwayTeam"
  half,
  startedAt: serverTimestamp(),
  endedAt: serverTimestamp() | null,
  activeTimeMs,       // ms of active (non-idle) time
  idleTimeMs,         // ms of idle time (no activity for 5min)
  totalTimeMs,        // wall clock session duration
  eventCount,         // events tagged in this session
  deletionCount,      // events deleted (corrections)
  eventsPerMinute,    // headline metric
  avgSecondsBetweenEvents,
  status: 'active'|'ended'
}
```

---

## 12. XY LOCATION PANEL — LocationPitchPanel.jsx

- Replaces left 50% of center area when Location task is booked
- Landscape pitch (120×80 Statsbomb coords, SVG)
- Two dot types: 🔵 Player Location, 🟠 Desired Location
- Clicking pitch places first dot → **auto-advances to next step**
- On event confirm: locationX, locationY saved to Firestore qualifiers

---

## 13. PLAYERS PANEL — PlayersPanel.jsx

- Replaces left 50% of center area when Players task step is active
- Portrait pitch grid with position boxes at Statsbomb POSITION_COORDS
- Each position shows: shirt SVG + jersey number + player first name
- Selected player = red/orange ring-2 highlight
- Unassigned positions = semi-transparent (pitch shows through)
- Grid view + List view toggle
- Clicking a shirt assigns that player to the current event
- On confirm: playerPosition, playerNumber, playerName saved to qualifiers
- For 2-player events (Tackle/Dribble/50-50): home panel first, then away panel

---

## 14. STARTING XI SCREEN — StartingXIScreen.jsx

Triggered by S key (Half Start):
1. Keyboard overlay flashes 600ms
2. Full-page overlay opens
3. **Top bar:** Formation Layout dropdown | Home/Away team toggle | formation label | Submit Changes
4. **Left panel:** Search + "+ Add player manually" + "↑ Upload roster (.xlsx/.csv)" + "↓ Download template"
5. **Center:** Portrait pitch (GREEN with white pitch lines) + position boxes with drag-and-drop
6. **Bottom:** team name + assigned count + Star XI button + Close
7. onSubmit passes (team, assignments, formation) back to CollectionActivePage
8. CollectionActivePage stores xiAssignments + xiFormation (used by Substitution + PlayersPanel)

**Roster upload (SheetJS):**
- Parses .xlsx, .xls, .csv
- Smart column detection: looks for "number/no/#/jersey" and "name/player" headers
- Fallback: col A = number, col B = name
- Merges with existing players, skips duplicates
- Shows success/error feedback
- Template download: /roster_template.xlsx

---

## 15. SUBSTITUTION SCREEN — SubstitutionScreen.jsx

Triggered by Substitution event. Full-screen overlay.
- Top: Formation Layout | 🏠 HomeTeam | ✈ AwayTeam | Submit Changes
- Left: player search + list
- Center: Substitution log (off ⊗ / on ⊕)
- Right: pitch grid with position cards
- Reason modal: [1] Tactical [2] Injury

---

## 16. TACTICAL SHIFT SCREEN — TacticalShiftScreen.jsx

Same as Substitution but no sub log — just formation change + player repositioning.

---

## 17. HAMBURGER MENU — HamburgerMenu.jsx

**Tasks:** All start unchecked. Click = toggle on/off. NO "Booked by me/other" badges. Clean radio circles only.

**Task list:** Base, Extras, Players: Home, Players: Away, Location: Home, Location: Away, Impact, Goal location, Clocks, Formation, Ball placement

**Settings:** Rows/Cols count+transparency, Pitch Color, Invert Right/Left, Show XY, Team A/B colors

---

## 18. BOTTOM STRIP — BottomStrip (inside CollectionActivePage)

- Three rows: home team, away team, Game
- Each row: team name | scrollable event pills | score box
- Event pills: dots above (completeness indicator) + event label
- Latest event = navy highlighted
- Hover on pill: shows timestamp + delete button
- Click pill: jumps video to that event's timestamp
- **Auto-scrolls right** when new event is added

---

## 19. ACTIVITY TRACKING — useActivityTracker.js + ActivityDashboard.jsx

### Hook behavior:
- Session doc created in Firestore `sessions` on CollectionActivePage mount
- Updated every 10 seconds with active/idle time, events/min
- Finalized on page unmount or browser close
- Idle threshold: 5 minutes of no keyboard/mouse activity
- `recordEvent()` called on every Firestore event save
- `recordDeletion()` called on every event deletion
- Mouse move + clicks + keyboard = activity

### Super Admin dashboard — "Collector Activity" tab:
- **Filters:** collector dropdown, match dropdown, date from/to, clear all
- **4 summary cards:** total sessions, total events, active collectors, avg events/min
- **Leaderboard table:** ranked by avg events/min — color coded green (≥8), yellow (≥4), red (<4)
  - Columns: rank, collector, sessions, events, deletions, active time, idle time, events/min, correction %
  - "Details" button → collector detail modal
- **Session log:** all sessions with status (active/ended), truncated to 50 rows
- **Collector detail modal:** score card, stats grid (6 cells), session history

**Collectors CANNOT see their own stats — admin only.**

---

## 20. SUPER ADMIN DASHBOARD — PlaceholderPages.jsx

Two tabs: **Overview** | **Collector Activity**

Overview: 3 cards (Data Collection ✅, Manager Dashboard 🔒, Org Admin 🔒)

---

## 21. DEPLOYMENT

**Web (GitHub Pages):**
```bash
npm run build
rm -rf /tmp/gh-pages-deploy && mkdir /tmp/gh-pages-deploy
cd /tmp/gh-pages-deploy
git init
git config user.email "deploy@tornado-app.com" && git config user.name "Tornado Deploy"
git remote add origin https://TOKEN@github.com/ahmedashraf-cyber/tornado-app.git
git checkout --orphan gh-pages
cp -r /home/claude/tornado-app/dist/* .
cp /home/claude/tornado-app/public/roster_template.xlsx .
git add -A && git commit -m "deploy: ..."
git push -f origin gh-pages
```

---

## 22. WHAT IS NOT YET BUILT (remaining from original list)

### HIGH PRIORITY (in order):
1. ✅ **Players task panel** — DONE
2. **Freeze Frame screen** — SKIPPED for now (complex, needs more discussion on tracking lines)
3. **Manager Dashboard** — placeholder only
4. **Org Admin page** — placeholder only
5. ✅ **User activity + performance tracking** — DONE

### MEDIUM/LOW PRIORITY:
6. **Impact & Goal Location task** — goal-frame diagram for clicking dot placement
7. **Base Events Search panel** — SKIPPED (right slide-in, event filter + timeline)
8. **PDF match report generation**
9. **Dashboard with charts and filters**
10. **Raw export (Excel/CSV)**
11. **Firestore security rules** — currently open, needs publishing in Firebase console
12. **Notifications system** — red card, match end, data ready triggers
13. **Quality Assurance mode** — buttons exist, logic not built
14. **Pressures Collection mode** — context engine built, full mode isolation not done

---

## 23. VIDEOS WATCHED — COMPLETE LIST

### All sessions (previously watched):
Starting_XI_Tag, Menu_1, Menu2, Base_Task, Pass_Tagging_1–15,
Card_Tag, Foul_Committed_Tag, Clear_Tag, Dribble_Tagging, Collected_Tagging, Error_Tag,
Goalkeeper_Against_shots_Tagging_1-1, 1-2, 2, Impact___Goal_Location, Interception_Tag,
Keeper_Sweeper_Tagging, Miscontrol_Tag_1/2/3, Out_Tag,
Player_off___on_tagging, Players, Pressure_Tag, Punch_Tagging, Referee_Ball_Drop_Tag,
Save_Tagging, Shield_Tag, Shot_Tagging_1/3/4,
Smother_Tag, Smother_tag_2, Stoppage_Tag, Substitution_Tagging, Tackle_Tagging_1/2,
Tactical_Shift_Tagging, Tagging_Own_Goal, Tagging_Referee_Ball_Drop, Tagging_Stoppage,
XY_-_Location, Tagging_Card_,
Freeze_Frame, Freeze_Frame_2, Freeze_Frame_3

### This session:
Players.mp4, Starting_XI_Tag.mp4 (re-watched), Freeze_Frame.mp4, Freeze_Frame_2.mp4, Freeze_Frame_3.mp4

---

## 24. CRITICAL RULES — NEVER FORGET

1. Events save to Firestore INSTANTLY — addDoc on confirm, no submit button ever
2. Attacking direction set ONCE per half at Half Start
3. Sidebar context driven entirely by EVENT_SEQUENCES
4. Pass Type = AUTO-POPULATED from context
5. Foul Committed = 3-step radio (NOT dropdowns)
6. Shot = 3-step multi-step + Outcome (NOT dropdowns)
7. GK = branches: save_attempt → 5-step, smother → 4-step, others → 3-step
8. Out → Loose context on BOTH sides
9. Shield HAS teams-side step
10. Qualifier strip background = #e8eef4 (NOT dark blue)
11. Sidebar group labels = plain bold colored TEXT (NOT filled badges)
12. Both teams XI required before collection starts
13. Super admin login is instant — hardcoded UID, zero Firestore wait
14. Stoppage = 2-step: Type then Paused (YES/NO)
15. Tackle = 2-step: Outcome then Type (Dribble attempted checkbox)
16. GK Smother = 4-step: Type→Outcome→Kind→Extras
17. own_goal_against → idle (offense) + restart_kickoff (defense)
18. restart_kickoff events: Pass E, Shot S
19. Task booking = clean toggle, no "Booked by me/other" system
20. Step machine = qualifiers → location → players (based on booked tasks)
21. Center area = ALWAYS 50/50 when task panel active (task left, video right)
22. Location step auto-advances after placing FIRST dot
23. Players panel: required per event type (see NO_PLAYER_EVENTS set)
24. Initial lastEvent = 'default' so Half Start shows in sidebar on load
25. HALF START is in STANDARD_EVENTS (shortcut S) — always visible
26. Collectors CANNOT see their own performance stats
27. Activity data = Super Admin only, inside "Collector Activity" tab
28. Idle threshold = 5 minutes (300,000ms)
29. Correction = event deletion only (NOT qualifier edits)
30. Videos are the law — Statsbomb PDF is always the qualifier reference
31. App is WEB ONLY — Electron removed, desktop workflow disabled

---

## 25. WORKING PROCESS — NON-NEGOTIABLE

1. Watch ALL uploaded videos before building any new tagging feature
2. Write full screen-by-screen summary, confirm with Omar
3. Build one feature at a time, deploy, verify, get approval, then next
4. Regression check after every change — state explicitly every time
5. Never ask Omar to do anything technical
6. $0 rule — always free tier only
7. Production-ready only — no TODOs, no placeholders
8. Always ask Omar for the video before building any new tagging feature
9. Statsbomb PDF is always the reference for event qualifiers
10. Always ask questions via popup forms (elicitation widget) before building
