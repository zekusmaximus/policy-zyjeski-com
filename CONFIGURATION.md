# ECC Portal Configuration Guide

This guide covers all configurable aspects of the ECC Legislative Portal.

## Quick Start

### Essential Files to Configure Before Launch

1. **`public/data/site-config.json`** - Vote date and feature flags
2. **`public/data/books.json`** - Your actual published works
3. **`public/data/cross-references.json`** - Portal-to-book connections
4. **`.env`** - Firebase credentials and optional services

## Detailed Configuration

### 1. Vote System (`public/data/site-config.json`)

```json
{
  "voteDate": "2025-12-17T18:00:00Z",
  "inUniverseVoteDate": "January 15, 2078",
  "votingEnabled": true,
  "featuresEnabled": {
    "countdown": true,
    "voteResults": false
  }
}
```

**Fields**:

- `voteDate`: ISO 8601 timestamp for when vote occurs
- `inUniverseVoteDate`: Human-readable in-universe date displayed to users
- `votingEnabled`: Set to `false` to disable endorsements before/after vote
- `countdown`: Show/hide countdown timer
- `voteResults`: Automatically set to `true` after vote occurs

**Vote Date Best Practices**:

- Set 30-60 days from launch for maximum anticipation
- Schedule for high-traffic time (weekend afternoon recommended)
- Coordinate with newsletter announcement
- Allow time for engagement before vote closes

### 2. Author Books (`public/data/books.json`)

```json
{
  "books": [
    {
      "id": "book_1",
      "title": "The Synth Conspiracy",
      "series": "ECC Chronicles",
      "volume": 1,
      "status": "published",
      "publishDate": "2024-03-15",
      "description": "In 2065, a corporate conspiracy threatens...",
      "purchaseUrl": "https://amazon.com/dp/...",
      "coverImage": "/images/covers/synth-conspiracy.jpg",
      "genres": ["Science Fiction", "Thriller", "Cyberpunk"]
    }
  ]
}
```

**Status Values**:

- `published`: Book is available now
- `forthcoming`: Coming soon (shows release date)
- `draft`: Hidden from public view

**Purchase URL Tips**:

- Use Amazon affiliate links for royalties
- Link to publisher page if traditionally published
- Create custom landing page with multiple purchase options

### 3. Cross-References (`public/data/cross-references.json`)

```json
{
  "references": [
    {
      "id": "ref_001",
      "location": "lore-timeline-event-3",
      "bookId": "book_1",
      "referenceType": "event",
      "description": "The Providence Breakthrough is detailed in Chapter 4",
      "hint": "Check the 2041 timeline event",
      "discoveryTrigger": "view-lore-page"
    }
  ]
}
```

**Reference Types**:

- `character`: Character appears in book
- `event`: Historical event detailed in book
- `location`: Place described in book
- `technology`: Tech concept explored in book
- `organization`: Institution featured in book

**Discovery Triggers**:

- `view-lore-page`: Found by visiting lore
- `read-news-article`: Found by reading specific article
- `view-character`: Found by viewing character bio
- `unlock-dossier`: Found by unlocking classified info
- `explore-outcome`: Found by viewing future scenario

### 4. Newsletter Integration

#### Firestore-Only Mode (Default)

No additional configuration needed. Emails stored in `newsletters` collection.

#### Mailchimp Integration

```env
VITE_MAILCHIMP_API_KEY=your_api_key_here
VITE_MAILCHIMP_SERVER_PREFIX=us12
VITE_MAILCHIMP_LIST_ID=your_list_id_here
```

Update `src/newsletter.ts`:

```typescript
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: import.meta.env.VITE_MAILCHIMP_API_KEY,
  server: import.meta.env.VITE_MAILCHIMP_SERVER_PREFIX,
});

// In submitNewsletter function:
await mailchimp.lists.addListMember(
  import.meta.env.VITE_MAILCHIMP_LIST_ID,
  { email_address: email, status: "subscribed" }
);
```

#### ConvertKit Integration

```env
VITE_CONVERTKIT_API_KEY=your_api_key_here
VITE_CONVERTKIT_FORM_ID=your_form_id_here
```

### 5. Character & Outcome Content

While character bios and outcome scenarios are in JSON files, they contain substantial narrative content. Best practices:

**Characters** (`public/data/characters.json`):

- Keep bios to 150-250 words
- Include clear position on the Act
- Link to at least one book (even if fictional for now)
- Ensure relationships are bidirectional (if A knows B, B knows A)

**Outcomes** (`public/data/outcomes.json`):

- Each scenario should feel plausible and distinct
- Timeline events should build logically
- Include consequences for all major characters
- Flash-forward headlines add realism

### 6. Feature Flags

You can disable features temporarily by editing `site-config.json`:

```json
{
  "featuresEnabled": {
    "countdown": false,        // Hides countdown widget
    "voteResults": false,      // Hides results page
    "newsletter": true,        // Shows newsletter signup
    "easterEggs": true,        // Enables reference discovery
    "characterDossiers": true  // Allows unlocking classified info
  }
}
```

Useful for:

- Phased rollout of features
- A/B testing different configurations
- Temporarily disabling buggy features

## Updating Content

### Safe Update Workflow

1. **Edit JSON files locally**
2. **Validate JSON** (use JSONLint or VS Code)
3. **Test locally**: `npm run dev`
4. **Commit and push** to trigger deployment
5. **Clear service worker cache** on live site after deploy

### Common Updates

**Change vote date**:

```json
// public/data/site-config.json
"voteDate": "2026-01-15T18:00:00Z"
```

**Add new character**:

```json
// public/data/characters.json
{
  "id": "char_9",
  "name": "New Character",
  // ... full character object
}
```

**Update book purchase link**:

```json
// public/data/books.json
"purchaseUrl": "https://new-link.com"
```

All changes deploy automatically via GitHub Actions if pushed to `main` branch.

## Environment Variables Reference

### Required (Firebase)

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_CLOUD_FUNCTION_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/submitEndorsement
```

### Optional (Email Service Integration)

**Mailchimp**:
```env
VITE_MAILCHIMP_API_KEY=your_api_key
VITE_MAILCHIMP_SERVER_PREFIX=us12
VITE_MAILCHIMP_LIST_ID=your_list_id
```

**ConvertKit**:
```env
VITE_CONVERTKIT_API_KEY=your_api_key
VITE_CONVERTKIT_FORM_ID=your_form_id
```

**Buttondown**:
```env
VITE_BUTTONDOWN_API_KEY=your_api_key
```

## Advanced Configuration

### Custom Analytics Events

Add custom events to track specific user behaviors. In your TypeScript files:

```typescript
import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase-config';

// Track custom event
logEvent(analytics, 'custom_event_name', {
  parameter1: 'value1',
  parameter2: 'value2'
});
```

### Adjusting Rate Limits

To modify endorsement rate limits, edit `functions/index.js`:

```javascript
const RATE_LIMIT = 10; // endorsements per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
```

Deploy the changes:
```bash
firebase deploy --only functions
```

### Service Worker Caching Strategy

Modify caching behavior in `vite.config.js`:

```javascript
runtimeCaching: [
  {
    urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'firebase-storage-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      }
    }
  }
]
```

### Content Security Policy

Adjust CSP headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://www.googletagmanager.com; ..."
```

## Troubleshooting Configuration

### Vote Date Not Working

**Issue**: Countdown shows incorrect time or doesn't appear

**Solutions**:
- Verify ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Ensure timezone is UTC (ends with `Z`)
- Check browser timezone isn't causing offset issues
- Validate JSON syntax with JSONLint

### Books Not Appearing

**Issue**: Books page is empty or missing entries

**Solutions**:
- Verify `books.json` is in `public/data/` directory
- Check JSON syntax is valid
- Ensure `status` field is set to `"published"`
- Clear service worker cache and hard refresh
- Check browser console for fetch errors

### Cross-References Not Linking

**Issue**: Easter eggs not discoverable or links broken

**Solutions**:
- Verify `bookId` matches ID in `books.json`
- Check `location` matches actual portal element IDs
- Ensure `discoveryTrigger` matches implemented triggers
- Review `src/easter-eggs.ts` for trigger implementation
- Check analytics for `easter_egg_discovered` events

### Newsletter Not Storing Emails

**Issue**: Form submits but emails don't appear in Firestore

**Solutions**:
- Check Firestore security rules allow writes to `newsletters` collection
- Verify Firebase initialization in `src/newsletter.ts`
- Review network tab for failed requests
- Check Firebase quota limits haven't been exceeded
- Ensure collection name matches exactly: `newsletters`

### Feature Flags Not Working

**Issue**: Disabling features in `site-config.json` has no effect

**Solutions**:
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
- Clear service worker cache
- Verify `site-config.json` is valid JSON
- Check fetch logic in `src/main.ts`
- Ensure deployment included updated config file

## Configuration Best Practices

1. **Version Control**: Always commit configuration changes to Git
2. **Environment Separation**: Use different Firebase projects for dev/staging/production
3. **Secret Management**: Never commit API keys to public repositories
4. **Validation**: Use JSONLint or VS Code to validate JSON before committing
5. **Documentation**: Comment complex configuration decisions in code
6. **Testing**: Test configuration changes locally before deploying
7. **Monitoring**: Set up alerts for configuration-related errors in Firebase
8. **Backup**: Keep backups of working configurations before major changes

## Next Steps

- Review [README.md](./README.md) for feature overview
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- Check [SECURITY.md](./SECURITY.md) for security best practices

For questions or issues, please open an issue on GitHub.
