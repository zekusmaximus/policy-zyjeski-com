# ECC Legislative Portal

A fictional legislative portal for the East Coast Conglomerate, featuring the landmark "AI Personhood Act of 2077" with real-time public testimony and endorsement functionality.

## Features

- **Single Page Application**: Smooth navigation between different sections
- **Real-time Data**: Live endorsement counts using Firebase Firestore
- **Interactive Testimony**: Users can endorse different viewpoints on legislation
- **Responsive Design**: Works on desktop and mobile devices
- **Production Ready**: Optimized for deployment on Netlify

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Build Tool**: Vite 7.0
- **Database**: Firebase Firestore
- **Hosting**: Netlify (recommended)
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
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create a collection named `viewpoints` with documents:
   - `viewpoint_1` with field `endorsements: 0`
   - `viewpoint_2` with field `endorsements: 0`
   - `viewpoint_3` with field `endorsements: 0`
   - `viewpoint_4` with field `endorsements: 0`

### Security Note
The Firebase configuration keys in this project are client-side keys that are safe to be public. GitHub may flag them as potential secrets, but this is a false positive. Firebase client-side keys are designed to be embedded in public applications and real security comes from Firestore Security Rules, not from hiding these keys.

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
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Netlify Deployment

1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

## Project Structure

```
ecc-portal/
├── public/
│   ├── _redirects          # Netlify SPA redirects
│   └── vite.svg           # Favicon
├── src/
│   ├── main.js            # Main application logic
│   └── style.css          # Application styles
├── index.html             # Main HTML template
├── netlify.toml           # Netlify configuration
├── vite.config.js         # Vite build configuration
└── package.json           # Dependencies and scripts
```

## Contributing

This is a fictional project created for creative/educational purposes. The "East Coast Conglomerate" and "AI Personhood Act of 2077" are entirely fictional.

## License

This project is for educational and creative purposes. All content is fictional.
