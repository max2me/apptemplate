import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

interface ApiData {
  message: string;
  timestamp: number;
  date: string;
  formattedDate: string;
  path: string;
}

interface UseApi {
  data: ApiData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = (endpoint: string = '/datetime'): UseApi => {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = getApiUrl(endpoint);
      console.log(`Fetching data from: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data only once on component mount
    fetchData();
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
