import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  UP:      { dot: 'bg-green-500',  label: 'UP',      bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-800',  left: 'border-l-green-500'  },
  DOWN:    { dot: 'bg-red-500',    label: 'DOWN',     bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800',      left: 'border-l-red-500'    },
  TIMEOUT: { dot: 'bg-yellow-400', label: 'TIMEOUT',  bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800', left: 'border-l-yellow-400' },
};

const METHOD_COLORS = {
  GET:    'bg-blue-100 text-blue-800',
  POST:   'bg-green-100 text-green-800',
  PUT:    'bg-orange-100 text-orange-800',
  PATCH:  'bg-purple-100 text-purple-800',
  DELETE: 'bg-red-100 text-red-800',
};

function fmtLatency(ms) {
  if (ms == null || ms === 0) return '—';
  if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
  return ms + 'ms';
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    const diff = Math.floor((Date.now() - dt) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return dt.toLocaleDateString();
  } catch { return '—'; }
}

function codeColor(code) {
  if (!code) return 'text-gray-500';
  if (code >= 200 && code < 300) return 'text-green-700';
  if (code >= 400) return 'text-red-600';
  if (code >= 300) return 'text-yellow-600';
  return 'text-gray-500';
}

function latencyColor(ms) {
  if (!ms) return 'text-gray-500';
  if (ms > 1000) return 'text-red-600';
  if (ms > 500) return 'text-yellow-600';
  return 'text-green-700';
}

// ─── Expandable detail panel ──────────────────────────────────────────────────
const DetailPanel = ({ ep }) => {
  let parsedBody = null;
  if (ep.body) {
    try { parsedBody = JSON.stringify(JSON.parse(ep.body), null, 2); }
    catch { parsedBody = ep.body; }
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Left: endpoint details */}
        <div>
          <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-3">Endpoint config</p>
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">URL</span>
              <span className="text-xs font-mono text-blue-600 break-all text-right max-w-xs">{ep.url || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">Method</span>
              <span className="text-xs font-mono text-gray-800">{ep.method || '—'}</span>
            </div>
            {ep.headers && Object.keys(ep.headers).length > 0 && (
              Object.entries(ep.headers).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500 font-mono">{k}</span>
                  <span className="text-xs font-mono text-gray-700 text-right max-w-xs truncate">{v}</span>
                </div>
              ))
            )}
          </div>
          {parsedBody && (
            <div className="mt-3">
              <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-2">Request body</p>
              <pre className="text-xs font-mono bg-white border border-gray-200 rounded-lg p-3 overflow-auto max-h-28 text-gray-700 whitespace-pre-wrap break-all">{parsedBody}</pre>
            </div>
          )}
        </div>

        {/* Right: validation + last result */}
        <div>
          <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-3">Validation</p>
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">Expected status</span>
              <span className="text-xs font-mono text-gray-800">{ep.validation?.expectedStatus ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">Max response time</span>
              <span className="text-xs font-mono text-gray-800">{ep.validation?.maxResponseTime ? ep.validation.maxResponseTime + 'ms' : '—'}</span>
            </div>
            {ep.validation?.expectedResponse && (
              <div className="flex justify-between gap-4">
                <span className="text-xs text-gray-500 font-mono">Expected body</span>
                <span className="text-xs font-mono text-gray-700 text-right max-w-xs truncate">{ep.validation.expectedResponse}</span>
              </div>
            )}
          </div>

          <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Last check result</p>
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">Status code</span>
              <span className={`text-xs font-mono font-semibold ${codeColor(ep.lastStatusCode)}`}>{ep.lastStatusCode || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">Latency</span>
              <span className={`text-xs font-mono font-semibold ${latencyColor(ep.lastLatency)}`}>{fmtLatency(ep.lastLatency)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500 font-mono">Checked at</span>
              <span className="text-xs font-mono text-gray-700">{fmtDate(ep.lastCheckedAt)}</span>
            </div>
            {ep.lastError && (
              <div className="flex justify-between gap-4">
                <span className="text-xs text-gray-500 font-mono">Error</span>
                <span className="text-xs font-mono text-red-600 text-right max-w-xs break-words">{ep.lastError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── EndpointCard ─────────────────────────────────────────────────────────────
export const EndpointCard = ({ endpoint }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[endpoint.currentStatus] || STATUS_CONFIG.UP;

  return (
    <div className={`rounded-2xl border ${cfg.border} bg-white border-l-4 ${cfg.left} overflow-hidden transition-shadow hover:shadow-sm`}
      style={{ borderLeftWidth: '3px' }}>

      {/* Main row */}
      <div
        className="px-5 py-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {/* Status */}
        <div className="flex flex-col items-center gap-1 w-16 flex-shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
          <span className={`text-[10px] font-mono font-bold ${cfg.text}`}>{cfg.label}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-100 flex-shrink-0" />

        {/* Name + URL */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{endpoint.name}</p>
          <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{endpoint.url}</p>
        </div>

        {/* Method */}
        <div className="flex-shrink-0 w-16 text-center">
          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${METHOD_COLORS[endpoint.method] || 'bg-gray-100 text-gray-700'}`}>
            {endpoint.method || 'GET'}
          </span>
        </div>

        {/* Last status code */}
        <div className="flex-shrink-0 w-16 text-center">
          <p className={`text-base font-mono font-bold ${codeColor(endpoint.lastStatusCode)}`}>
            {endpoint.lastStatusCode || '—'}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">code</p>
        </div>

        {/* Latency */}
        <div className="flex-shrink-0 w-16 text-center">
          <p className={`text-sm font-mono font-semibold ${latencyColor(endpoint.lastLatency)}`}>
            {fmtLatency(endpoint.lastLatency)}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">latency</p>
        </div>

        {/* Checked */}
        <div className="flex-shrink-0 w-20 text-right hidden sm:block">
          <p className="text-xs text-gray-400 font-mono">{fmtDate(endpoint.lastCheckedAt)}</p>
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 text-gray-400">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Detail panel */}
      {open && <DetailPanel ep={endpoint} />}
    </div>
  );
};

// ─── EndpointList ─────────────────────────────────────────────────────────────
const EndpointList = () => {
  const navigate = useNavigate();
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchEndpoints = async () => {
    try {
      refreshing ? null : setLoading(true);
      setRefreshing(true);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4003'}/api/endpoints`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch endpoints');

      // Map directly from real DB fields — no mocking
      const mapped = (data.data || []).map(ep => ({
        _id:           ep._id,
        name:          ep.name,
        url:           ep.url,
        method:        ep.method || 'GET',
        headers:       ep.headers || {},
        body:          ep.body || '',
        validation:    ep.validation || {},
        currentStatus: ep.currentStatus || 'UP',
        lastStatusCode: ep.lastStatusCode,
        lastLatency:   ep.lastLatency,
        lastCheckedAt: ep.lastCheckedAt,
        lastError:     ep.lastError || '',
      }));
    console.log('Fetched endpoints:', mapped);
      setEndpoints(mapped);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEndpoints(); }, []);

  const upCount      = endpoints.filter(e => e.currentStatus === 'UP').length;
  const downCount    = endpoints.filter(e => e.currentStatus === 'DOWN').length;
  const timeoutCount = endpoints.filter(e => e.currentStatus === 'TIMEOUT').length;

  const filtered = filter === 'ALL'
    ? endpoints
    : endpoints.filter(e => e.currentStatus === filter);

  const FILTERS = [
    { key: 'ALL',     label: `All (${endpoints.length})`,   active: 'bg-gray-100 text-gray-700 border-gray-300' },
    { key: 'UP',      label: `Up (${upCount})`,             active: 'bg-green-100 text-green-700 border-green-300' },
    { key: 'DOWN',    label: `Down (${downCount})`,         active: 'bg-red-100 text-red-700 border-red-300' },
    { key: 'TIMEOUT', label: `Timeout (${timeoutCount})`,   active: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 mb-3 transition text-sm font-mono"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Endpoints</h1>
            <p className="text-gray-500 font-mono text-xs mt-1">
              {loading ? 'Loading...' : `${endpoints.length} endpoint${endpoints.length !== 1 ? 's' : ''} · ${upCount} up · ${downCount} down`}
            </p>
          </div>

          <button
            onClick={fetchEndpoints}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition text-sm font-mono mt-6 ${refreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total',   val: endpoints.length, color: 'text-gray-800' },
            { label: 'Up',      val: upCount,           color: 'text-green-700' },
            { label: 'Down',    val: downCount,         color: 'text-red-600' },
            { label: 'Timeout', val: timeoutCount,      color: 'text-yellow-600' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
              <p className="text-xs font-mono text-gray-400 mb-1">{m.label}</p>
              <p className={`text-2xl font-bold font-mono ${m.color}`}>{m.val}</p>
            </div>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition
                ${filter === f.key ? f.active : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 px-5 mb-2">
          <div className="w-16 flex-shrink-0 text-center">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">Status</p>
          </div>
          <div className="w-px flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">Endpoint</p>
          </div>
          <div className="w-16 flex-shrink-0 text-center">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">Method</p>
          </div>
          <div className="w-16 flex-shrink-0 text-center">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">Code</p>
          </div>
          <div className="w-16 flex-shrink-0 text-center">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">Latency</p>
          </div>
          <div className="w-20 flex-shrink-0 text-right hidden sm:block">
            <p className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">Checked</p>
          </div>
          <div className="w-4 flex-shrink-0" />
        </div>

        {/* Cards */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white px-5 py-4 animate-pulse h-16" />
            ))
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
              <p className="text-gray-400 font-mono text-sm">No endpoints for this filter.</p>
            </div>
          ) : (
            filtered.map(ep => <EndpointCard key={ep._id} endpoint={ep} />)
          )}
        </div>

      </div>
    </div>
  );
};

export default EndpointList;