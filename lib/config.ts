/**
 * Centralized application configuration for Client
 * Eliminates all hard-coded URLs, ports, and constants.
 */
export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  DEFAULT_COURT: process.env.NEXT_PUBLIC_DEFAULT_COURT || 'ศาลจังหวัดระยอง',
  APP_NAME: 'JADS COURT',
  TOKEN_KEY: 'jads_token',
  USER_KEY: 'jads_user',
};
