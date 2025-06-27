# upVoice - AI-Powered Anonymous Discussion Platform

Transform group discussions into quantitative insights with AI analysis. Built as a mobile-first PWA with swipe-based voting and real-time analysis.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project (create at https://console.firebase.google.com)

### Setup

1. **Clone and install dependencies**
```bash
cd upvoice
npm install
cd functions && npm install && cd ..
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

3. **Initialize Firebase**
```bash
firebase login
firebase use --add
# Select your Firebase project
```

4. **Start development**
```bash
# Terminal 1: Start Firebase emulators
npm run firebase:emulators

# Terminal 2: Start Vite dev server
npm run dev
```

The app will open at http://localhost:3000

## 🏗️ Project Structure

```
upvoice/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Route pages
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Business logic
│   ├── stores/        # State management
│   ├── types/         # TypeScript types
│   └── config/        # Configuration
├── functions/         # Cloud Functions
├── public/           # Static assets
└── tests/            # Test suites
```

## 🔑 Key Features

### For Participants
- **Anonymous Discussions** - Share thoughts freely
- **Swipe Voting** - Natural gesture-based voting (0-1 scale)
- **Real-time Updates** - See new messages instantly
- **Mobile-First** - Beautiful experience on any device

### For Moderators
- **Live Dashboard** - Monitor participation in real-time
- **AI Insights** - Instant theme extraction and sentiment
- **Session Controls** - Start, pause, guide discussions
- **Export Results** - Download analysis and reports

### Technical Highlights
- **PWA** - Works offline, installable
- **Firebase Backend** - Real-time sync, scalable
- **Viral Propagation** - Messages spread based on votes
- **AI Analysis** - Google Cloud NLP + OpenAI
- **Untitled UI** - Professional design system

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:e2e     # Run E2E tests
npm run analyze      # Analyze bundle size
```

### Firebase Emulators

The project uses Firebase emulators for local development:
- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Storage**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### Code Style

- TypeScript with strict mode
- ESLint + Prettier for formatting
- Conventional commits
- Component-driven development

## 📱 PWA Features

- **Offline Support** - Queue messages when offline
- **Install Prompt** - Add to home screen
- **Push Notifications** - Session reminders
- **Background Sync** - Sync when reconnected

## 🔒 Security

- **Anonymous by Design** - No linking users to content
- **Firestore Rules** - Strict permission model
- **Organization Isolation** - Complete data separation
- **Verified Access** - Allowlist/domain verification

## 🚢 Deployment

### Production Build

```bash
npm run build
firebase deploy
```

### Environment-Specific Deployment

```bash
# Staging
firebase use staging
firebase deploy

# Production
firebase use production
firebase deploy --only hosting,functions
```

## 📊 Analytics & Monitoring

- **Firebase Analytics** - User behavior
- **Sentry** - Error tracking
- **Performance Monitoring** - Web vitals
- **Custom Metrics** - Session engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

Copyright © 2024 upVoice (Synthetron spin-off)

---

Built with ❤️ using React, Firebase, and AI