import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const DiagnosticTest = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const testResults = {};

    // Test 1: Check API URL
    testResults.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Test 2: Health Check
    try {
      const healthResponse = await fetch('https://oib-sip.onrender.com/api/health');
      const healthData = await healthResponse.json();
      testResults.health = { success: true, data: healthData };
    } catch (error) {
      testResults.health = { success: false, error: error.message };
    }

    // Test 3: Inventory Endpoint (Public)
    try {
      const inventoryResponse = await api.get('/inventory');
      testResults.inventory = { 
        success: true, 
        count: inventoryResponse.data.data?.length || 0 
      };
    } catch (error) {
      testResults.inventory = { 
        success: false, 
        error: error.message,
        response: error.response?.data
      };
    }

    // Test 4: Register Test (with fake data)
    try {
      const timestamp = Date.now();
      const registerResponse = await api.post('/auth/register', {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'test123456'
      });
      testResults.register = { 
        success: true, 
        message: registerResponse.data.message 
      };
    } catch (error) {
      testResults.register = { 
        success: false, 
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      };
    }

    // Test 5: CORS Test
    try {
      const corsResponse = await fetch('https://oib-sip.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      testResults.cors = { 
        success: corsResponse.ok,
        status: corsResponse.status,
        headers: Object.fromEntries(corsResponse.headers.entries())
      };
    } catch (error) {
      testResults.cors = { 
        success: false, 
        error: error.message 
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Diagnostic Test</h1>
        
        <button
          onClick={runTests}
          disabled={testing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg mb-6 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {testing ? 'Running Tests...' : 'Run Diagnostic Tests'}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {/* API URL */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-2">1. API URL Configuration</h2>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {results.apiUrl}
              </p>
            </div>

            {/* Health Check */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-2">
                2. Backend Health Check {results.health?.success ? '✅' : '❌'}
              </h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(results.health, null, 2)}
              </pre>
            </div>

            {/* Inventory Test */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-2">
                3. Inventory API Test {results.inventory?.success ? '✅' : '❌'}
              </h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(results.inventory, null, 2)}
              </pre>
            </div>

            {/* Register Test */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-2">
                4. Registration Test {results.register?.success ? '✅' : '❌'}
              </h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(results.register, null, 2)}
              </pre>
              {!results.register?.success && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 font-semibold">Common Issues:</p>
                  <ul className="list-disc ml-5 text-sm text-red-600">
                    <li>CORS blocked (check browser console)</li>
                    <li>Backend not deployed/redeployed</li>
                    <li>MongoDB connection issues</li>
                    <li>Missing environment variables on Render</li>
                  </ul>
                </div>
              )}
            </div>

            {/* CORS Test */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-2">
                5. CORS Test {results.cors?.success ? '✅' : '❌'}
              </h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(results.cors, null, 2)}
              </pre>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">📋 Summary</h2>
              <div className="space-y-1 text-sm">
                <p>✅ = Working | ❌ = Failed</p>
                <p className="font-mono">
                  Health: {results.health?.success ? '✅' : '❌'} | 
                  Inventory: {results.inventory?.success ? '✅' : '❌'} | 
                  Register: {results.register?.success ? '✅' : '❌'} | 
                  CORS: {results.cors?.success ? '✅' : '❌'}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h2 className="font-bold text-lg mb-2">🔧 If Tests Fail:</h2>
              <ol className="list-decimal ml-5 text-sm space-y-1">
                <li>Check that Render backend is deployed and running</li>
                <li>Verify FRONTEND_URL on Render matches your Vercel URL</li>
                <li>Redeploy Render backend to get latest CORS fixes</li>
                <li>Clear browser cache and try again</li>
                <li>Check browser console for detailed errors</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticTest;
