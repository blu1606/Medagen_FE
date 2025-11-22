# Body Map Model Upgrade Strategy

## Overview
This document outlines the strategy for upgrading the current basic `BodyMapSelector` to a high-fidelity, interactive anatomical model. The goal is to achieve a professional look and feel similar to Z-Anatomy or BioDigital, while maintaining the ease of use of a React component.

## 🎯 Objectives
1.  **Visual Fidelity**: Move from simple SVG paths to detailed anatomical representations.
2.  **Interactivity**: Precise hover, click, and selection states for specific muscle groups and organs.
3.  **Performance**: Ensure smooth rendering and interaction, avoiding heavy 3D loads if possible, or optimizing them if used.
4.  **Usability**: Clear visual feedback for selected areas (pain points).

## 🗺️ Roadmap

### [Phase 1: Research & Selection](./01_RESEARCH_AND_SELECTION.md)
*   **Goal**: Determine the best technical approach (SVG vs. Canvas vs. 3D/Three.js).
*   **Output**: Selected library or asset pack and a proof-of-concept plan.

### [Phase 2: Asset Preparation](./02_ASSET_PREPARATION.md)
*   **Goal**: Acquire or generate the necessary visual assets (SVG paths, 3D models, or sprite sheets).
*   **Output**: A library of optimized assets ready for integration.

### [Phase 3: Component Implementation](./03_COMPONENT_IMPLEMENTATION.md)
*   **Goal**: Build the `AdvancedBodyMap` component.
*   **Output**: A fully functional React component with props for `selectedParts`, `onSelect`, `gender`, etc.

### [Phase 4: Integration & Polish](./04_INTEGRATION.md)
*   **Goal**: Replace the old selector in `WizardIntake` and refine animations.
*   **Output**: Seamless integration into the main app flow.

## 📂 Directory Structure
All documentation and assets related to this upgrade will be housed in `doc/body_map_models`.
