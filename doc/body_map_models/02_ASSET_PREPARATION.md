# Phase 2: Asset Preparation

## 🎨 Goal
Prepare the visual assets required for the `AdvancedBodyMap` component.

## 📝 Tasks for AI Agent

### If choosing SVG Approach (Custom or Library):
1.  **Source Assets**:
    -   Find open-source anatomical SVGs (e.g., Wikimedia Commons, Gray's Anatomy plates converted to SVG).
    -   *Alternative*: Use a tool like Adobe Illustrator or Inkscape to trace muscle groups from reference images.
2.  **Optimization**:
    -   Clean up paths using `svgo`.
    -   Ensure every selectable part has a unique `id` (e.g., `id="muscle-biceps-left"`).
    -   Group related parts if necessary (e.g., `id="group-arm-left"`).
3.  **Metadata Mapping**:
    -   Create a JSON file mapping IDs to display names.
    -   Example:
        ```json
        {
          "muscle-biceps-left": "Left Biceps",
          "muscle-rectus-abdominis": "Abs"
        }
        ```

### If choosing 3D Approach:
1.  **Source Model**:
    -   Find a low-poly human mesh (GLTF/GLB format).
    -   Ensure UV unwrapping allows for texture highlighting.
2.  **Optimization**:
    -   Compress textures (WebP).
    -   Draco compression for geometry.

## 📦 Deliverable
-   `assets/body-map/` folder containing:
    -   `body-front.svg` / `body-back.svg` (or 3D models)
    -   `anatomy-mapping.json`
