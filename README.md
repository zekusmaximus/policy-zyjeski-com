# ECC Legislative Portal

A fictional legislative portal for the East Coast Conglomerate, featuring the landmark "AI Personhood Act of 2077" with real-time public testimony and endorsement functionality.

## Features

### Phase 1: Core Legislative Portal
- **Single Page Application**: Smooth navigation between different sections
- **Real-time Data**: Live endorsement counts using Firebase Firestore
- **Interactive Testimony**: Users can endorse different viewpoints on legislation
- **Responsive Design**: Works on desktop and mobile devices
- **Progressive Web App (PWA)**: Installable with offline support via Service Workers
- **Production Ready**: Optimized for deployment on Netlify
- **Security First**: Rate limiting, input validation, and Firestore security rules
- **Error Handling**: Comprehensive error handling with user-friendly feedback
- **Analytics**: Firebase Analytics tracking for user engagement and errors
- **Content Management**: Dynamic content loading from JSON files
- **CI/CD Pipeline**: Automated testing and deployment via GitHub Actions

### Phase 2 Enhancements (Engagement & Retention)
- **Vote Countdown System**: Real-time countdown to scheduled vote with automatic result calculation
- **Character Profiles**: 8 fully-developed characters with relationship visualization and classified dossiers
- **Outcome Scenarios**: Interactive future timeline explorer showing 4 possible outcomes (2077-2085)
- **Published Works Integration**: 15+ cross-references linking portal content to author's books
- **Easter Egg System**: Hidden reference discovery with achievement tracking
- **Newsletter Integration**: In-universe themed email signup with Firestore backend

## Technology Stack

- **Frontend**: TypeScript, HTML5, CSS3
- **Build Tool**: Vite 7.0 with PWA plugin
- **Database**: Firebase Firestore
- **Backend**: Firebase Cloud Functions (for rate limiting)
- **Analytics**: Firebase Analytics for user tracking
- **PWA**: Workbox for service workers and offline support
- **Testing**: Vitest with happy-dom environment
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Netlify (recommended) or Firebase Hosting
- **Styling**: Custom CSS with CSS Variables

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd ecc-portal
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run type-check` - Run TypeScript type checking without emitting files

## Firebase Setup

### 1. Create Firebase Project
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create a collection named `viewpoints` with documents:
   - `viewpoint_1` with field `endorsements: 0`
   - `viewpoint_2` with field `endorsements: 0`
   - `viewpoint_3` with field `endorsements: 0`
   - `viewpoint_4` with field `endorsements: 0`

### 2. Deploy Security Rules
Deploy Firestore security rules to protect your database:

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Cloud Functions
Install dependencies and deploy the rate-limiting Cloud Function:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4. Update Environment Variables
Add the Cloud Function URL to your environment:

```
VITE_CLOUD_FUNCTION_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/submitEndorsement
```

### Security Note
The Firebase configuration keys in this project are client-side keys that are safe to be public. GitHub may flag them as potential secrets, but this is a false positive. Firebase client-side keys are designed to be embedded in public applications and **real security comes from Firestore Security Rules and Cloud Functions**, not from hiding these keys.

For detailed security information, see [SECURITY.md](./SECURITY.md).

## Environment Variables

For production deployment, set these environment variables:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_CLOUD_FUNCTION_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/submitEndorsement
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Netlify Deployment

1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

## Security

This application implements multiple security layers:

- **Firestore Security Rules**: Database-level access control prevents direct writes
- **Server-side Rate Limiting**: Cloud Functions enforce IP-based rate limits (10 endorsements/hour)
- **Input Validation**: All user inputs validated client and server-side
- **Error Handling**: Comprehensive error handling with rollback on failures
- **Memory Leak Prevention**: Proper cleanup of Firebase listeners
- **Request Timeouts**: Network requests protected with 10-second timeouts

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## TypeScript & Testing

This project is built with TypeScript for type safety and uses Vitest for testing.

### TypeScript

- **Strict Mode**: Enabled for maximum type safety
- **Type Definitions**: Custom types for viewpoints, Firebase data, and API responses
- **Environment Types**: Type-safe access to Vite environment variables

### Testing

The project includes comprehensive unit tests covering:

- Session storage utilities
- Toast notification system
- HTML generation functions
- Input validation
- Error handling
- Endorsement API integration
- Button state management

**Test Coverage**:
- 29 passing tests across 2 test files
- Mocked Firebase and network calls
- Tests for offline scenarios and error states

**Running Tests**:
```bash
npm test              # Watch mode
npm run test:run      # Run once
npm run test:coverage # With coverage report
```

### Code Quality

- **Type Checking**: Run `npm run type-check` before commits
- **Build Validation**: Build includes type-checking step
- **Strict CSP**: Removed `unsafe-inline` and `unsafe-eval` from Content Security Policy

## Progressive Web App (PWA) & Offline Support

This application is a fully-featured Progressive Web App with offline capabilities.

### Features

- **Installable**: Can be installed on mobile and desktop devices
- **Offline Support**: Works without internet connection using Service Workers
- **Automatic Updates**: New versions are automatically detected and prompt for update
- **Caching Strategies**:
  - **Firebase Firestore**: Network-first with 1-hour cache
  - **Cloud Functions**: Network-first with 5-minute cache
  - **Static Assets**: Precached during installation
  - **Viewpoints Data**: Stale-while-revalidate for optimal performance

### Installation

Users can install the app by:
1. Clicking the "Install" button in the browser address bar
2. Using "Add to Home Screen" on mobile devices
3. The app will appear as a standalone application

### Offline Behavior

When offline, the app:
- Displays cached viewpoints data
- Shows offline notification
- Queues endorsement attempts for when connection returns
- Maintains full UI functionality

## Firebase Analytics

Comprehensive analytics tracking is implemented for:

### Tracked Events

**Phase 1 Events**:
1. **app_initialized**: When the application starts
2. **page_view**: Every page navigation with page details
3. **endorsement_submitted**: Successful endorsements with viewpoint ID
4. **endorsement_error**: Failed endorsements with error details

**Phase 2 Events**:

**Vote System**:
- **countdown_viewed**: User sees countdown timer
- **vote_result_viewed**: User views vote outcome
- **outcome_probability_viewed**: User checks which future is most likely

**Character System**:
- **character_viewed**: Character bio opened
- **character_filtered**: Applied faction/position filter
- **relationship_graph_viewed**: Viewed character connections
- **dossier_unlocked**: Discovered classified information

**Scenario Explorer**:
- **scenario_explored**: User explores a future timeline
- **scenario_compared**: Side-by-side comparison used

**Cross-Promotion**:
- **book_link_clicked**: Purchase link clicked
- **reference_page_visited**: Easter egg page viewed
- **easter_egg_discovered**: Hidden reference found

**Newsletter**:
- **newsletter_form_viewed**: Signup form displayed
- **newsletter_subscribed**: Email submitted (includes source tracking)

### Analytics Dashboard

View analytics in your Firebase Console:
- User engagement metrics
- Page view analytics
- Endorsement conversion rates
- Error tracking and debugging
- Vote engagement and conversion
- Character and scenario exploration patterns
- Cross-promotion effectiveness

### Privacy

- No personal data is collected
- All tracking is anonymous
- Analytics can be blocked by ad blockers (handled gracefully)

## Content Management

Viewpoint content is now managed via JSON files for easy updates.

### Updating Content

1. Edit `/public/data/viewpoints.json`
2. Modify viewpoint text, attribution, or add new viewpoints
3. Commit and deploy - no code changes needed

### JSON Structure

```json
{
  "viewpoints": [
    {
      "id": "viewpoint_1",
      "text": "Your viewpoint text here",
      "attribution": "— Author Name, Title"
    }
  ]
}
```

### Benefits

- **No Code Changes**: Update content without touching TypeScript
- **Version Control**: Track content changes in Git
- **Easy Collaboration**: Non-developers can update content
- **Cached**: Content is cached for offline access

## CI/CD Pipeline

Automated testing and deployment via GitHub Actions.

### Workflow Steps

1. **Lint & Type Check**: TypeScript validation
2. **Run Tests**: Execute 29 unit tests
3. **Build**: Compile and bundle application
4. **Security Audit**: Check for vulnerabilities
5. **Deploy**: Automatic deployment to Netlify (main branch only)

### Setting Up

1. Add GitHub Secrets in repository settings:
   - `VITE_FIREBASE_*` - Firebase configuration
   - `VITE_CLOUD_FUNCTION_URL` - Cloud Function URL
   - `NETLIFY_AUTH_TOKEN` - Netlify deployment token
   - `NETLIFY_SITE_ID` - Your Netlify site ID

2. Push to `main` branch to trigger deployment

### Local Testing

```bash
# Run full CI pipeline locally
npm run type-check  # Type checking
npm run test:run    # Tests
npm run build       # Build
```

## Project Structure

```
ecc-portal/
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # GitHub Actions CI/CD pipeline
├── functions/              # Firebase Cloud Functions
│   ├── index.js           # Rate limiting logic
│   ├── package.json       # Function dependencies
│   └── .eslintrc.cjs      # Linting configuration
├── public/
│   ├── data/
│   │   ├── viewpoints.json      # Phase 1: Viewpoint content
│   │   ├── lore.json            # Phase 1: ECC history & timeline
│   │   ├── news.json            # Phase 1: News articles
│   │   ├── site-config.json     # Phase 2: Vote date & feature flags
│   │   ├── characters.json      # Phase 2: Character bios
│   │   ├── outcomes.json        # Phase 2: Future scenarios
│   │   ├── books.json           # Phase 2: Author bibliography
│   │   └── cross-references.json # Phase 2: Portal-book connections
│   ├── _redirects         # Netlify SPA redirects
│   └── vite.svg          # Favicon (also used as PWA icon)
├── src/
│   ├── test/             # Test files
│   │   ├── setup.ts      # Test environment setup
│   │   ├── utils.test.ts # Utility function tests
│   │   └── endorsement.test.ts # Endorsement logic tests
│   ├── main.ts           # Main application logic (TypeScript)
│   ├── types.ts          # TypeScript type definitions
│   ├── lore.ts           # Phase 1: Lore rendering
│   ├── news.ts           # Phase 1: News rendering
│   ├── futuristic-ui.ts  # Phase 1: UI effects
│   ├── social-card.ts    # Phase 1: Social sharing
│   ├── countdown.ts      # Phase 2: Vote countdown
│   ├── characters.ts     # Phase 2: Character profiles
│   ├── outcomes.ts       # Phase 2: Future scenarios
│   ├── vote-results.ts   # Phase 2: Vote outcome display
│   ├── newsletter.ts     # Phase 2: Newsletter signup
│   ├── easter-eggs.ts    # Phase 2: Easter egg system
│   ├── vite-env.d.ts     # Vite environment type definitions
│   └── style.css         # Application styles
├── index.html            # Main HTML template
├── firebase.json         # Firebase configuration
├── firestore.rules       # Database security rules
├── netlify.toml          # Netlify configuration
├── vite.config.js        # Vite build + PWA configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for build tools
├── SECURITY.md           # Security documentation
├── DEPLOYMENT.md         # Deployment guide
├── CONFIGURATION.md      # Configuration reference
└── package.json          # Dependencies and scripts
```

## Configuration

### Vote System Setup

The vote countdown and results are controlled via `public/data/site-config.json`:

```json
{
  "voteDate": "2025-12-17T18:00:00Z",  // Change to your desired date
  "inUniverseVoteDate": "January 15, 2078",
  "votingEnabled": true,
  "featuresEnabled": {
    "countdown": true,
    "voteResults": false  // Automatically set to true after vote
  }
}
```

**Important**: Once the vote date passes, the system automatically:
- Locks endorsements (prevents new votes)
- Calculates outcome based on endorsement distribution
- Displays vote results page
- Shows which future scenario becomes "canon"

### Newsletter Integration

#### Option A: Firestore-Only (Current Implementation)
- Emails stored in `newsletters` collection
- Manual export required for email campaigns
- No external dependencies

#### Option B: Email Service Integration (Recommended)

Integrate with Mailchimp, ConvertKit, or Buttondown:

1. Install email service SDK:
   ```bash
   npm install @mailchimp/mailchimp_marketing
   # or
   npm install @convertkit/convertkit-node
   ```

2. Add environment variables:
   ```env
   VITE_MAILCHIMP_API_KEY=your_api_key
   VITE_MAILCHIMP_LIST_ID=your_list_id
   ```

3. Update `src/newsletter.ts` with API integration

### Book Integration

Update `public/data/books.json` with your real published works:

```json
{
  "books": [
    {
      "id": "book_1",
      "title": "Your Actual Book Title",
      "series": "Series Name",
      "status": "published",  // or "forthcoming"
      "purchaseUrl": "https://amazon.com/your-book",
      "coverImage": "/images/covers/book1.jpg"
    }
  ]
}
```

Update cross-references in `public/data/cross-references.json` to match your books.

For detailed configuration instructions, see [CONFIGURATION.md](./CONFIGURATION.md).

## Contributing

This is a fictional project created for creative/educational purposes. The "East Coast Conglomerate" and "AI Personhood Act of 2077" are entirely fictional.

## License

This project is for educational and creative purposes. All content is fictional.
