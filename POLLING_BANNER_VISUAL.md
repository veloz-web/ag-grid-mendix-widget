# Polling Banner - Visual Reference

## 🎨 What It Looks Like

```
┌─────────────────────────────────────────────────────────────────────┐
│ AGGRID CONTAINER                                                    │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ℹ  3 new records available    [🔄 Refresh Now]  [Dismiss]      │ │ 
│ │ ← Purple gradient background, white text, animated             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ TOOLBAR (View selector, search, filters...)                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ AG GRID (Data rows...)                                          │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 📱 Mobile View

```
┌───────────────────────────────┐
│ ℹ  5 new records available   │
│                               │
│    [🔄 Refresh Now]           │
│    [Dismiss]                  │
│   (Buttons stack vertically) │
└───────────────────────────────┘
```

## 🎬 Animation Sequence

```
Step 1: New data detected
   ↓
Step 2: Banner slides down from top (0.3s)
   ↓
Step 3: Info icon pulses (every 2s)
   ↓
Step 4: User hovers button → lifts up with shadow
   ↓
Step 5: User clicks "Refresh" → Data updates
   ↓
Step 6: Banner slides up and disappears
```

## 🎨 Color Palette

### Banner
- **Background:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Text:** `white`
- **Border:** `rgba(255, 255, 255, 0.2)` (3px bottom)

### Refresh Button
- **Default:** White background, purple text (`#667eea`)
- **Hover:** Light gray (`#f8f9fa`), lifts 1px
- **Shadow:** `0 4px 12px rgba(0, 0, 0, 0.2)` on hover

### Dismiss Button
- **Default:** `rgba(255, 255, 255, 0.2)` glass effect
- **Hover:** `rgba(255, 255, 255, 0.3)`
- **Text:** White

## 📐 Spacing & Layout

```
Banner Container:
├─ Padding: 12px 16px
├─ Sticky positioning (always at top)
├─ Z-index: 1000 (above everything)
└─ Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

Inner Content:
├─ Flex layout: space-between
├─ Max-width: 1400px (centered)
├─ Gap: 16px between elements
└─ Wraps on small screens

Icon:
├─ Size: 20px
├─ Margin-right: 8px
└─ Animated pulse (2s infinite)

Message:
├─ Flex: 1 (takes available space)
├─ Font: 14px, weight 500
└─ Min-width: 200px

Buttons:
├─ Padding: 6px 14px
├─ Font: 13px, weight 600
├─ Border-radius: 6px
├─ Gap: 8px between buttons
└─ Icon + text with 6px gap
```

## 🔔 Behavior States

### State 1: Normal Operation (No Banner)
```
hasNewData: false
┌─────────────────────┐
│ [Toolbar]           │
│ [Grid Data]         │
└─────────────────────┘
✓ Polling active (every 30s)
```

### State 2: New Data Detected (Banner Shown)
```
hasNewData: true
┌─────────────────────┐
│ [BANNER] ← Visible  │
│ [Toolbar]           │
│ [Grid Data]         │
└─────────────────────┘
✗ Polling paused
```

### State 3: After Refresh (Banner Hidden)
```
hasNewData: false (after refresh)
┌─────────────────────┐
│ [Toolbar]           │
│ [Grid Data] ← New!  │
└─────────────────────┘
✓ Polling resumed
```

## 🎯 User Interaction Flow

```
┌─────────────────────────────────────────────┐
│ 1. User sees banner:                        │
│    "3 new records available"                │
│                                             │
│ 2. User has two choices:                    │
│    ┌─────────────┐   ┌──────────┐          │
│    │ Refresh Now │   │ Dismiss  │          │
│    └─────────────┘   └──────────┘          │
│         │                  │                │
│         v                  v                │
│    Apply new          Hide banner          │
│    data to grid       Keep old data        │
│    Hide banner        Resume polling       │
│    Resume polling                          │
└─────────────────────────────────────────────┘
```

## 💬 Text Variations

```typescript
1 new record available     // Singular
2 new records available    // Plural
5 new records available    // Plural
10 new records available   // Plural
```

## 🔧 CSS Classes Used

```css
.aggrid-refresh-banner              /* Main container */
.aggrid-refresh-banner-content      /* Inner flex container */
.aggrid-refresh-banner-message      /* Text message */
.aggrid-refresh-banner-actions      /* Button container */
.glyphicon-info-sign               /* Info icon */
.glyphicon-refresh                 /* Refresh icon */
.btn                               /* Base button */
.btn-primary                       /* Refresh button */
.btn-default                       /* Dismiss button */
```

## 📊 Technical Specs

- **Position:** `sticky`, `top: 0`
- **Z-index:** `1000`
- **Animation:** `slideDown` 0.3s ease-out
- **Pulse:** 2s ease-in-out infinite
- **Breakpoint:** 600px (mobile)
- **Max-width:** 1400px (content)
- **Transition:** 0.2s ease (all buttons)

## 🎁 Bonus Features

✓ Accessible tooltips on buttons  
✓ Smooth hover transitions  
✓ Icon animations  
✓ Responsive flex layout  
✓ Glass-morphism effects  
✓ Proper pluralization  
✓ High contrast for visibility  

---

**Result:** A professional, modern notification system that users will love! 🎉
