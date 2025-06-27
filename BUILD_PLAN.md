# upVoice - Self-Executing Build Plan

## Overview
This is a comprehensive, self-executing build plan for the upVoice platform. The AI will execute this plan autonomously, building the entire application from scratch while referencing existing mockups and design specifications.

**Total Files to Create:** 79 files  
**Architecture:** React + TypeScript + Zustand + React Router + Untitled UI + Firebase (Firestore, Auth, Functions, Hosting) + Vite + PWA  
**Current Progress:** 0% (0/79 files completed)

## Execution Protocol

### Pre-Build Checklist
- [ ] Firebase project created and configured
- [ ] Node.js and npm installed
- [ ] Firebase CLI installed globally
- [ ] Git repository initialized
- [ ] Environment variables configured

### Build Rules
1. **Sequential Execution:** Complete tasks in order, respecting dependencies
2. **Validation:** Each task must pass validation before marking complete
3. **Reference Mockups:** Use existing HTML mockups as source of truth for UI
4. **Preserve Algorithms:** Implement exact propagation algorithm from specifications
5. **Type Safety:** Maintain strict TypeScript typing throughout
6. **Real-time First:** All features must support real-time synchronization

## Phase 1: Firebase & Types Foundation (12 files)

### TASK_1_1: Setup Firebase Project
**Status:** PENDING  
**Files to create:**
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `.env.example`

**Implementation Details:**
```json
// firebase.json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5173 },
    "ui": { "enabled": true }
  }
}
```

**Validation:** Firebase emulators start successfully

### TASK_1_2: Create Project Structure
**Status:** PENDING  
**Dependencies:** None  
**Files to create:**
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `index.html`

**Key Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "firebase": "^10.7.0",
    "zustand": "^4.4.7",
    "@untitled-ui/icons-react": "^0.1.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0"
  }
}
```

**Validation:** Project compiles with no errors

### TASK_1_3: Implement All Types
**Status:** PENDING  
**Dependencies:** [TASK_1_2]  
**Files to create:**
- `src/types/session.types.ts`
- `src/types/message.types.ts`
- `src/types/user.types.ts`
- `src/types/index.ts`

**Core Interfaces:**
- Session configuration with ring topology support
- Message with propagation history tracking
- Vote with normalization (0-1 to -1 to 1)
- Participant with anonymous identity management

**Validation:** All TypeScript interfaces compile, strict mode passes

## Phase 2: Firebase Services & State (8 files)

### TASK_2_1: Create Firebase Services
**Status:** PENDING  
**Dependencies:** [TASK_1_1, TASK_1_3]  
**Files to create:**
- `src/config/firebase.config.ts`
- `src/services/auth.ts`
- `src/services/session.ts`
- `src/services/messages.ts`

**Key Features:**
- Anonymous authentication flow
- Real-time Firestore subscriptions
- Optimistic updates with rollback
- Offline queue management

**Validation:** Firebase services connect and handle auth correctly

### TASK_2_2: Implement State Management
**Status:** PENDING  
**Dependencies:** [TASK_2_1]  
**Files to create:**
- `src/stores/authStore.ts`
- `src/stores/sessionStore.ts`
- `src/stores/messageStore.ts`
- `src/stores/uiStore.ts`

**Zustand Store Pattern:**
```typescript
interface SessionStore {
  session: Session | null;
  participants: Participant[];
  currentTopic: Topic | null;
  joinSession: (sessionId: string) => Promise<void>;
  subscribeToUpdates: () => void;
  // ... other methods
}
```

**Validation:** Stores handle real-time updates and sync with Firestore

## Phase 3: UI Foundation & Theme (10 files)

### TASK_3_1: Setup Untitled UI Theme
**Status:** PENDING  
**Dependencies:** [TASK_1_2]  
**Files to create:**
- `src/config/theme.ts`
- `src/styles/global.css`
- `src/styles/variables.css`

**Untitled UI Colors:**
```css
:root {
  --primary-500: #2E90FA;
  --primary-600: #1570EF;
  --gray-50: #F9FAFB;
  --gray-900: #101828;
  --success-500: #12B76A;
  --error-500: #F04438;
  /* ... complete palette */
}
```

**Validation:** Theme variables loaded, components styled correctly

### TASK_3_2: Create Base Components
**Status:** PENDING  
**Dependencies:** [TASK_3_1]  
**Files to create:**
- `src/components/common/buttons/Button.tsx`
- `src/components/common/forms/Input.tsx`
- `src/components/common/forms/Toggle.tsx`
- `src/components/common/feedback/Toast.tsx`
- `src/components/common/feedback/Loading.tsx`
- `src/components/common/navigation/NavigationBar.tsx`
- `src/components/layouts/AppShell.tsx`

**Validation:** All base components render with Untitled UI styling

## Phase 4: Core Session Components (8 files)

### TASK_4_1: Implement Voting System
**Status:** PENDING  
**Dependencies:** [TASK_2_2, TASK_3_2]  
**Files to create:**
- `src/components/session/voting/VoteSlider.tsx`
- `src/components/session/voting/VoteIndicator.tsx`
- `src/hooks/useVoting.ts`

**Slider Mechanics:**
- Touch/mouse gesture support
- Real-time color gradient (red → colorless → green)
- Yellow pin average indicator
- Haptic feedback on mobile
- Debounced updates to prevent spam

**Validation:** Slider voting works with real-time feedback and persistence

### TASK_4_2: Create Message Components
**Status:** PENDING  
**Dependencies:** [TASK_4_1]  
**Files to create:**
- `src/components/session/cards/MessageCard.tsx`
- `src/components/session/stream/MessageStream.tsx`
- `src/components/session/input/MessageComposer.tsx`
- `src/hooks/useMessageStream.ts`
- `src/hooks/useRealtimeSession.ts`

**Validation:** Message cards display correctly, real-time updates work

## Phase 5: Session Management (6 files)

### TASK_5_1: Create Session Flow
**Status:** PENDING  
**Dependencies:** [TASK_4_2]  
**Files to create:**
- `src/pages/CreateSession.tsx`
- `src/pages/JoinSession.tsx`
- `src/pages/Session.tsx`
- `src/components/session/SessionSetup.tsx`

**Validation:** Session creation and joining work end-to-end

### TASK_5_2: Implement Topic Management
**Status:** PENDING  
**Dependencies:** [TASK_5_1]  
**Files to create:**
- `src/components/session/TopicTransition.tsx`
- `src/components/session/CountdownTimer.tsx`

**Topic Transition Features:**
- 30-60 second countdown with visual/audio cues
- "You can vote but not write" during transition
- Smooth animation to new topic
- Participant notification system

**Validation:** Topic transitions work with countdown and notifications

## Phase 6: Moderation Interface (8 files)

### TASK_6_1: Create Moderator Dashboard
**Status:** PENDING  
**Dependencies:** [TASK_5_2]  
**Files to create:**
- `src/pages/ModeratorView.tsx`
- `src/components/moderation/dashboard/ModeratorDashboard.tsx`
- `src/components/moderation/controls/SessionControls.tsx`
- `src/components/moderation/dashboard/SessionStats.tsx`

**Dashboard Features:**
- Real-time participation metrics
- Topic control with timer management
- Session pause/resume/end controls
- Participant activity monitoring

**Validation:** Moderator can control session, view stats, manage participants

### TASK_6_2: Implement Ghost Views
**Status:** PENDING  
**Dependencies:** [TASK_6_1]  
**Files to create:**
- `src/components/moderation/GhostViewer.tsx`
- `src/components/moderation/SynthetronStream.tsx`
- `src/components/moderation/ParticipantMonitor.tsx`
- `src/hooks/useModeratorInsights.ts`

**Ghost View Algorithm:**
- Select 4-6 random participant screens
- Update every 30-60 seconds
- Show current message and voting state
- Flag inactive or stuck participants

**Validation:** Moderator can view participant screens and viral messages

## Phase 7: AI Analysis Integration (6 files)

### TASK_7_1: Implement AI Analysis
**Status:** PENDING  
**Dependencies:** [TASK_6_2]  
**Files to create:**
- `src/services/ai.ts`
- `src/components/analysis/InsightExplorer.tsx`
- `src/components/analysis/QueryInterface.tsx`
- `src/hooks/useAIInsights.ts`

**AI Features:**
- Theme extraction and clustering
- Sentiment analysis over time
- Natural language query interface
- Actionable recommendations

**Validation:** AI analysis generates insights, natural query works

### TASK_7_2: Create Results Dashboard
**Status:** PENDING  
**Dependencies:** [TASK_7_1]  
**Files to create:**
- `src/pages/SessionResults.tsx`
- `src/components/analysis/ResultsDashboard.tsx`

**Validation:** Post-session analysis shows comprehensive insights

## Phase 8: Organization & Admin Features (7 files)

### TASK_8_1: Implement Organization Management
**Status:** PENDING  
**Dependencies:** [TASK_7_2]  
**Files to create:**
- `src/pages/OrganizationDashboard.tsx`
- `src/components/admin/TeamManagement.tsx`
- `src/components/admin/SessionHistory.tsx`
- `src/services/organization.ts`

**Validation:** Organizations can manage teams and view historical data

### TASK_8_2: Create Admin Features
**Status:** PENDING  
**Dependencies:** [TASK_8_1]  
**Files to create:**
- `src/components/admin/UserManagement.tsx`
- `src/components/admin/AccessControls.tsx`
- `src/pages/AdminPanel.tsx`

**Validation:** Admins can manage users and set permissions

## Phase 9: Cloud Functions & Backend (8 files)

### TASK_9_1: Implement Cloud Functions
**Status:** PENDING  
**Dependencies:** [TASK_4_2]  
**Files to create:**
- `functions/src/index.ts`
- `functions/src/triggers/onMessageCreate.ts`
- `functions/src/triggers/onVoteCreate.ts`
- `functions/src/utils/propagation.ts`

**Propagation Algorithm:**
```typescript
// Core algorithm from specifications
function calculatePropagation(vote: Vote, message: Message): PropagationEvent[] {
  const threshold = getThreshold(message.propagationHistory.length);
  if (vote.normalizedScore >= threshold) {
    return selectNeighbors(vote.participantId, message);
  }
  return [];
}
```

**Validation:** Message propagation works correctly

### TASK_9_2: Create Analytics Functions
**Status:** PENDING  
**Dependencies:** [TASK_9_1]  
**Files to create:**
- `functions/src/scheduled/generateReports.ts`
- `functions/src/api/analyzeSession.ts`
- `functions/src/api/exportData.ts`
- `functions/src/utils/analytics.ts`

**Validation:** Analytics generate correctly, data export works

## Phase 10: Mobile PWA & Performance (6 files)

### TASK_10_1: Optimize Mobile Experience
**Status:** PENDING  
**Dependencies:** [TASK_4_2, TASK_6_1]  
**Files to create:**
- `src/components/mobile/MobileSessionView.tsx`
- `src/components/mobile/MobileModeratorView.tsx`
- `src/hooks/useGestures.ts`

**Mobile Optimizations:**
- Touch-optimized interactions
- Swipe gestures for card navigation
- Responsive layouts for all screen sizes
- 60fps animations on mobile devices

**Validation:** Mobile experience is smooth, gestures work correctly

### TASK_10_2: Implement PWA Features
**Status:** PENDING  
**Dependencies:** [TASK_10_1]  
**Files to create:**
- `public/manifest.json`
- `src/utils/serviceWorker.ts`
- `src/hooks/useOffline.ts`

**PWA Features:**
- Installable on mobile devices
- Offline message queue
- Background sync
- Push notifications (optional)

**Validation:** App installs as PWA, works offline

## Phase 11: Testing & Deployment (8 files)

### TASK_11_1: Create Test Suite
**Status:** PENDING  
**Dependencies:** [TASK_10_2]  
**Files to create:**
- `tests/unit/components/MessageCard.test.tsx`
- `tests/unit/hooks/useVoting.test.ts`
- `tests/integration/sessionFlow.test.ts`
- `tests/e2e/userJourneys.test.ts`

**Test Coverage:**
- Unit tests for all components
- Integration tests for flows
- E2E tests for user journeys
- Performance benchmarks

**Validation:** All tests pass, coverage >80%

### TASK_11_2: Setup Deployment
**Status:** PENDING  
**Dependencies:** [TASK_11_1]  
**Files to create:**
- `.github/workflows/deploy.yml`
- `scripts/build.sh`
- `scripts/deploy.sh`
- `docs/deployment.md`

**Deployment Pipeline:**
- GitHub Actions CI/CD
- Automated testing
- Firebase hosting deployment
- Function deployment

**Validation:** Deployment pipeline works, app deploys successfully

## Validation Checkpoints

### After Each Task:
- [ ] TypeScript compiles without errors
- [ ] Firebase emulator connects successfully
- [ ] Component renders without errors
- [ ] Real-time sync works correctly

### After Each Phase:
- [ ] Run existing tests
- [ ] Verify core functionality
- [ ] Validate against mockups
- [ ] Check mobile performance (60fps)

### Final Validation:
- [ ] Complete session flow works end-to-end
- [ ] Propagation algorithm matches specifications
- [ ] Anonymous authentication maintains privacy
- [ ] Multi-device synchronization works
- [ ] All user journeys complete successfully

## Progress Tracking

**Total Progress:** 0/79 files (0%)  
**Current Phase:** Phase 1 - Firebase & Types Foundation  
**Current Task:** TASK_1_1 - Setup Firebase Project  
**Next Action:** Create firebase.json with emulator configuration

---

## Execution Log

### [Timestamp] - Starting Build
- Initialized build plan
- Ready to execute TASK_1_1

*[Build execution will be logged here as tasks complete]*