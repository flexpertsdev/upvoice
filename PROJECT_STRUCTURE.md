# upVoice Project Structure

```
upvoice/
├── .env.example                    # Environment variables template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore patterns
├── .prettierrc                     # Prettier code formatting
├── firebase.json                   # Firebase configuration
├── firestore.indexes.json          # Firestore composite indexes
├── firestore.rules                 # Firestore security rules
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── index.html                      # PWA entry point
├── README.md                       # Project documentation
│
├── src/                            # Source code
│   ├── main.tsx                    # React app entry point
│   ├── App.tsx                     # Root app component
│   ├── vite-env.d.ts              # Vite TypeScript definitions
│   │
│   ├── components/                 # React components
│   │   ├── session/               # Session-related components
│   │   │   ├── cards/
│   │   │   │   ├── MessageCard.tsx          # Swipeable message card
│   │   │   │   ├── CardStack.tsx            # Card stack manager
│   │   │   │   └── SwipeIndicator.tsx       # Visual swipe feedback
│   │   │   ├── stream/
│   │   │   │   ├── MessageStream.tsx        # Time machine message flow
│   │   │   │   ├── StreamControls.tsx       # Navigation controls
│   │   │   │   └── MessageBubble.tsx        # Individual message display
│   │   │   ├── input/
│   │   │   │   ├── MessageComposer.tsx      # Message input interface
│   │   │   │   ├── VoiceRecorder.tsx        # Voice message recording
│   │   │   │   └── QuickResponses.tsx       # Suggested responses
│   │   │   └── voting/
│   │   │       ├── VoteGesture.tsx          # Swipe gesture handler
│   │   │       ├── VoteVisualizer.tsx       # Vote intensity display
│   │   │       └── VotingStats.tsx          # Voting statistics
│   │   │
│   │   ├── moderation/            # Moderator components
│   │   │   ├── dashboard/
│   │   │   │   ├── ModeratorDashboard.tsx   # Main moderator view
│   │   │   │   ├── SessionStats.tsx         # Live session metrics
│   │   │   │   └── ParticipantList.tsx     # Active participants
│   │   │   ├── controls/
│   │   │   │   ├── SessionControls.tsx      # Start/stop/pause
│   │   │   │   ├── TopicManager.tsx         # Topic guidance
│   │   │   │   └── ObserverMode.tsx         # Observer settings
│   │   │   └── messages/
│   │   │       ├── ProberComposer.tsx       # Prober message creator
│   │   │       ├── ModeratorMessage.tsx     # Branded messages
│   │   │       └── SuperMessage.tsx         # Random distribution
│   │   │
│   │   ├── analysis/              # AI analysis components
│   │   │   ├── insights/
│   │   │   │   ├── InsightExplorer.tsx      # Browse AI insights
│   │   │   │   ├── ThemeCluster.tsx         # Theme visualization
│   │   │   │   └── SentimentFlow.tsx        # Sentiment over time
│   │   │   ├── queries/
│   │   │   │   ├── QueryInterface.tsx       # Natural language input
│   │   │   │   ├── QuerySuggestions.tsx     # Suggested queries
│   │   │   │   └── QueryResults.tsx         # Query response display
│   │   │   └── visualizations/
│   │   │       ├── DataVisualizer.tsx       # Chart renderer
│   │   │       ├── WordCloud.tsx            # Keyword visualization
│   │   │       └── NetworkGraph.tsx         # Influence mapping
│   │   │
│   │   ├── common/                # Shared components
│   │   │   ├── buttons/
│   │   │   │   ├── Button.tsx               # Base button component
│   │   │   │   ├── IconButton.tsx           # Icon-only button
│   │   │   │   └── FloatingActionButton.tsx # FAB component
│   │   │   ├── forms/
│   │   │   │   ├── Input.tsx                # Text input field
│   │   │   │   ├── Select.tsx               # Dropdown select
│   │   │   │   └── Toggle.tsx               # Toggle switch
│   │   │   ├── feedback/
│   │   │   │   ├── Toast.tsx                # Toast notifications
│   │   │   │   ├── Loading.tsx              # Loading states
│   │   │   │   └── ErrorBoundary.tsx        # Error handling
│   │   │   └── navigation/
│   │   │       ├── NavigationBar.tsx        # Top navigation
│   │   │       ├── TabBar.tsx               # Bottom tabs
│   │   │       └── Breadcrumbs.tsx          # Navigation path
│   │   │
│   │   └── layouts/               # Layout components
│   │       ├── AppShell.tsx                 # Main app layout
│   │       ├── SessionLayout.tsx            # Session view layout
│   │       └── DashboardLayout.tsx          # Dashboard layout
│   │
│   ├── pages/                     # Route pages
│   │   ├── Landing.tsx                      # Landing page
│   │   ├── CreateSession.tsx                # Session creation
│   │   ├── JoinSession.tsx                  # Join session flow
│   │   ├── Session.tsx                      # Active session view
│   │   ├── ModeratorView.tsx                # Moderator interface
│   │   ├── Analysis.tsx                     # Analysis dashboard
│   │   └── NotFound.tsx                     # 404 page
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useRealtimeSession.ts            # Firestore session sync
│   │   ├── useSwipeVote.ts                  # Swipe gesture voting
│   │   ├── useMessageStream.ts              # Message updates
│   │   ├── useAIInsights.ts                 # AI analysis data
│   │   ├── useAuth.ts                       # Authentication state
│   │   ├── useOffline.ts                    # Offline detection
│   │   └── useMediaQuery.ts                 # Responsive helpers
│   │
│   ├── services/                  # Business logic & APIs
│   │   ├── firebase.ts                      # Firebase initialization
│   │   ├── auth.ts                          # Authentication service
│   │   ├── session.ts                       # Session management
│   │   ├── messages.ts                      # Message operations
│   │   ├── voting.ts                        # Vote handling
│   │   ├── propagation.ts                   # Ring propagation
│   │   ├── ai.ts                            # AI service integration
│   │   └── analytics.ts                     # Analytics tracking
│   │
│   ├── stores/                    # State management
│   │   ├── authStore.ts                     # User authentication
│   │   ├── sessionStore.ts                  # Session state
│   │   ├── messageStore.ts                  # Message cache
│   │   ├── votingStore.ts                   # Voting state
│   │   ├── uiStore.ts                       # UI preferences
│   │   └── offlineStore.ts                  # Offline queue
│   │
│   ├── types/                     # TypeScript types
│   │   ├── index.ts                         # Main type exports
│   │   ├── session.types.ts                 # Session interfaces
│   │   ├── message.types.ts                 # Message interfaces
│   │   ├── user.types.ts                    # User interfaces
│   │   ├── ai.types.ts                      # AI response types
│   │   └── firebase.types.ts                # Firebase types
│   │
│   ├── utils/                     # Utility functions
│   │   ├── constants.ts                     # App constants
│   │   ├── helpers.ts                       # Helper functions
│   │   ├── validation.ts                    # Input validation
│   │   ├── formatting.ts                    # Data formatting
│   │   ├── gestures.ts                      # Gesture calculations
│   │   └── performance.ts                   # Performance utils
│   │
│   ├── config/                    # Configuration
│   │   ├── firebase.config.ts               # Firebase setup
│   │   ├── theme.ts                         # Untitled UI theme
│   │   ├── routes.ts                        # Route definitions
│   │   └── features.ts                      # Feature flags
│   │
│   ├── styles/                    # Global styles
│   │   ├── global.css                       # Global CSS
│   │   ├── variables.css                    # CSS variables
│   │   └── animations.css                   # Animation classes
│   │
│   └── assets/                    # Static assets
│       ├── images/
│       │   ├── logo.svg                     # upVoice logo
│       │   └── illustrations/               # UI illustrations
│       └── icons/
│           └── app-icon.png                 # PWA icon
│
├── public/                        # Public assets
│   ├── manifest.json                        # PWA manifest
│   ├── robots.txt                           # SEO robots file
│   ├── favicon.ico                          # Browser favicon
│   └── images/
│       └── splash/                          # PWA splash screens
│
├── functions/                     # Cloud Functions
│   ├── package.json                         # Functions dependencies
│   ├── tsconfig.json                        # TypeScript config
│   ├── .eslintrc.json                       # ESLint config
│   │
│   └── src/
│       ├── index.ts                         # Function exports
│       ├── triggers/                        # Firestore triggers
│       │   ├── onMessageCreate.ts           # New message handler
│       │   ├── onVoteCreate.ts              # Vote processing
│       │   └── onSessionUpdate.ts           # Session changes
│       ├── scheduled/                       # Scheduled functions
│       │   ├── cleanupSessions.ts           # Session cleanup
│       │   └── generateReports.ts           # Report generation
│       ├── api/                             # HTTP endpoints
│       │   ├── createSession.ts             # Session creation
│       │   ├── joinSession.ts               # Join session
│       │   ├── analyzeSession.ts            # AI analysis
│       │   └── exportData.ts                # Data export
│       └── utils/                           # Shared utilities
│           ├── propagation.ts               # Ring algorithm
│           ├── ai.ts                        # AI helpers
│           └── validation.ts                # Input validation
│
├── tests/                         # Test suites
│   ├── unit/                                # Unit tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/                         # Integration tests
│   │   ├── firebase/
│   │   └── api/
│   └── e2e/                                 # End-to-end tests
│       ├── userJourneys/
│       └── performance/
│
└── docs/                          # Documentation
    ├── api/                                 # API documentation
    │   ├── rest-api.md
    │   └── websocket-api.md
    └── guides/                              # User guides
        ├── moderator-guide.md
        └── participant-guide.md
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `MessageCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useSwipeVote.ts`)
- **Services/Utils**: camelCase (e.g., `firebase.ts`)
- **Types**: camelCase with '.types' suffix (e.g., `session.types.ts`)
- **Tests**: Same as source with '.test' suffix (e.g., `MessageCard.test.tsx`)

## Import Order

1. External libraries
2. Internal aliases (@components, @hooks, etc.)
3. Relative imports
4. Type imports
5. Style imports