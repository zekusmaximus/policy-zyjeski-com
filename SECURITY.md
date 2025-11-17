# Security Implementation Guide

This document outlines the security measures implemented in the ECC Legislative Portal.

## Overview

The application implements multiple layers of security to protect against common vulnerabilities and abuse:

1. **Firestore Security Rules** - Database-level access control
2. **Server-side Rate Limiting** - Prevents vote manipulation and abuse
3. **Input Validation** - Validates all client inputs
4. **Error Handling** - Prevents information leakage
5. **Memory Leak Prevention** - Proper cleanup of listeners

## Firestore Security Rules

### Implementation

The `firestore.rules` file implements strict access controls:

```
- Viewpoints collection: READ-ONLY from client
- Direct writes are BLOCKED
- All writes must go through Cloud Functions
- Rate limiting data is protected from client access
```

### Deployment

Deploy security rules to Firebase:

```bash
firebase deploy --only firestore:rules
```

### Why This Matters

Without proper security rules, malicious users could:
- Directly manipulate vote counts
- Delete or modify testimony data
- Access rate limiting data to bypass restrictions

## Rate Limiting System

### How It Works

1. User clicks "Endorse" button
2. Client calls Cloud Function (not direct database)
3. Cloud Function checks IP-based rate limit:
   - **Limit**: 10 endorsements per hour per IP
   - **Window**: Rolling 1-hour window
   - **Tracking**: IP addresses are hashed and stored
4. If within limits, increment count
5. If exceeded, return 429 error with retry-after time

### Configuration

Rate limits are configured in `functions/index.js`:

```javascript
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENDORSEMENTS_PER_WINDOW = 10; // Max per IP
```

### Benefits

- Prevents automated voting bots
- Stops users from clearing sessionStorage to vote repeatedly
- Mitigates DDoS attacks on the endorsement system
- IP-based tracking works even in incognito mode

### Cloud Function Setup

1. **Install Dependencies**:
   ```bash
   cd functions
   npm install
   ```

2. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

3. **Set Environment Variable**:
   Add to your `.env` or Netlify environment:
   ```
   VITE_CLOUD_FUNCTION_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/submitEndorsement
   ```

## Input Validation

All user inputs are validated before processing:

### Viewpoint ID Validation

```javascript
const VALID_VIEWPOINT_IDS = ['viewpoint_1', 'viewpoint_2', 'viewpoint_3', 'viewpoint_4'];

// Client-side validation
if (!viewpointId || !VALID_VIEWPOINT_IDS.includes(viewpointId)) {
    showToast('Invalid viewpoint selection', 'error');
    return;
}

// Server-side validation (Cloud Function)
if (!VALID_VIEWPOINT_IDS.includes(viewpointId)) {
    response.status(400).json({ error: 'Invalid viewpoint ID' });
}
```

This prevents:
- DOM manipulation attacks
- Injection of arbitrary document IDs
- Database errors from invalid references

## Error Handling

### User-Facing Errors

Errors are displayed via toast notifications with user-friendly messages:

```javascript
showToast('Failed to submit endorsement. Please try again.', 'error');
```

### Developer-Only Logging

Detailed errors are logged only in development mode:

```javascript
if (import.meta.env.DEV) {
    console.error('Detailed error:', error);
}
```

This prevents exposing sensitive information in production.

### Error Rollback

If an endorsement fails, the UI is rolled back to its previous state:

```javascript
// Store original state
const originalText = button.textContent;
const originalDisabled = button.disabled;

// On error, rollback
button.disabled = originalDisabled;
button.textContent = originalText;
```

## Memory Leak Prevention

### The Problem

Firebase's `onSnapshot()` creates a persistent listener. Without cleanup, navigating between pages creates multiple listeners, causing:
- Increased memory usage
- Multiple redundant database connections
- Poor performance over time

### The Solution

```javascript
let viewpointsUnsubscribe = null;

function attachRealtimeListeners() {
    // Clean up previous listener
    if (viewpointsUnsubscribe) {
        viewpointsUnsubscribe();
    }

    // Create new listener and store cleanup function
    viewpointsUnsubscribe = onSnapshot(collection(db, "viewpoints"), ...);
}
```

## Request Timeout Protection

All network requests include timeout protection:

```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

const response = await fetch(url, {
    signal: controller.signal
});

clearTimeout(timeoutId);
```

This prevents:
- Hung requests from freezing the UI
- Resource exhaustion from long-running requests

## Network Error Detection

The app detects offline status and provides appropriate feedback:

```javascript
if (!navigator.onLine) {
    showToast('You appear to be offline. Please check your connection.', 'error');
}
```

## Security Headers

Deployed with security headers via `netlify.toml`:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer info

## Future Security Enhancements

### Recommended Improvements

1. **Content Security Policy (CSP)**:
   - Remove `unsafe-inline` and `unsafe-eval`
   - Use nonce-based CSP with Vite

2. **Firebase Authentication**:
   - Add user authentication
   - Track endorsements by user ID instead of IP
   - Enable more precise rate limiting

3. **CAPTCHA Integration**:
   - Add reCAPTCHA to endorsement form
   - Prevent automated abuse

4. **Audit Logging**:
   - Log all endorsement attempts
   - Track suspicious patterns
   - Enable forensic analysis

5. **DDoS Protection**:
   - Implement Cloudflare or similar CDN
   - Add additional rate limiting at network edge

## Testing Security

### Manual Testing

1. **Rate Limit Test**:
   - Click endorse 10 times rapidly
   - Verify 11th click shows rate limit error

2. **Offline Test**:
   - Disable network
   - Try to endorse
   - Verify offline error message

3. **Invalid Input Test**:
   - Modify DOM attribute `data-viewpoint-id` to invalid value
   - Click endorse
   - Verify validation error

### Automated Testing

Consider adding tests for:
- Rate limiting logic (Cloud Functions)
- Input validation
- Error handling flows
- Memory leak prevention

## Security Incident Response

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Contact the repository owner privately
3. Provide detailed reproduction steps
4. Allow time for fixes before public disclosure

## Compliance

This implementation follows:
- OWASP Top 10 security practices
- Firebase security best practices
- Modern web application security standards
