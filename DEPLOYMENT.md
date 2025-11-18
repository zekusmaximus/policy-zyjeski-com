# ECC Legislative Portal - Complete Deployment Guide

## Overview
This guide covers deploying the ECC Legislative Portal with all modern features including PWA support, analytics, CI/CD pipeline, and JSON-based content management.

## Prerequisites
- Node.js 20+ installed locally
- Netlify account (or alternative hosting)
- Firebase project configured
- GitHub repository (for CI/CD)
- Git configured locally

## Technology Stack

- **Frontend**: TypeScript, HTML5, CSS3
- **Build**: Vite 7.0 with PWA plugin
- **Database**: Firebase Firestore
- **Backend**: Firebase Cloud Functions
- **Analytics**: Firebase Analytics
- **PWA**: Workbox service workers
- **CI/CD**: GitHub Actions
- **Hosting**: Netlify

## Pre-Deployment Checklist

### Phase 1 & 2 Configuration

- [ ] **Vote Date Set**: Configure `public/data/site-config.json` with your desired vote date
- [ ] **Book Information**: Update `public/data/books.json` with real titles and purchase URLs
- [ ] **Cross-References**: Verify `public/data/cross-references.json` matches your books
- [ ] **Newsletter Service**: Configure email integration or use Firestore-only mode
- [ ] **Environment Variables**: Ensure all required variables are set in Netlify/Firebase
- [ ] **Analytics**: Verify Firebase Analytics is tracking Phase 2 events
- [ ] **Content Review**: Check all character bios, scenarios, and news articles for accuracy

### New Environment Variables (Optional)

If integrating external newsletter service:
```env
VITE_MAILCHIMP_API_KEY=your_api_key
VITE_MAILCHIMP_LIST_ID=your_list_id
# or for ConvertKit
VITE_CONVERTKIT_API_KEY=your_api_key
VITE_CONVERTKIT_FORM_ID=your_form_id
```

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
VITE_CLOUD_FUNCTION_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/submitEndorsement
```

**Note**: The same environment variables should be added as GitHub Secrets for CI/CD (see CI/CD section below).

### 5. Deploy
Click "Deploy site" - Netlify will build and deploy automatically.

The build will:
- Run TypeScript type checking
- Execute unit tests
- Generate service worker for offline support
- Create PWA manifest
- Optimize and bundle all assets
- Deploy to your Netlify URL

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
- PWA plugin configuration
- Service worker generation
- Development server settings

## CI/CD Pipeline with GitHub Actions

### Overview
The project includes automated CI/CD via GitHub Actions that runs on every push and pull request.

### Setup GitHub Actions

1. **Add Repository Secrets**

   Go to your GitHub repository → Settings → Secrets and variables → Actions

   Add the following secrets:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   VITE_FIREBASE_MEASUREMENT_ID
   VITE_CLOUD_FUNCTION_URL
   NETLIFY_AUTH_TOKEN
   NETLIFY_SITE_ID
   ```

2. **Get Netlify Tokens**

   - **NETLIFY_AUTH_TOKEN**: User Settings → Applications → Personal access tokens → New access token
   - **NETLIFY_SITE_ID**: Site settings → General → Site information → API ID

3. **Workflow Triggers**

   The CI/CD pipeline runs automatically on:
   - Push to `main` or `develop` branches
   - Pull requests to `main` or `develop` branches

### Pipeline Stages

The workflow consists of 5 jobs that run sequentially:

1. **Lint & Type Check** (2-3 min)
   - Validates TypeScript types
   - Catches compilation errors early

2. **Run Tests** (2-3 min)
   - Executes all 29 unit tests
   - Generates code coverage report
   - Uploads coverage artifacts

3. **Build Application** (1-2 min)
   - Compiles TypeScript
   - Bundles with Vite
   - Generates PWA assets
   - Creates service worker

4. **Security Audit** (1-2 min)
   - Runs `npm audit`
   - Checks for known vulnerabilities

5. **Deploy to Netlify** (1-2 min, main branch only)
   - Deploys to production
   - Creates PR preview deployments
   - Posts deployment URL to PR

### Viewing Pipeline Status

- Check the **Actions** tab in your GitHub repository
- View detailed logs for each job
- Download artifacts (coverage reports, builds)

### Manual Deployment Trigger

To manually trigger deployment:
```bash
git push origin main
```

Or use GitHub UI:
- Go to Actions tab
- Select "CI/CD Pipeline" workflow
- Click "Run workflow"

## Progressive Web App (PWA) Features

### What Gets Generated

The build process automatically creates:

1. **Service Worker** (`sw.js`)
   - Precaches all static assets (384KB+)
   - Implements runtime caching strategies
   - Handles offline functionality

2. **Web App Manifest** (`manifest.webmanifest`)
   - App name, icons, theme colors
   - Display mode and start URL
   - Installation metadata

3. **Workbox Files**
   - Runtime caching logic
   - Background sync capabilities

### Caching Strategies

**Static Assets**: Precached during installation
- HTML, CSS, JavaScript
- Images and fonts
- Viewpoints JSON data

**Firebase Firestore**: Network-first with 1-hour cache
- Fresh data when online
- Fallback to cache when offline

**Cloud Functions**: Network-first with 5-minute cache
- Recent data prioritized
- Timeout after 10 seconds

**Viewpoints JSON**: Stale-while-revalidate with 24-hour cache
- Show cached content immediately
- Update in background

### Testing PWA Locally

```bash
npm run build
npm run preview

# Open browser to http://localhost:4173
# Check Application tab in DevTools
# Verify Service Worker is registered
# Test offline mode by going offline in DevTools
```

### PWA Installation

Users can install the app:
- Desktop: Install button in address bar
- Mobile: "Add to Home Screen" option
- Appears as standalone app

### Updating PWA

When you deploy new code:
1. Service worker detects new version
2. Downloads updated assets in background
3. Shows user prompt: "New content available. Reload?"
4. User clicks OK to update

## Content Management with JSON

### Updating Viewpoints Content

All viewpoint content is stored in `/public/data/viewpoints.json`.

**To update content**:

1. Edit the JSON file:
   ```bash
   vim public/data/viewpoints.json
   ```

2. Modify text, attribution, or add new viewpoints:
   ```json
   {
     "viewpoints": [
       {
         "id": "viewpoint_1",
         "text": "Your updated viewpoint text...",
         "attribution": "— New Author, Title"
       }
     ]
   }
   ```

3. Commit and push:
   ```bash
   git add public/data/viewpoints.json
   git commit -m "Update viewpoint content"
   git push
   ```

4. CI/CD automatically deploys the changes

**No code changes required!** Content updates don't need TypeScript modifications.

### Content Validation

The JSON file should have:
- Valid JSON syntax
- Array of viewpoint objects
- Required fields: `id`, `text`, `attribution`
- Unique IDs (viewpoint_1, viewpoint_2, etc.)

### Adding New Viewpoints

To add a new viewpoint:

1. Add to JSON file:
   ```json
   {
     "id": "viewpoint_5",
     "text": "New perspective...",
     "attribution": "— Author Name"
   }
   ```

2. Create Firestore document:
   ```bash
   # In Firebase Console
   Collection: viewpoints
   Document ID: viewpoint_5
   Field: endorsements = 0
   ```

3. Update `VALID_VIEWPOINT_IDS` in main.ts (optional security enhancement)

## Firebase Analytics Setup

### Enable Analytics in Firebase

1. Go to Firebase Console
2. Select your project
3. Analytics → Enable Analytics
4. Choose or create a Google Analytics account

### Verify Analytics Working

After deployment:

1. Visit your deployed site
2. Navigate to different pages
3. Submit an endorsement
4. Wait 24-48 hours for data to appear in Firebase Console

### Tracked Events

The app automatically tracks:

- **app_initialized**: App startup
- **page_view**: Every page navigation (with page details)
- **endorsement_submitted**: Successful endorsements (with viewpoint ID)
- **endorsement_error**: Failed attempts (with error details)

### Viewing Analytics

Firebase Console → Analytics → Events

Monitor:
- Active users
- Page views by page
- Endorsement conversion rates
- Error frequencies
- User engagement metrics

### Privacy Considerations

- All tracking is anonymous
- No personal data collected
- Analytics can be blocked (app handles gracefully)
- GDPR compliant by default

## Firebase Backend Deployment

### Deploy Security Rules

Before deploying the frontend, deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

This deploys the `firestore.rules` file which protects your database from unauthorized access.

### Deploy Cloud Functions

Deploy the rate-limiting Cloud Function:

```bash
# Install function dependencies
cd functions
npm install

# Return to root and deploy
cd ..
firebase deploy --only functions
```

After deployment, note your Cloud Function URL (shown in terminal output).

## Environment Variables

The app supports both environment variables and fallback values:
- Production: Uses `VITE_*` environment variables
- Development: Falls back to hardcoded values

**Required Environment Variables:**
- All Firebase config variables (see README.md)
- `VITE_CLOUD_FUNCTION_URL` - Your deployed Cloud Function URL

## Security Features

The deployment includes:
- **Firestore Security Rules**: Database-level access control
- **Server-side Rate Limiting**: IP-based rate limiting via Cloud Functions (10/hour)
- **Content Security Policy headers**: Prevents XSS and injection attacks
- **XSS protection**: Browser-level XSS filtering
- **Frame options security**: Prevents clickjacking
- **Referrer policy configuration**: Controls referrer information
- **Input validation**: Client and server-side validation
- **Error handling**: Comprehensive error handling with user feedback

For detailed security information, see [SECURITY.md](./SECURITY.md).

## Performance Optimizations

- **Code splitting**: Firebase in separate chunk (321KB)
- **Asset caching**: 1 year for static assets, immediate for HTML
- **Service Worker caching**: Intelligent caching strategies per resource type
- **Gzip compression**: Automatic via Netlify
- **Modern ES2020 target**: Smaller bundles for modern browsers
- **PWA precaching**: 384KB+ assets cached on first visit
- **Lazy loading**: Viewpoints loaded only when viewed
- **Workbox optimization**: Background sync and update strategies

### Build Size

Typical production build:
```
dist/manifest.webmanifest           0.38 kB
dist/index.html                    13.93 kB │ gzip:  4.56 kB
dist/assets/index-[hash].css        7.58 kB │ gzip:  2.01 kB
dist/assets/workbox-[hash].js       5.78 kB │ gzip:  2.40 kB
dist/assets/index-[hash].js        40.07 kB │ gzip:  9.91 kB
dist/assets/firebase-[hash].js    322.62 kB │ gzip: 80.86 kB
dist/sw.js                         ~10 kB (service worker)
dist/workbox-[hash].js             ~20 kB (workbox runtime)
```

Total precached: ~384 KB

## Troubleshooting

### Build Fails
- Check Node.js version (requires 20+)
- Verify all dependencies are installed
- Check for syntax errors in code

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project permissions
- Ensure Firestore security rules are deployed
- Verify Cloud Functions are deployed and accessible

### Cloud Function Issues
- Check Cloud Function URL is correct in environment variables
- Verify Cloud Function deployed successfully: `firebase functions:list`
- Check Cloud Function logs: `firebase functions:log`
- Ensure CORS is enabled (already configured in function)

### Rate Limiting Issues
- Users hitting rate limit will see error message with retry time
- Rate limit is 10 endorsements per hour per IP address
- Adjust limits in `functions/index.js` if needed

### Routing Issues
- Verify `_redirects` file is in `public` folder
- Check `netlify.toml` redirect configuration
- Ensure SPA routing is properly configured

### PWA Issues

**Service Worker Not Registering**:
- Check browser console for errors
- Verify HTTPS is enabled (required for SW)
- Clear browser cache and reload
- Check Application tab in DevTools → Service Workers

**Offline Mode Not Working**:
- Verify service worker is active
- Check cache storage in DevTools
- Ensure assets are precached (Application → Cache Storage)
- Test in incognito mode for fresh state

**Update Prompt Not Showing**:
- New version requires different hash in assets
- Check service worker update in DevTools
- Force update: Unregister SW and reload
- Verify Workbox configuration in vite.config.js

**Install Button Not Appearing**:
- Ensure manifest.webmanifest is accessible
- Check manifest in DevTools → Application → Manifest
- Verify HTTPS is enabled
- Some browsers require engagement before showing prompt

### CI/CD Pipeline Issues

**Tests Failing in CI but Passing Locally**:
- Check Node.js version matches (20+)
- Verify `npm ci` is used (not `npm install`)
- Check for environment-specific code
- Review GitHub Actions logs

**Deployment Not Triggering**:
- Verify branch name matches workflow (main/develop)
- Check GitHub Actions is enabled in repository
- Verify secrets are set correctly
- Check workflow file syntax (.github/workflows/ci-cd.yml)

**Netlify Deployment Fails**:
- Verify NETLIFY_AUTH_TOKEN secret is valid
- Check NETLIFY_SITE_ID is correct
- Review Netlify build logs
- Ensure environment variables are set in both GitHub and Netlify

### Analytics Not Showing Data

**No Events Appearing**:
- Wait 24-48 hours for initial data processing
- Verify Firebase Analytics is enabled
- Check browser console for analytics errors
- Test with Firebase Debug View (add ?analytics_debug=true to URL)
- Ensure ad blockers aren't interfering

**Events Not Tracking**:
- Check measurementId is correct in Firebase config
- Verify analytics initialization in main.ts
- Test in incognito mode
- Check network tab for analytics requests

### JSON Content Issues

**Viewpoints Not Loading**:
- Verify JSON file path: `/public/data/viewpoints.json`
- Check JSON syntax validity (use JSONLint)
- Ensure file is deployed (check dist/data/viewpoints.json)
- Review browser console for fetch errors

**Content Not Updating**:
- Clear browser cache
- Verify service worker cache is updated
- Check deployment included JSON file changes
- Force service worker update

## Troubleshooting: Phase 2 Features

### Countdown Timer Issues

**Timer Not Displaying**:
- Verify `public/data/site-config.json` exists and is valid JSON
- Check `voteDate` is in ISO 8601 format
- Ensure `featuresEnabled.countdown` is `true`
- Check browser console for JavaScript errors

**Timer Shows Negative Time**:
- Vote date has passed
- System should automatically switch to results view
- If stuck, verify `featuresEnabled.voteResults` updated

**Timer Not Updating**:
- Check JavaScript is enabled
- Verify no Content Security Policy blocking inline scripts
- Clear service worker cache

### Vote Results Not Calculating

**Results Page Blank**:
- Ensure vote date has passed
- Verify Firestore endorsement data is accessible
- Check Firebase connection (network tab)
- Review vote calculation logic in `src/vote-results.ts`

**Wrong Outcome Displayed**:
- Verify endorsement counts in Firestore are accurate
- Check calculation logic:
  - Progressive + Radical > Conservative + Moderate = Progressive future
  - Conservative + Moderate > Progressive + Radical = Conservative/Failed future
- Review `calculateVoteOutcome()` function

### Character Relationship Graph Issues

**Graph Not Rendering**:
- Verify `public/data/characters.json` loaded successfully
- Check `relationships` array in character data
- Browser console may show D3.js or rendering errors
- Ensure container element has dimensions

**Performance Issues on Mobile**:
- Graph complexity may be too high
- Consider lazy-loading the relationship visualization
- Reduce number of simultaneous connections displayed

### Newsletter Signup Failures

**Form Not Submitting**:
- Check Firestore rules allow writes to `newsletters` collection
- Verify Firebase initialized correctly
- Check network tab for failed requests
- Review error messages in browser console

**Emails Not Storing**:
- Firestore security rules may be blocking writes
- Check Firebase project quota limits
- Verify collection name matches `src/newsletter.ts`

**Integration with Email Service Failing**:
- Verify API keys are correct and active
- Check rate limits on email service
- Review API response in network tab
- Ensure CORS is configured if calling from client

### Easter Egg System Issues

**References Not Unlocking**:
- Check `sessionStorage` is enabled in browser
- Verify discovery triggers in `src/easter-eggs.ts`
- Review `public/data/cross-references.json` structure
- Check analytics for `easter_egg_discovered` events

**Progress Not Saving**:
- Easter eggs use sessionStorage (resets on browser close)
- This is intentional - encourages re-exploration
- To persist: migrate to localStorage or Firestore

### Outcome Scenario Issues

**Scenarios Not Loading**:
- Verify `public/data/outcomes.json` is valid JSON
- Check file is included in build (`dist/data/outcomes.json`)
- Review browser console for fetch errors
- Ensure service worker cached the file

**Probability Calculation Incorrect**:
- Verify real-time endorsement data is accessible
- Check Firestore listener is active
- Review calculation in `src/outcomes.ts`
- Ensure all four viewpoints are in calculation

**Comparison Mode Not Working**:
- Check if both scenarios selected
- Verify CSS for comparison layout
- Test on different screen sizes (may need scroll)

### Content Updates Not Appearing

**JSON Changes Not Reflecting**:
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Clear service worker cache
- Check deployment included updated files
- Verify correct file path in fetch calls

**Character/Scenario Updates Not Live**:
- Service worker may be serving cached version
- Update service worker version number in `vite.config.js`
- Force service worker update via DevTools

## Post-Launch Monitoring

### Key Metrics to Track (Phase 2)

1. **Vote Engagement**:
   - Countdown view rate
   - Vote result page traffic spike
   - Post-vote retention (do users return?)

2. **Character System**:
   - Most-viewed characters
   - Dossier unlock rate
   - Relationship graph engagement

3. **Scenario Explorer**:
   - Which future scenarios get most views?
   - Comparison mode usage rate
   - Correlation between endorsements and scenario views

4. **Cross-Promotion Effectiveness**:
   - Book link click-through rate
   - Easter egg discovery completion rate
   - Purchase conversions (if tracking available)

5. **Newsletter Conversion**:
   - Signup rate by source (post-endorsement vs. footer vs. countdown)
   - Email collection growth rate
   - Bounce/invalid email rate

### Automated Monitoring Setup

**Firebase Analytics**:
- Set up custom audiences for engaged users
- Create conversion funnels: Homepage → Endorse → Newsletter
- Track retention: 1-day, 7-day, 30-day return rates

**Netlify Analytics**:
- Monitor page load times for new heavy pages (/outcomes, /people)
- Track 404s for any broken links
- Bandwidth usage (ensure no unexpected spikes)

**Vote Day Preparation**:
- Schedule monitoring on vote day
- Prepare for traffic spike when results announced
- Have contingency if vote calculation fails
- Pre-write social media posts about results

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
