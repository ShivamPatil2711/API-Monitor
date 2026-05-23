import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Edit2 } from 'lucide-react';
import { toast } from "sonner";

// ─── Blank endpoint template ──────────────────────────────────────────────────
const blankEndpoint = () => ({
  id: Date.now(),
  saved: false,
  name: '',
  url: '',
  method: 'GET',
  headers: [{ key: '', value: '' }],
  queryParams: [{ key: '', value: '' }],
  body: '',
  expectedStatus: '200',
  expectedResponse: '',
  maxResponseTime: '',
});

// ─── Single Endpoint Card ─────────────────────────────────────────────────────
const EndpointCard = ({ endpoint, index, onSave, onRemove, onEdit }) => {
  const [local, setLocal] = useState({ ...endpoint });

  const needsBody = ['POST', 'PUT', 'PATCH'].includes(local.method);

  const updateHeader = (i, field, val) => {
    const h = [...local.headers];
    h[i][field] = val;
    setLocal({ ...local, headers: h });
  };
  const addHeader = () => setLocal({ ...local, headers: [...local.headers, { key: '', value: '' }] });
  const removeHeader = (i) => setLocal({ ...local, headers: local.headers.filter((_, idx) => idx !== i) });

  const updateParam = (i, field, val) => {
    const p = [...local.queryParams];
    p[i][field] = val;
    setLocal({ ...local, queryParams: p });
  };
  const addParam = () => setLocal({ ...local, queryParams: [...local.queryParams, { key: '', value: '' }] });
  const removeParam = (i) => setLocal({ ...local, queryParams: local.queryParams.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    if (!local.name || !local.url) {
      toast.error('Endpoint name and URL are required');
      return;
    }
    onSave({ ...local, saved: true });
  };

  // ── Saved (collapsed) view ──
  if (endpoint.saved) {
    return (
      <div className="bg-white rounded-3xl shadow border border-gray-200 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">{endpoint.name}</p>
            <p className="text-xs font-mono text-gray-500">{endpoint.method} · {endpoint.url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(endpoint.id)}
            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-2xl transition"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(endpoint.id)}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-2xl transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Expanded (edit) view ──
  return (
    <div className="bg-white rounded-3xl shadow-lg border-2 border-blue-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-mono">
            {index + 1}
          </span>
          Endpoint {index + 1}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(endpoint.id)}
            className="text-red-500 hover:text-red-700 transition"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            value={local.name}
            onChange={(e) => setLocal({ ...local, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
            placeholder="Login"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-mono font-medium text-gray-700 mb-2">URL *</label>
          <input
            type="text"
            value={local.url}
            onChange={(e) => setLocal({ ...local, url: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
            placeholder="https://api.example.com/login"
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-sm font-mono font-medium text-gray-700 mb-2">HTTP Method *</label>
          <div className="grid grid-cols-5 gap-3">
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setLocal({ ...local, method: m })}
                className={`px-4 py-2 rounded-2xl font-mono font-medium transition ${
                  local.method === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Headers */}
        <div>
          <label className="block text-sm font-mono font-medium text-gray-700 mb-3">Headers (optional)</label>
          {local.headers.map((h, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <input
                type="text" value={h.key}
                onChange={(e) => updateHeader(i, 'key', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                placeholder="Header-Name"
              />
              <input
                type="text" value={h.value}
                onChange={(e) => updateHeader(i, 'value', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                placeholder="Header Value"
              />
              <button type="button" onClick={() => removeHeader(i)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-2xl transition">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addHeader} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-mono text-sm">
            <Plus size={16} /> Add Header
          </button>
        </div>

   
        {/* Body */}
        {needsBody && (
          <div>
            <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Request Payload / Body</label>
            <textarea
              value={local.body}
              onChange={(e) => setLocal({ ...local, body: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
              rows="5"
              placeholder={'{\n  "email": "monitor@test.com",\n  "password": "123"\n}'}
            />
          </div>
        )}

        {/* Validation */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-200">
          <p className="text-sm font-mono font-semibold text-gray-700">Validation Rules</p>
          <div>
            <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Expected Status Code *</label>
            <input
              type="number"
              value={local.expectedStatus}
              onChange={(e) => setLocal({ ...local, expectedStatus: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              placeholder="200"
            />
          </div>
          <div>
            <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Expected Response Contains (optional)</label>
            <textarea
              value={local.expectedResponse}
              onChange={(e) => setLocal({ ...local, expectedResponse: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
              rows="3"
              placeholder={'{\n  "success": true\n}'}
            />
          </div>
          <div>
            <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Max Response Time (ms, optional)</label>
            <input
              type="number"
              value={local.maxResponseTime}
              onChange={(e) => setLocal({ ...local, maxResponseTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              placeholder="2000"
            />
          </div>
        </div>
      </div>

      {/* Save Endpoint */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 transition font-medium shadow"
        >
          Save Endpoint
        </button>
      </div>
    </div>
  );
};

// ─── Main AddMonitor Component ────────────────────────────────────────────────
const AddEndpoint= () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'review'

  // 1. Monitor Info
  const [name, setName] = useState('');

  // 2. Authentication
  const [authType, setAuthType] = useState('none');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKeyHeader, setApiKeyHeader] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [loginEndpoint, setLoginEndpoint] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  // 3. Monitoring Settings
  const [checkInterval, setCheckInterval] = useState('30');
  const [timeout, setTimeout] = useState('5');
  const [retryCount, setRetryCount] = useState('2');

  // 4. Endpoints list
  const [endpoints, setEndpoints] = useState([blankEndpoint()]);

  // ── Endpoint management ──
  const saveEndpoint = (updated) => {
    setEndpoints(endpoints.map((ep) => (ep.id === updated.id ? updated : ep)));
  };

  const removeEndpoint = (id) => {
    if (endpoints.length === 1) {
      toast.error('At least one endpoint is required');
      return;
    }
    setEndpoints(endpoints.filter((ep) => ep.id !== id));
  };

  const editEndpoint = (id) => {
    setEndpoints(endpoints.map((ep) => (ep.id === id ? { ...ep, saved: false } : ep)));
  };

  const addEndpoint = () => {
    // Only allow adding if current last endpoint is saved
    const unsaved = endpoints.filter((ep) => !ep.saved);
    if (unsaved.length > 0) {
      toast.error('Please save the current endpoint before adding another');
      return;
    }
    setEndpoints([...endpoints, blankEndpoint()]);
  };

  // ── Review step ──
  const handleReview = () => {
    if (!name) { toast.error('Monitor name is required'); return; }
    const unsaved = endpoints.filter((ep) => !ep.saved);
    if (unsaved.length > 0) { toast.error('Please save all endpoints before reviewing'); return; }
    if (endpoints.length === 0) { toast.error('Add at least one endpoint'); return; }
    setStep('review');
  };

  // ── Final submit ──
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let authConfig = { type: authType };
      if (authType === 'bearer') authConfig.token = bearerToken;
      else if (authType === 'apikey') { authConfig.header = apiKeyHeader; authConfig.value = apiKeyValue; }
      else if (authType === 'cookie') { authConfig.loginEndpoint = loginEndpoint; authConfig.email = testEmail; authConfig.password = testPassword; }

      const monitorData = {
        name,
        auth: authConfig,
        monitoring: { checkInterval: parseInt(checkInterval), timeout: parseInt(timeout), retryCount: parseInt(retryCount) },
        endpoints: endpoints.map((ep) => ({
          name: ep.name,
          url: ep.url,
          method: ep.method,
          headers: ep.headers.filter((h) => h.key && h.value).reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
          body: ep.body || undefined,
          validation: {
            expectedStatus: parseInt(ep.expectedStatus),
            expectedResponse: ep.expectedResponse || undefined,
            maxResponseTime: ep.maxResponseTime ? parseInt(ep.maxResponseTime) : undefined,
          },
        })),
      };
   const response=   await fetch(`${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4003'}/api/add-endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(monitorData),
      });
      const data = await response.json();
       console.log('Response data:', data);
      toast.success('Monitor created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create monitor');
      toast.error('Failed to create monitor');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // REVIEW SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'review') {
    const authLabels = { none: 'None', bearer: 'Bearer Token', apikey: 'API Key', cookie: 'Cookie Login' };
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button onClick={() => setStep('form')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition">
              <ArrowLeft size={20} />
              <span className="font-mono text-sm">Back to Edit</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Review Monitor</h1>
            <p className="text-gray-600 mt-2 font-mono text-sm">Double-check everything before creating</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-3xl mb-6">{error}</div>
          )}

          <div className="space-y-6">
            {/* Monitor Summary */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Monitor</h2>
              <p className="text-lg font-semibold text-gray-800">{name}</p>
              <p className="text-sm font-mono text-gray-500 mt-1">
                Auth: {authLabels[authType]} &nbsp;·&nbsp;
                Interval: {checkInterval}s &nbsp;·&nbsp;
                Timeout: {timeout}s &nbsp;·&nbsp;
                Retries: {retryCount}
              </p>
            </div>

            {/* Endpoints Summary */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{endpoints.length} Endpoint{endpoints.length !== 1 ? 's' : ''}</h2>
              <div className="space-y-3">
                {endpoints.map((ep, i) => (
                  <div key={ep.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{ep.name}</p>
                      <p className="text-xs font-mono text-gray-500">{ep.method} · {ep.url} · expect {ep.expectedStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                {loading ? 'Creating Monitor...' : 'Create Monitor'}
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/endpoints')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition">
            <ArrowLeft size={20} />
            <span className="font-mono text-sm">Back to Endpoints</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Add New Monitor</h1>
          <p className="text-gray-600 mt-2 font-mono text-sm">Configure authentication, settings, then add your endpoints</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-3xl mb-6">{error}</div>
        )}

        <div className="space-y-6">

          {/* 1. Monitor Name */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono">1</span>
              Monitor Information
            </h2>
            <div>
              <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Monitor Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="Production APIs"
              />
            </div>
          </div>

          {/* 2. Authentication */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono">2</span>
              Authentication (Common for this Monitor)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono font-medium text-gray-700 mb-3">Authentication Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'none', label: 'None' },
                    { value: 'bearer', label: 'Bearer Token' },
                    { value: 'cookie', label: 'Cookie Login' },
                    { value: 'apikey', label: 'API Key' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setAuthType(type.value)}
                      className={`px-4 py-3 rounded-2xl font-mono text-sm font-medium transition ${
                        authType === type.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {authType === 'bearer' && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                  <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Bearer Token *</label>
                  <input
                    type="text" value={bearerToken} onChange={(e) => setBearerToken(e.target.value)} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
              )}

              {authType === 'apikey' && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 space-y-4">
                  <div>
                    <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Header Name *</label>
                    <input type="text" value={apiKeyHeader} onChange={(e) => setApiKeyHeader(e.target.value)} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" placeholder="X-API-Key" />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Header Value *</label>
                    <input type="text" value={apiKeyValue} onChange={(e) => setApiKeyValue(e.target.value)} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" placeholder="sk_live_abc123xyz..." />
                  </div>
                </div>
              )}

              {authType === 'cookie' && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 space-y-4">
                  <div>
                    <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Login Endpoint *</label>
                    <input type="url" value={loginEndpoint} onChange={(e) => setLoginEndpoint(e.target.value)} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" placeholder="https://api.example.com/auth/login" />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Test Email *</label>
                    <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" placeholder="test@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Test Password *</label>
                    <input type="password" value={testPassword} onChange={(e) => setTestPassword(e.target.value)} required
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm" placeholder="••••••••" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Monitoring Settings */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono">3</span>
              Monitoring Settings
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Check Interval (seconds) *</label>
                <input type="number" value={checkInterval} onChange={(e) => setCheckInterval(e.target.value)} required min="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="30" />
              </div>
              <div>
                <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Timeout (seconds) *</label>
                <input type="number" value={timeout} onChange={(e) => setTimeout(e.target.value)} required min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="5" />
              </div>
              <div>
                <label className="block text-sm font-mono font-medium text-gray-700 mb-2">Retry Count *</label>
                <input type="number" value={retryCount} onChange={(e) => setRetryCount(e.target.value)} required min="0" max="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono" placeholder="2" />
              </div>
            </div>
          </div>

          {/* 4. Endpoints */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono">4</span>
              Endpoints
              <span className="ml-2 text-sm font-normal font-mono text-gray-500">
                ({endpoints.filter((e) => e.saved).length}/{endpoints.length} saved)
              </span>
            </h2>

            <div className="space-y-4">
              {endpoints.map((ep, i) => (
                <EndpointCard
                  key={ep.id}
                  endpoint={ep}
                  index={i}
                  onSave={saveEndpoint}
                  onRemove={endpoints.length > 1 ? removeEndpoint : null}
                  onEdit={editEndpoint}
                />
              ))}
            </div>

            {/* Add Endpoint Button */}
            <button
              type="button"
              onClick={addEndpoint}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-3xl hover:bg-blue-50 hover:border-blue-400 transition font-mono font-medium"
            >
              <Plus size={20} />
              Add Endpoint
            </button>
          </div>

          {/* Review Button */}
          <div className="flex gap-4 pb-8">
            <button
              type="button"
              onClick={handleReview}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition font-medium text-lg shadow-lg"
            >
              Review & Create →
            </button>
            <button
              type="button"
              onClick={() => navigate('/endpoints')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEndpoint;