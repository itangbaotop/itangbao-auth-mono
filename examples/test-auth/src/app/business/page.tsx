'use client';

import { useState } from 'react';
import { ApiClient, ProtectedRoute, useApiClient } from 'itangbao-auth-react';

interface BusinessData {
  projectId: string;
  businessName: string;
  reportDate: string;
  accessedBy: string;
}

function BusinessContent() {
  const [data, setData] = useState<BusinessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the apiClient hook, which has the auto-refresh logic built-in.
  const apiClient: ApiClient = useApiClient();

  const handleFetchData = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // This call will automatically trigger the 401 -> refresh -> retry flow.
      const response = await apiClient.get('/api/some');
      setData(response.data.data);
    } catch (err: unknown) {
      console.error('Error fetching business data:', err);
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Business Data Page</h1>
      <p className="text-gray-600 mb-6">
        This page is protected. Click the button below to fetch sensitive data. 
        If your access token is expired, the system will attempt to refresh it silently before retrying the request.
      </p>

      <button
        onClick={handleFetchData}
        disabled={isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isLoading ? 'Fetching...' : 'Fetch Business Data'}
      </button>

      <div className="mt-8 p-4 border rounded-md bg-gray-50 min-h-[150px]">
        <h2 className="text-lg font-semibold text-gray-800">API Response:</h2>
        {isLoading && <p className="text-gray-500">Loading...</p>}
        {error && <pre className="text-red-500 bg-red-50 p-2 rounded-md">Error: {error}</pre>}
        {data && <pre className="text-green-700 bg-green-50 p-2 rounded-md">{JSON.stringify(data, null, 2)}</pre>}
        {!isLoading && !error && !data && <p className="text-gray-500">Click the button to see the result.</p>}
      </div>
    </div>
  );
}

// Wrap the component with ProtectedRoute to ensure the user is logged in
export default function BusinessPage() {
  return (
    <ProtectedRoute>
      <BusinessContent />
    </ProtectedRoute>
  );
}