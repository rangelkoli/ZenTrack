// Configuration variables

// API Base URL - change according to your environment
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api-domain.com/api'
  : 'http://127.0.0.1:5000';

// Other configuration variables
export const APP_NAME = 'Personal Dashboard';
