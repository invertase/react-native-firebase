/**
 * Shared visual tokens for the test-expo example screens. Kept deliberately
 * small and light-only (no dark mode) so every screen looks consistent
 * without needing per-screen styling decisions.
 */
export const theme = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  border: '#E2E2E8',
  text: '#111827',
  subtleText: '#6B7280',
  placeholder: '#9CA3AF',
  accent: '#2F6FED',
  success: '#15803D',
  successBackground: '#ECFDF3',
  successBorder: '#B7EFC5',
  error: '#B42318',
  errorBackground: '#FEF3F2',
  errorBorder: '#FDA29B',
} as const;

export type Theme = typeof theme;
