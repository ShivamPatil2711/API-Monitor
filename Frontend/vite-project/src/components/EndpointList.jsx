import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from "sonner"; // Assuming you have sonner for error toasts

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  UP:      { dot: '🟢', label: 'UP',      bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
  DOWN:    { dot: '🔴', label: 'DOWN',    bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  TIMEOUT: { dot: '🟡', label: 'TIMEOUT', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
};

const METHOD_COLORS = {
  GET:    'bg-blue-100 text-blue-700',
  POST:   'bg-green-100 text-green-700',
  PUT:    'bg-orange-100 text-orange-700',
  PATCH:  'bg-purple-100 text-purple-700',
  DELETE: 'bg-red-100 text-red-700',
};

// ─── EndpointCard ─────────────────────────────────────────────────────────────
export const EndpointCard = ({ endpoint }) => {
  const cfg = STATUS_CONFIG[endpoint.status] || STATUS_CONFIG.UP;

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} px-6 py-4 flex items-center gap-4 hover:shadow-md transition-shadow`}>

      {/* Status dot + label */}
      <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
        <span className="text-xl leading-none">{cfg.dot}</span>
        <span className={`text-xs font-mono font-bold ${cfg.text}`}>{cfg.label}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-gray-200 flex-shrink-0" />

      {/* Endpoint Name */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{endpoint.name}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">Last Checked: {endpoint.lastChecked}</p>
      </div>

      {/* Method badge */}
      <div className="flex-shrink-0 w-20 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold ${METHOD_COLORS[endpoint.method] || 'bg-gray-100 text-gray-700'}`}>
          {endpoint.method}
        </span>
      </div>

      {/* Last Status Code */}
      <div className="flex-shrink-0 w-20 text-center">
        <p className={`text-lg font-mono font-bold ${cfg.text}`}>{endpoint.lastStatusCode}</p>
        <p className="text-xs text-gray-400 font-mono">Status</p>
      </div>

      {/* Latency */}
      <div className="flex-shrink-0 w-20 text-center">
        <p className="text-sm font-mono font-semibold text-gray-800">{endpoint.latency}</p>
        <p className="text-xs text-gray-400 font-mono">Latency</p>
      </div>

      {/* Success % */}
      <div className="flex-shrink-0 w-20 text-center">
        <p className="text-sm font-mono font-semibold text-gray-800">{endpoint.successRate}</p>
        <p className="text-xs text-gray-400 font-mono">Success</p>
      </div>

    </div>
  );
};

// ─── EndpointList ─────────────────────────────────────────────────────────────
const EndpointList = () => {
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real endpoints from your Go backend
  const fetchEndpoints = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`http://localhost:4003/api/endpoints`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
           },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch endpoints');
      }

      // Map the real DB data to match the UI card expectations.
      // (Mocking the real-time stats like status/latency until your monitoring engine is built)
      const mappedEndpoints = (data.data || []).map(ep => ({
        id: ep._id,
        name: ep.name,
        method: ep.method || 'GET',
        // --- Mocked fields below ---
        status: 'UP', 
        lastStatusCode: 200,
        latency: '120 ms',
        successRate: '100%',
        lastChecked: 'Just now',
      }));

      setEndpoints(mappedEndpoints);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast.error(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Run automatically when component mounts
  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleRefresh = () => {
    fetchEndpoints();
  };

  const upCount      = endpoints.filter((e) => e.status === 'UP').length;
  const downCount    = endpoints.filter((e) => e.status === 'DOWN').length;
  const timeoutCount = endpoints.filter((e) => e.status === 'TIMEOUT').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-3 transition"
            >
              <ArrowLeft size={18} />
              <span className="font-mono text-sm">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Endpoints</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Production APIs · {endpoints.length} endpoints</p>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-2xl text-gray-600 hover:bg-white transition text-sm font-mono ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
              disabled={refreshing}
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 mb-6">
          <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-mono font-semibold">
            🟢 {upCount} UP
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-mono font-semibold">
            🔴 {downCount} DOWN
          </span>
          <span className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-mono font-semibold">
            🟡 {timeoutCount} TIMEOUT
          </span>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 px-6 mb-2">
          <div className="w-20 flex-shrink-0">
            <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Status</p>
          </div>
          <div className="w-px h-4 bg-transparent flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Endpoint Name</p>
          </div>
          <div className="w-20 flex-shrink-0 text-center">
            <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Method</p>
          </div>
          <div className="w-20 flex-shrink-0 text-center">
            <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Last Code</p>
          </div>
          <div className="w-20 flex-shrink-0 text-center">
            <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Latency</p>
          </div>
          <div className="w-20 flex-shrink-0 text-center">
            <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">Success %</p>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {endpoints.length === 0 && !refreshing ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
              <p className="text-gray-400 font-mono text-sm">No endpoints yet.</p>
              <button
                onClick={() => navigate('/add-endpoints')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-2xl text-sm font-mono hover:bg-blue-700 transition"
              >
                <Plus size={15} /> Add your first endpoint
              </button>
            </div>
          ) : (
            endpoints.map((ep) => <EndpointCard key={ep.id} endpoint={ep} />)
          )}
        </div>

      </div>
    </div>
  );
};

export default EndpointList;