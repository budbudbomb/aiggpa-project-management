# Implementation Plan: Project Management Stepper Tabs (General, Budget, Assignee)

## Overview
Reorganize the Project Create & Edit workflow into a cohesive 3-step Stepper Tab architecture (General Details, Budget Allocation, Team Assignees), mirroring the high-polish design pattern from `CreateSurveyPage.tsx` and embedding Budget and Assignee inline directly within the page.

## Changes Summary

### 1. Styles & Stepper Design System
- [x] Add `.project-stepper-box`, `.project-step-tab`, `.project-step-num`, and `.project-step-info` styles to `src/styles/create-project.css`.
- [x] Provide 3-column responsive grid layout with `#1e3a8a` / `#2563eb` active state accents and green `#059669` completion badges.
- [x] Add clean container styling for the embedded Assignee card view (`.project-assignee-card`).

### 2. State & Tab Architecture in `CreateProjectPage.tsx`
- [x] Introduce `activeTab: 'general' | 'budget' | 'assignee'` state synchronized with URL search params (`tab=general|budget|assignee`).
- [x] Maintain seamless switching across tabs with step validation and completed step checks.
- [x] Update header title and subtitle dynamically according to current active tab.

### 3. Inline Tab Views Integration
- [x] **Tab 1 - General Details**: Existing Project Details form (`#viewCreateProject`) with "Save & Continue to Budget" button.
- [x] **Tab 2 - Budget Allocation**: Budget head calculator and hierarchical tree table (`#viewAddBudget`) with "Back to General" and "Next: Team Assignees" controls.
- [x] **Tab 3 - Team Assignees**: Inline `#viewAssignees` card with project selector, designation dropdown, employee multi-select menu, allocations table, and save button.

### 4. Master List Quick-Access Linking
- [x] Wire table "Edit" action to open Tab 1 (General).
- [x] Wire table "Budget" icon action to open Tab 2 (Budget) with project pre-selected.
- [x] Wire table "Assignees" avatar badges to open Tab 3 (Assignee) with project pre-selected.

### 5. Verification & Testing
- [x] Verify TypeScript types and build (`npm run lint` & `npm run build` - 0 errors).
- [x] Verify tab switching, validation guards, and data persistence across tabs.

