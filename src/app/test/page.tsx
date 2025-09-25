'use client';

import { useState } from 'react';
import { api } from '@/lib/axios';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing API connection...');
    
    try {
      // Test health endpoint without /api prefix using fetch
      setResult(prev => prev + '\n📡 Testing health endpoint...');
      const healthResponse = await fetch('http://localhost:8080/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setResult(prev => prev + `\n✅ Health check: ${JSON.stringify(healthData)}`);
      } else {
        setResult(prev => prev + `\n❌ Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
      }
      
      // Test login endpoint dengan axios
      setResult(prev => prev + '\n📡 Testing login endpoint with axios...');
      try {
        const loginResponse = await api.post('/login', {
          username: 'admin',
          password: 'admin123'
        });
        setResult(prev => prev + `\n✅ Login test: Success!`);
        setResult(prev => prev + `\n   Token: ${loginResponse.data.token ? 'Received' : 'Missing'}`);
        setResult(prev => prev + `\n   User: ${JSON.stringify(loginResponse.data.user, null, 2)}`);
      } catch (loginError) {
        const err = loginError as {
          message?: string;
          response?: {
            status?: number;
            data?: { error?: string };
            headers?: Record<string, unknown>;
          };
          request?: unknown;
          code?: string;
        };
        setResult(prev => prev + `\n❌ Login test failed: ${err.message || 'Unknown error'}`);
        if (err.response) {
          setResult(prev => prev + `\n   Status: ${err.response.status || 'Unknown'}`);
          setResult(prev => prev + `\n   Error: ${err.response.data?.error || 'Unknown error'}`);
          setResult(prev => prev + `\n   Headers: ${JSON.stringify(err.response.headers || {}, null, 2)}`);
        } else if (err.request) {
          setResult(prev => prev + `\n   Network Error: ${err.code || 'UNKNOWN'}`);
          setResult(prev => prev + `\n   Message: ${err.message || 'Unknown error'}`);
        }
      }
      
      // Test with fetch directly to /api/login
      setResult(prev => prev + '\n📡 Testing login endpoint with fetch...');
      try {
        const fetchLoginResponse = await fetch('http://localhost:8080/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            username: 'admin',
            password: 'admin123'
          })
        });
        
        if (fetchLoginResponse.ok) {
          const fetchData = await fetchLoginResponse.json();
          setResult(prev => prev + `\n✅ Fetch login test: Success!`);
          setResult(prev => prev + `\n   Response: ${JSON.stringify(fetchData, null, 2)}`);
        } else {
          const errorData = await fetchLoginResponse.text();
          setResult(prev => prev + `\n❌ Fetch login test failed: ${fetchLoginResponse.status} ${fetchLoginResponse.statusText}`);
          setResult(prev => prev + `\n   Response: ${errorData}`);
        }
      } catch (fetchError) {
        const fetchErr = fetchError as { message?: string };
        setResult(prev => prev + `\n❌ Fetch login test failed: ${fetchErr.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('API Test Error:', error);
      const err = error as { message?: string; code?: string };
      setResult(prev => prev + `\n❌ API Test failed: ${err.message || 'Unknown error'}`);
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setResult(prev => prev + '\n❌ Cannot connect to backend server at localhost:8080');
        setResult(prev => prev + '\n💡 Make sure backend is running with: go run .');
      }
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    setLoading(true);
    setResult('Testing CORS...');
    
    try {
      const response = await fetch('http://localhost:8080/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(prev => prev + `\n✅ CORS test: ${JSON.stringify(data)}`);
      } else {
        setResult(prev => prev + `\n❌ CORS test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const err = error as { message?: string };
      setResult(prev => prev + `\n❌ CORS test failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-x-4 mb-4">
            <button
              onClick={testAPI}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API Connection'}
            </button>
            
            <button
              onClick={testCORS}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test CORS'}
            </button>
            
            <button
              onClick={() => setResult('')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
            {result || 'Click a test button to see results...'}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Environment Info</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</li>
            <li><strong>Node ENV:</strong> {process.env.NODE_ENV}</li>
            <li><strong>Browser:</strong> {typeof window !== 'undefined' ? 'Client-side' : 'Server-side'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}