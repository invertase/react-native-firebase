/**
 * Shared visual tokens for the test-expo example screens, based on the
 * Invertase dark palette and official honey brand accent.
 */
export const theme = {
  background: '#040406',
  card: '#121317',
  border: '#202227',
  text: '#EEF0F1',
  subtleText: '#ABAEBB',
  placeholder: '#777A88',
  accent: '#E69135',
  success: '#00CA53',
  successBackground: '#071D11',
  successBorder: '#126C36',
  error: '#FF4D89',
  errorBackground: '#260A14',
  errorBorder: '#8D274A',
} as const;

export type Theme = typeof theme;
