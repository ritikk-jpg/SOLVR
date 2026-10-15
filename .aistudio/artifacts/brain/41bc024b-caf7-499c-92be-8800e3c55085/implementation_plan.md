# Mobile Ergonomics & Map System Overhaul for SOLVR

Fix mobile layout clutter, eliminate overlapping floating elements, and ensure robust Google Maps rendering with an automatic interactive vector radar fallback in SOLVR.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1 Clarification:**
> - **Screen Real Estate & Clutter Elimination**: **Tabbed Interface separating Map View and Task List** on mobile viewports. Replaces the cramped triple-stacked floating drawers with dedicated full-viewport Map view and dedicated scrollable Task Feed views.
> - **Map Reliability & Fallbacks**: **Google Maps with automatic fallback to interactive Delhi Vector Radar**. Supplies the mandatory `mapId="DEMO_MAP_ID"` to satisfy `AdvancedMarkerElement` requirements and automatically switches to the vector radar if Google Maps encounters script/network/quota errors in mobile previews.
> - **Role Navigation on Mobile**: **Compact dropdown sheet in the top header**. Consolidates the four role buttons into a single 40px dropdown pill on mobile screens, strictly obeying the $\le 15\%$ sticky surface budget.

---

### 1. Overview & Core Concept

**Problem**: On smartphone viewports and mobile preview frames (375px–430px wide), the current UI stacks multiple competing layers on top of each other:
1. Multi-role header with 4 wide pills + brand + wallet.
2. Floating hub selector + role toggle pill + search input bar.
3. Nested Tactical Map header with another title, badge, mode switch, and filters.
4. Floating bottom action sheet in peek/expanded mode.
5. Floating 4-tab bottom navigation bar.

Simultaneously, Google Maps fails to initialize because `<AdvancedMarker>` is called without a valid `mapId` on `@vis.gl/react-google-maps` `<Map>`, causing a fatal API error that leaves the map blank or unresponsive.

**Solution**:
1. **Ergonomic Mobile Tab Architecture**: Use the bottom navigation bar (`Map` vs `Tasks/Feed` vs `Wallet` vs `Profile`) to give the Map 100% of the mobile viewport, while the Task List gets a dedicated, distraction-free scrollable view with full search, filters, task cards, and social sharing.
2. **Resilient Map Engine**: Supply `mapId="DEMO_MAP_ID"`, attach `internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}`, and implement an automatic load error detector that gracefully falls back to the interactive Delhi Vector Radar if Google Maps is blocked in preview.
3. **Compact Top App Bar**: Replace horizontal role-pill overflow with a clean, single-touch Role Dropdown in the header.

---

### 2. User Experience & Visual Design

#### A. Mobile Viewport Layout & Ergonomics
- **Sticky Surface Governance ($\le 15\%$ Viewport Height)**:
  - Top Header: Fixed 52px height (`bg-[#EBF5EE]/95 backdrop-blur-md border-b-2 border-black`).
  - Bottom Tab Bar: 60px height with safe-area insets (`pb-[env(safe-area-inset-bottom)]`).
  - Total sticky height = ~112px on an 844px iPhone frame (~13.2%), leaving over 86% of vertical space open for map exploration or task interaction.
- **Dedicated View Transitions**:
  - **Map Tab (Active)**: Full-viewport Delhi map with a single floating quick-action pill for the currently selected task and dispatch hub switcher.
  - **Active / Tasks Tab**: Full scrollable feed with search input, Delhi district filters, task cards with claim buttons, and volunteer social sharing modals.
  - **Wallet & Profile Tabs**: Clean modal overlays for UPI payouts and volunteer stats.

#### B. Component Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Header: [SOLVR Brand]  —  [Compact Role Dropdown]  —  [Stats]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [IF MAP TAB ACTIVE]                  [IF TASKS TAB ACTIVE]  │
│  ┌───────────────────────────┐        ┌────────────────────┐ │
│  │ Google Maps API Provider  │        │ Search & Filters   │ │
│  │ (mapId="DEMO_MAP_ID")     │        │ ────────────────── │ │
│  │       │                   │        │ Delhi Task Cards   │ │
│  │   [Auto Fallback]         │        │ - Pothole Repair   │ │
│  │       ▼                   │        │ - Food Rescue      │ │
│  │ Interactive Delhi Radar   │        │ - MCD Sanitation   │ │
│  │ (Vector Grid + GPS Pins)  │        │ [Share] [Claim]    │ │
│  └───────────────────────────┘        └────────────────────┘ │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Bottom Nav: [ 🧭 Map ]   [ ⚡ Tasks ]   [ 👛 Wallet ]   [ 👤 Profile ] │
└──────────────────────────────────────────────────────────────┘
```

#### C. Color Tokens & Neobrutalist Theme
- **Canvas**: Soft Pastel Mint `#EBF5EE`
- **Surface**: Pure White `#FFFFFF` with 2px solid `#09090B` borders
- **Highlights**: Hazard Yellow `#FACC15` (Civic / Urgency), Console Green `#4ADE80` (Actions / Food), Municipal Crimson `#DC2626` (Critical)
- **Typography**: `Plus Jakarta Sans` for titles/UI, `JetBrains Mono` / `tabular-nums` for distances and metrics.

---

### 3. Key Technical Decisions & Map Resilience Strategy

#### Decision 1: Google Maps Initialization & Error Recovery
- **Root Cause of Map Failure**: `@vis.gl/react-google-maps` requires a `mapId` parameter on `<Map>` when rendering `<AdvancedMarker>`. Without it, Google Maps JavaScript API rejects marker creation with a console error and freezes the canvas.
- **Solution**:
  1. Add `mapId="DEMO_MAP_ID"` to the `<Map>` element in `TacticalMap.tsx`.
  2. Add `internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}` to comply with Google Maps Platform standards.
  3. Wrap the map loader in a stateful health check. If Google Maps API fails to load within 3.5 seconds or triggers an auth/quota event, automatically toggle `mapMode` to `'grid'` (the high-performance interactive Delhi Vector Radar) with a visible one-tap switcher.

#### Decision 2: Elimination of Overlapping UI Sheets
- **Root Cause of Clutter**: Both `WorkerActionSheet` and `TacticalMap`'s internal headers were rendering simultaneously along with `WorkerFullShell`'s floating hub picker, floating role switcher, floating search bar, and `StreamlinedBottomNav`.
- **Solution**:
  1. De-duplicate headers: Strip inner headers out of `TacticalMap` when in mobile view.
  2. Streamline `WorkerActionSheet`: Make it a lightweight bottom floating card when a task is selected on the map, rather than an omnipresent sheet that obscures the radar.
  3. Seamless Tab Switching: When the user taps a task pin on the Map, show a compact thumb-friendly action card; tapping "View Details" or switching to the "Tasks" bottom nav tab opens the full dedicated task list without cluttering the map.

#### Decision 3: Compact Mobile Header Role Selector
- **Implementation**: Instead of rendering 4 text buttons side-by-side in `<Header>`, on screens `< 768px`, render an interactive pill showing the current role (e.g. `🔧 Worker ▾`). Tapping it slides down a clean, accessible role menu with instant role switching (`Worker`, `Courier`, `Donor`, `Dispatch`).

---

### 4. Verification Plan

1. **Mobile Preview Verification**:
   - Check layout on viewport widths 360px, 390px, and 414px.
   - Verify header height remains $\le 56px$ without text wrapping or horizontal overflow.
   - Verify bottom navigation bar stays pinned without blocking content or conflicting with action cards.
2. **Google Maps & Vector Radar Verification**:
   - Verify `<Map>` renders with `mapId="DEMO_MAP_ID"` and markers render correctly on Connaught Place, Nehru Place, and Saket.
   - Verify switching between Google Maps and Delhi Tactical Vector Radar is instantaneous.
   - Verify quota/offline fallback automatically routes to Vector Radar without breaking the app.
3. **Build & Lint Verification**:
   - Run `compile_applet` and `lint_applet` to confirm zero TypeScript errors and clean compilation.
