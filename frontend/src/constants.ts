export const TRIAL_LIMIT_MS = 1 * 60 * 1000; // 10 minutes
export const PREMIUM_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export const PAYMENT_PROCESSING_STATUS = {
  DETAILS: 'details',
  PROCESSING: 'processing',
  SUCCESS: 'success',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const MAX_RETRY_ATTEMPTS = 3;

export const FEATURE_MODE = {
  FREE: 'free',
  PREMIUM: 'premium'
}