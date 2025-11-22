# Phase 3: Component Implementation

## 💻 Goal
Build the `AdvancedBodyMap` component that consumes the prepared assets and handles user interaction.

## 🛠️ Technical Specs

### Component Signature
```typescript
interface AdvancedBodyMapProps {
    selectedParts: string[]; // Array of IDs
    onSelect: (partId: string) => void;
    gender?: 'male' | 'female'; // Optional: load different assets
    view?: 'front' | 'back'; // Toggle view
    className?: string;
}
```

### Key Features to Implement
1.  **Zoom & Pan**:
    -   Allow users to zoom in for fine-grained selection (crucial for mobile).
    -   Use `react-zoom-pan-pinch` or similar wrapper.
2.  **Smart Highlighting**:
    -   Hover state: Slight glow or color shift.
    -   Selected state: Solid fill with high contrast color (Medical Blue).
3.  **Tooltip/Label**:
    -   Show the name of the muscle/organ on hover (floating cursor label).
4.  **Multi-Select**:
    -   Toggle selection logic (add/remove from array).

## 📝 Tasks for AI Agent
1.  Scaffold `components/organisms/AdvancedBodyMap.tsx`.
2.  Implement the rendering logic (SVG loader or 3D canvas).
3.  Add interaction handlers (`onClick`, `onMouseEnter`, `onMouseLeave`).
4.  Integrate the `anatomy-mapping.json` for accessible labels.
