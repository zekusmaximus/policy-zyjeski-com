# ECC Legislative Portal - Netlify Deployment Guide

## Overview
This guide covers deploying the ECC Legislative Portal to Netlify for production use.

## Prerequisites
- Node.js 20+ installed locally
- Netlify account
- Firebase project configured
- Git repository (recommended)

## Quick Deployment Steps

### 1. Prepare Your Repository
Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect to Netlify
1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose your Git provider and repository
4. Select the branch to deploy (usually `main` or `master`)

### 3. Configure Build Settings
Netlify should auto-detect the settings, but verify:
- **Base directory**: `ecc-portal`
- **Build command**: `npm run build`
- **Publish directory**: `ecc-portal/dist`

### 4. Set Environment Variables
In Netlify dashboard, go to Site settings > Environment variables and add:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Deploy
Click "Deploy site" - Netlify will build and deploy automatically.

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build the project locally:
   ```bash
   cd ecc-portal
   npm install
   npm run build
   ```

2. Drag and drop the `dist` folder to Netlify's deploy area.

## Configuration Files

### netlify.toml
- Configures build settings and redirects
- Sets up security headers
- Handles SPA routing

### public/_redirects
- Backup redirect configuration
- Ensures all routes serve index.html

### vite.config.js
- Build optimizations
- Code splitting configuration
- Development server settings

## Environment Variables

The app supports both environment variables and fallback values:
- Production: Uses `VITE_*` environment variables
- Development: Falls back to hardcoded values

## Security Features

The deployment includes:
- Content Security Policy headers
- XSS protection
- Frame options security
- Referrer policy configuration

## Performance Optimizations

- Code splitting (Firebase in separate chunk)
- Asset caching (1 year for static assets)
- Gzip compression
- Modern ES2020 target for smaller bundles

## Troubleshooting

### Build Fails
- Check Node.js version (requires 20+)
- Verify all dependencies are installed
- Check for syntax errors in code

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project permissions
- Ensure Firestore rules allow read/write access

### Routing Issues
- Verify `_redirects` file is in `public` folder
- Check `netlify.toml` redirect configuration
- Ensure SPA routing is properly configured

## Custom Domain Setup

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

## Monitoring and Analytics

- Netlify provides built-in analytics
- Firebase Analytics is configured in the app
- Monitor performance via Netlify's dashboard

## Support

For deployment issues:
- Check Netlify's build logs
- Review browser console for errors
- Verify Firebase configuration and permissions
