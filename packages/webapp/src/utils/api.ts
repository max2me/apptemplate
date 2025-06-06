/**
 * Determines if the current environment is local development
 */
export const isLocalEnvironment = (): boolean => {
  // Check if we're running in development mode
  if (import.meta.env.DEV) {
    return true;
  }
  
  // Check if we're running on localhost or local IP
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.startsWith('192.168.') ||
         hostname.startsWith('10.') ||
         hostname.startsWith('172.');
};

/**
 * Gets the appropriate base URL for API calls
 */
export const getApiBaseUrl = (): string => {
  if (isLocalEnvironment()) {
    // Use local development server
    return 'http://localhost:3001';
  } else {
    // Use remote API URL (will be replaced during build)
    return '{{ REMOTE_API_URL }}';
  }
};

/**
 * Constructs the full API URL for a given endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
};
