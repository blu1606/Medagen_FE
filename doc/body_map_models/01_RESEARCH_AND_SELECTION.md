# Phase 1: Research & Selection

## 📋 Requirements
-   **High Resolution**: Must look good on high-DPI screens.
-   **Responsiveness**: Must adapt to mobile and desktop layouts.
-   **Granularity**: Ability to select specific muscles (e.g., "Upper Trapezius" vs just "Shoulder").
-   **Lightweight**: Avoid >5MB payloads for a simple selector.

## 🔍 Options Analysis

### Option A: Advanced SVG (Recommended for 2D)
-   **Concept**: Use a high-detail SVG with named groups (`<g id="biceps">`).
-   **Pros**: Extremely lightweight, infinite scaling, easy to style with CSS/Tailwind.
-   **Cons**: "Flat" look unless heavily shaded.
-   **Reference**: `@mjcdev/react-body-highlighter` uses this approach.

### Option B: Interactive 3D (Three.js / React Three Fiber)
-   **Concept**: Load a `.glb` model of the human body. Raycasting for clicks.
-   **Pros**: "Wow" factor, 360-degree rotation, zoom.
-   **Cons**: Heavy initial load, complex implementation, potential performance hit on mobile.
-   **Reference**: BioDigital, Z-Anatomy.

### Option C: Image Map / Sprites
-   **Concept**: High-res rendered images with an invisible SVG overlay for click detection.
-   **Pros**: Photorealistic look possible.
-   **Cons**: Hard to handle "hover" states (need multiple images or complex masking).

## 🚀 Action Plan for AI Agent
1.  **Evaluate `@mjcdev/react-body-highlighter`**:
    -   Check if it supports custom SVGs or if the built-in model is detailed enough.
    -   *Task*: Install and prototype in a sandbox page.
2.  **Investigate "MuscleWiki" Style**:
    -   They use layered SVGs. This is likely the best balance of performance and aesthetics.
3.  **Decision**:
    -   If `@mjcdev/react-body-highlighter` is customizable enough -> **Use it**.
    -   If not -> **Build custom SVG component** using high-quality anatomical vector assets.
