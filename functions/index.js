/**
 * Cloud Functions for ECC Legislative Portal
 * Handles endorsement submission with rate limiting
 */

import {onRequest} from 'firebase-functions/v2/https';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENDORSEMENTS_PER_WINDOW = 10; // Max 10 endorsements per hour per IP
const VALID_VIEWPOINT_IDS = ['viewpoint_1', 'viewpoint_2', 'viewpoint_3', 'viewpoint_4'];

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
function getClientIp(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers['x-real-ip'] || request.ip || 'unknown';
}

/**
 * Check if client has exceeded rate limit
 */
async function checkRateLimit(clientIp) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const trackingId = `ip_${clientIp.replace(/[.:]/g, '_')}`;

  const trackingRef = db.collection('endorsement_tracking').doc(trackingId);
  const trackingDoc = await trackingRef.get();

  if (!trackingDoc.exists) {
    // First endorsement from this IP
    await trackingRef.set({
      endorsements: [{timestamp: now}],
      lastUpdated: now,
    });
    return {allowed: true, remaining: MAX_ENDORSEMENTS_PER_WINDOW - 1};
  }

  const data = trackingDoc.data();
  // Filter out old endorsements outside the window
  const recentEndorsements = (data.endorsements || [])
      .filter((e) => e.timestamp > windowStart);

  if (recentEndorsements.length >= MAX_ENDORSEMENTS_PER_WINDOW) {
    const oldestEndorsement = Math.min(...recentEndorsements.map((e) => e.timestamp));
    const retryAfterMs = oldestEndorsement + RATE_LIMIT_WINDOW_MS - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil(retryAfterMs / 1000), // seconds
    };
  }

  // Add new endorsement
  recentEndorsements.push({timestamp: now});
  await trackingRef.update({
    endorsements: recentEndorsements,
    lastUpdated: now,
  });

  return {
    allowed: true,
    remaining: MAX_ENDORSEMENTS_PER_WINDOW - recentEndorsements.length,
  };
}

/**
 * Submit Endorsement Cloud Function
 * Handles endorsement submission with rate limiting and validation
 */
export const submitEndorsement = onRequest(
    {
      cors: true, // Enable CORS for client-side calls
      region: 'us-central1',
    },
    async (request, response) => {
      // Only allow POST requests
      if (request.method !== 'POST') {
        response.status(405).json({
          success: false,
          error: 'Method not allowed. Use POST.',
        });
        return;
      }

      try {
        const {viewpointId} = request.body;

        // Validate viewpoint ID
        if (!viewpointId || !VALID_VIEWPOINT_IDS.includes(viewpointId)) {
          response.status(400).json({
            success: false,
            error: 'Invalid viewpoint ID',
          });
          return;
        }

        // Get client IP and check rate limit
        const clientIp = getClientIp(request);
        const rateLimitResult = await checkRateLimit(clientIp);

        if (!rateLimitResult.allowed) {
          response.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter,
            message: `Too many endorsements. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
          });
          return;
        }

        // Update endorsement count in Firestore
        const viewpointRef = db.collection('viewpoints').doc(viewpointId);
        await viewpointRef.update({
          endorsements: FieldValue.increment(1),
        });

        response.status(200).json({
          success: true,
          remaining: rateLimitResult.remaining,
          message: 'Endorsement recorded successfully',
        });
      } catch (error) {
        console.error('Error submitting endorsement:', error);

        // Check if it's a "document not found" error
        if (error.code === 5) {
          response.status(500).json({
            success: false,
            error: 'Database configuration error. Please contact administrator.',
          });
        } else {
          response.status(500).json({
            success: false,
            error: 'Failed to submit endorsement. Please try again.',
          });
        }
      }
    },
);
