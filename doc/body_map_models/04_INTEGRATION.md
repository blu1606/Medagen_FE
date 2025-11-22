# Phase 4: Integration

## 🔄 Goal
Replace the existing placeholder `BodyMapSelector` with the new `AdvancedBodyMap` in the `WizardIntake` flow.

## 📝 Tasks for AI Agent
1.  **Update `WizardIntake.tsx`**:
    -   Import `AdvancedBodyMap`.
    -   Add a toggle for "Front View" / "Back View".
    -   Ensure the `bodyParts` state in `WizardIntake` matches the IDs used by the new map.
2.  **Data Migration**:
    -   If the old map used simple IDs ("arm") and the new one uses complex ones ("biceps_left"), create a utility to map/group them if needed for the backend/AI prompt.
    -   *Recommendation*: Send the detailed IDs to the AI; it gives better context.
3.  **Testing**:
    -   Verify selection works on mobile (touch targets).
    -   Verify zoom/pan feels natural.
    -   Check performance (no lag on toggle).

## 🏁 Definition of Done
-   User can rotate/flip the model (Front/Back).
-   User can select specific muscles.
-   Selection persists when navigating wizard steps.
-   "Emergency" flow remains unaffected.
