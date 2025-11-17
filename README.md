# ECC Legislative Portal

A fictional legislative portal for the East Coast Conglomerate, featuring the landmark "AI Personhood Act of 2077" with real-time public testimony and endorsement functionality.

## Features

- **Single Page Application**: Smooth navigation between different sections
- **Real-time Data**: Live endorsement counts using Firebase Firestore
- **Interactive Testimony**: Users can endorse different viewpoints on legislation
- **Responsive Design**: Works on desktop and mobile devices
- **Production Ready**: Optimized for deployment on Netlify
- **Security First**: Rate limiting, input validation, and Firestore security rules
- **Error Handling**: Comprehensive error handling with user-friendly feedback

## Technology Stack

- **Frontend**: TypeScript, HTML5, CSS3
- **Build Tool**: Vite 7.0
- **Database**: Firebase Firestore
- **Backend**: Firebase Cloud Functions (for rate limiting)
- **Testing**: Vitest with happy-dom environment
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

## Project Structure

```
ecc-portal/
├── functions/              # Firebase Cloud Functions
│   ├── index.js           # Rate limiting logic
│   ├── package.json       # Function dependencies
│   └── .eslintrc.cjs      # Linting configuration
├── public/
│   ├── _redirects         # Netlify SPA redirects
│   └── vite.svg          # Favicon
├── src/
│   ├── test/             # Test files
│   │   ├── setup.ts      # Test environment setup
│   │   ├── utils.test.ts # Utility function tests
│   │   └── endorsement.test.ts # Endorsement logic tests
│   ├── main.ts           # Main application logic (TypeScript)
│   ├── vite-env.d.ts     # Vite environment type definitions
│   └── style.css         # Application styles
├── index.html            # Main HTML template
├── firebase.json         # Firebase configuration
├── firestore.rules       # Database security rules
├── netlify.toml          # Netlify configuration
├── vite.config.js        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for build tools
├── SECURITY.md           # Security documentation
└── package.json          # Dependencies and scripts
```

## Contributing

This is a fictional project created for creative/educational purposes. The "East Coast Conglomerate" and "AI Personhood Act of 2077" are entirely fictional.

## License

This project is for educational and creative purposes. All content is fictional.
