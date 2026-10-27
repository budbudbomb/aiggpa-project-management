# Implementation Plan: Subtask Type Selection & Meeting Details Modal

## Overview
Port the upstream feature from `main` (commit `d643500`) into the modern React/TypeScript/Tailwind architecture on `feature/project-management-react`.

## Changes Summary

### 1. Type Definitions & Store Architecture
- [x] Extend `Subtask` in `src/stores/types.ts` with `type`, `meetingUrl`, `meetingDuration`, `meetingDescription`, `surveyId`.
- [x] Extend `TaskChecklistItem` in `src/stores/activityTaskStore.ts` with `type`, `meetingUrl`, `meetingDuration`, `meetingDescription`, `surveyId`.
- [x] Update `addSubtask` in `src/stores/projectStore.ts` to persist all new attributes.
- [x] Add `addChecklistItem` and `deleteChecklistItem` in `src/stores/activityTaskStore.ts` with timeline logging.

### 2. Components to Build & Modify
- [x] Create `src/pages/activities/SubtaskMeetingDetailsModal.tsx`
  - Reusable modal dialog with Meeting URL, Duration select, Agenda textarea.
  - Modern Tailwind styling adhering to AIGGPA guidelines (crisp borders, neutral slate, no purple).
- [x] Update `src/pages/activities/CreateTaskModal.tsx`
  - Added Type Pills: `📌 Standard`, `📋 Survey`, `📅 Meeting`.
  - Dynamic input controls based on active pill.
  - Subtask meeting configuration trigger with visual feedback ("Meeting Configured ✓").
  - Enhanced subtask list preview showing badges, duration, and metadata.
- [x] Update `src/pages/activities/TaskDetailsModal.tsx`
  - Render typed subtask badges with interactive quick-actions.
  - "Join Meeting" 1-click button for meeting subtasks with URL.
  - In-modal subtask creation with type pill selector and meeting details modal.
- [x] Update `src/pages/ActivitiesPage.tsx` & `src/pages/activities/TaskCard.tsx`
  - Visual indicator badges for tasks containing meeting or survey subtasks.

### 3. Verification & Testing
- [x] Verify TypeScript build (`npm run build` - 0 errors).
- [x] Verify lint and typecheck (`npm run lint` - 0 errors).

