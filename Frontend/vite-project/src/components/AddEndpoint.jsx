import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, CheckCircle, Edit2, XCircle } from 'lucide-react';

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

// ─── Shared label style ───────────────────────────────────────────────────────
const lbl = { display:'block', fontSize:12, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.07em', color:'#6b7280', marginBottom:6 };

// ─── Single Endpoint Card ─────────────────────────────────────────────────────
const EndpointCard = ({ endpoint, index, onSave, onRemove, onEdit }) => {
  const [cardError, setCardError] = useState('');
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
      setCardError('Endpoint name and URL are required');
      return;
    }
    setCardError('');
    onSave({ ...local, saved: true });
  };

  // ── Saved (collapsed) view ──
  if (endpoint.saved) {
    const methodColor = {
      GET: '#16a34a', POST: '#2563eb', PUT: '#d97706',
      PATCH: '#7c3aed', DELETE: '#dc2626'
    }[endpoint.method] || '#6b7280';
    return (
      <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <CheckCircle size={18} color="#16a34a" style={{ flexShrink:0 }} />
          <div>
            <p style={{ fontWeight:600, color:'#111827', fontSize:14, margin:0 }}>{endpoint.name}</p>
            <p style={{ fontSize:12, fontFamily:'monospace', color:'#6b7280', margin:'2px 0 0' }}>
              <span style={{ background: methodColor + '18', color: methodColor, fontWeight:700, padding:'1px 7px', borderRadius:6, marginRight:6, fontSize:11 }}>{endpoint.method}</span>
              {endpoint.url}
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button type="button" onClick={() => onEdit(endpoint.id)}
            style={{ padding:'7px 10px', background:'#eff6ff', border:'none', borderRadius:8, color:'#2563eb', cursor:'pointer' }}>
            <Edit2 size={15} />
          </button>
          {onRemove && (
            <button type="button" onClick={() => onRemove(endpoint.id)}
              style={{ padding:'7px 10px', background:'#fef2f2', border:'none', borderRadius:8, color:'#dc2626', cursor:'pointer' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Expanded (edit) view ──
  return (
    <div style={{ background:'#fff', border:'1px solid #dbeafe', borderRadius:18, padding:'28px', boxShadow:'0 4px 16px rgba(37,99,235,0.08)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:'#111827', display:'flex', alignItems:'center', gap:10, margin:0 }}>
          <span style={{ background:'#2563eb', color:'#fff', width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontFamily:'monospace' }}>
            {index + 1}
          </span>
          Endpoint {index + 1}
        </h3>
        {onRemove && (
          <button type="button" onClick={() => onRemove(endpoint.id)}
            style={{ padding:'6px 10px', background:'#fef2f2', border:'none', borderRadius:8, color:'#dc2626', cursor:'pointer' }}>
            <Trash2 size={16} />
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
          <label style={lbl}>HTTP Method *</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['GET','POST','PUT','PATCH','DELETE'].map((m) => {
              const colors = { GET:'#16a34a', POST:'#2563eb', PUT:'#d97706', PATCH:'#7c3aed', DELETE:'#dc2626' };
              const active = local.method === m;
              return (
                <button key={m} type="button" onClick={() => setLocal({ ...local, method: m })}
                  style={{ padding:'7px 16px', borderRadius:8, fontFamily:'monospace', fontWeight:700, fontSize:13, border: active ? 'none' : '1px solid #e5e7eb', background: active ? colors[m] : '#f9fafb', color: active ? '#fff' : '#6b7280', cursor:'pointer' }}>
                  {m}
                </button>
              );
            })}
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
      {cardError && (
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', marginTop:16, fontSize:13, color:'#dc2626' }}>
          <XCircle size={14} color="#dc2626" style={{ flexShrink:0 }} /> {cardError}
        </div>
      )}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleSave}
          style={{ width:'100%', padding:'12px', background:'#16a34a', color:'#fff', fontWeight:600, fontSize:14, border:'none', borderRadius:12, cursor:'pointer' }}
        >
          Save Endpoint
        </button>
      </div>
    </div>
  );
};

// ─── Main AddEndpoint Component ───────────────────────────────────────────────
const AddEndpoint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'review'

  // 1. Monitor Info
  const [name, setName] = useState('');
  const [alertEmail, setAlertEmail] = useState('');

  // 2. Authentication — simplified to 3 options
  const [authType, setAuthType] = useState('none');
  const [apiKeyHeader, setApiKeyHeader] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [loginEndpoint, setLoginEndpoint] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  // 3. Monitoring Settings
  const [timeout, setTimeout] = useState('5');
  const [retryCount, setRetryCount] = useState('2');

  // 4. Endpoints list
  const [endpoints, setEndpoints] = useState([blankEndpoint()]);

  // ── Endpoint management ──
  const [formError, setFormError] = useState('');

  const saveEndpoint = (updated) => {
    setEndpoints(endpoints.map((ep) => (ep.id === updated.id ? updated : ep)));
  };

  const removeEndpoint = (id) => {
    if (endpoints.length === 1) {
      setFormError('At least one endpoint is required');
      return;
    }
    setFormError('');
    setEndpoints(endpoints.filter((ep) => ep.id !== id));
  };

  const editEndpoint = (id) => {
    setEndpoints(endpoints.map((ep) => (ep.id === id ? { ...ep, saved: false } : ep)));
  };

  const addEndpoint = () => {
    const unsaved = endpoints.filter((ep) => !ep.saved);
    if (unsaved.length > 0) {
      setFormError('Please save the current endpoint before adding another');
      return;
    }
    setFormError('');
    setEndpoints([...endpoints, blankEndpoint()]);
  };

  // ── Review step ──
  const handleReview = () => {
    if (!name) { setFormError('Monitor name is required'); return; }
    const unsaved = endpoints.filter((ep) => !ep.saved);
    if (unsaved.length > 0) { setFormError('Please save all endpoints before reviewing'); return; }
    if (endpoints.length === 0) { setFormError('Add at least one endpoint'); return; }
    setFormError('');
    setStep('review');
  };

  // ── Final submit ──
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let authConfig = { type: authType };
      if (authType === 'apikey') {
        authConfig.header = apiKeyHeader;
        authConfig.value = apiKeyValue;
      } else if (authType === 'login') {
        authConfig.loginEndpoint = loginEndpoint;
        authConfig.email = testEmail;
        authConfig.password = testPassword;
      }

      const monitorData = {
        name,
        alertEmail: alertEmail.trim() || undefined,
        auth: authConfig,
        monitoring: { timeout: parseInt(timeout), retryCount: parseInt(retryCount) },
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

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4003'}/api/add-endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(monitorData),
      });

      if (res.ok) {
        navigate('/endpoints');
      } else {
        // backend uses http.Error (plain text) on failure
        const text = await res.text();
        setError(text.trim() || 'Failed to create monitor');
      }
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // REVIEW SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'review') {
    const authLabels = { none: 'None', apikey: 'API Key', login: 'Login Required' };
    return (
      <div style={{ minHeight:'100vh', background:'#f9fafb', padding:'32px 16px', fontFamily:"'Inter',sans-serif" }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ marginBottom:28 }}>
            <button onClick={() => setStep('form')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#6b7280', fontSize:13, cursor:'pointer', marginBottom:16, padding:0 }}>
              <ArrowLeft size={16} /> Back to Edit
            </button>
            <h1 style={{ fontSize:26, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>Review Monitor</h1>
            <p style={{ fontSize:13, color:'#6b7280', fontFamily:'monospace', margin:0 }}>Double-check everything before creating</p>
          </div>

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#dc2626' }}>
              <XCircle size={14} color="#dc2626" style={{ flexShrink:0 }} /> {error}
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Monitor Summary */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.07em', color:'#6b7280', margin:'0 0 8px' }}>Monitor</p>
              <p style={{ fontSize:18, fontWeight:700, color:'#111827', margin:'0 0 6px' }}>{name}</p>
              <p style={{ fontSize:12, fontFamily:'monospace', color:'#9ca3af', margin:0 }}>
                Auth: {authLabels[authType]} &nbsp;·&nbsp; Timeout: {timeout}s &nbsp;·&nbsp; Retries: {retryCount}
              </p>
            </div>

            {/* Endpoints Summary */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.07em', color:'#6b7280', margin:'0 0 14px' }}>{endpoints.length} Endpoint{endpoints.length !== 1 ? 's' : ''}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {endpoints.map((ep) => {
                  const mc = { GET:'#16a34a', POST:'#2563eb', PUT:'#d97706', PATCH:'#7c3aed', DELETE:'#dc2626' }[ep.method] || '#6b7280';
                  return (
                    <div key={ep.id} style={{ display:'flex', alignItems:'center', gap:12, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, padding:'12px 16px' }}>
                      <CheckCircle size={16} color="#16a34a" style={{ flexShrink:0 }} />
                      <div>
                        <p style={{ fontWeight:600, color:'#111827', fontSize:14, margin:0 }}>{ep.name}</p>
                        <p style={{ fontSize:12, fontFamily:'monospace', color:'#6b7280', margin:'2px 0 0' }}>
                          <span style={{ background: mc+'18', color:mc, fontWeight:700, padding:'1px 7px', borderRadius:6, marginRight:6, fontSize:11 }}>{ep.method}</span>
                          {ep.url} · expect {ep.expectedStatus}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:12 }}>
              <button type="button" onClick={handleSubmit} disabled={loading}
                style={{ flex:1, padding:'13px', background: loading ? '#93c5fd' : '#2563eb', color:'#fff', fontWeight:600, fontSize:15, border:'none', borderRadius:12, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Creating…' : 'Create Monitor'}
              </button>
              <button type="button" onClick={() => setStep('form')}
                style={{ padding:'13px 24px', border:'1px solid #d1d5db', background:'#fff', color:'#374151', fontWeight:500, fontSize:15, borderRadius:12, cursor:'pointer' }}>
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
  // shared label style used in EndpointCard too
  const lbl = { display:'block', fontSize:12, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.07em', color:'#6b7280', marginBottom:6 };
  return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', padding:'32px 16px', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <button onClick={() => navigate('/endpoints')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#6b7280', fontSize:13, cursor:'pointer', marginBottom:16, padding:0 }}>
            <ArrowLeft size={16} /> Back to Endpoints
          </button>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#111827', margin:'0 0 4px' }}>Add New Monitor</h1>
          <p style={{ fontSize:13, color:'#6b7280', fontFamily:'monospace', margin:0 }}>Configure auth, settings, then add endpoints</p>
        </div>

        {(error || formError) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#dc2626' }}>
            <XCircle size={14} color="#dc2626" style={{ flexShrink:0 }} /> {error || formError}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* 1. Monitor Name */}
          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'24px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#111827', display:'flex', alignItems:'center', gap:10, margin:'0 0 18px' }}>
              <span style={{ background:'#2563eb', color:'#fff', width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontFamily:'monospace' }}>1</span>
              Monitor Information
            </h2>
            <div>
              <label style={lbl}>Monitor Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="Production APIs"
              />
            </div>
            <div style={{ marginTop:16 }}>
              <label style={lbl}>Alert Email <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span></label>
              <input
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                style={{ width:'100%', padding:'11px 14px', fontSize:14, border:'1px solid #d1d5db', borderRadius:10, outline:'none', boxSizing:'border-box', color:'#111827', background:'#fff' }}
                placeholder="you@example.com — notified when endpoint goes DOWN"
              />
            </div>
          </div>

          {/* 2. Authentication — simplified 3-option radio UI */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono">2</span>
              Authentication
            </h2>

            <div className="space-y-3">

              {/* None */}
              <label className="flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition
                hover:bg-gray-50
                has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="authType"
                  value="none"
                  checked={authType === 'none'}
                  onChange={() => setAuthType('none')}
                  className="w-4 h-4 accent-blue-600"
                />
                <div>
                  <p className="font-mono font-semibold text-gray-800 text-sm">None</p>
                  <p className="text-xs text-gray-400 font-mono">No authentication required</p>
                </div>
              </label>

              {/* API Key */}
              <label className="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition
                hover:bg-gray-50
                has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="authType"
                  value="apikey"
                  checked={authType === 'apikey'}
                  onChange={() => setAuthType('apikey')}
                  className="w-4 h-4 accent-blue-600 mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-mono font-semibold text-gray-800 text-sm">API Key</p>
                  <p className="text-xs text-gray-400 font-mono mb-3">Sent as a request header</p>

                  {authType === 'apikey' && (
                    <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <label className="block text-xs font-mono font-medium text-gray-600 mb-1">Header Name</label>
                        <input
                          type="text"
                          value={apiKeyHeader}
                          onChange={(e) => setApiKeyHeader(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                          placeholder="X-API-Key"
                        />
                        <p className="text-xs text-gray-400 font-mono mt-1">e.g. X-API-Key · Authorization · x-access-token</p>
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-medium text-gray-600 mb-1">Value</label>
                        <input
                          type="password"
                          value={apiKeyValue}
                          onChange={(e) => setApiKeyValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Login Required */}
              <label className="flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition
                hover:bg-gray-50
                has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="authType"
                  value="login"
                  checked={authType === 'login'}
                  onChange={() => setAuthType('login')}
                  className="w-4 h-4 accent-blue-600 mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-mono font-semibold text-gray-800 text-sm">Login Required</p>
                  <p className="text-xs text-gray-400 font-mono mb-3">Monitor logs in automatically before each check</p>

                  {authType === 'login' && (
                    <div className="space-y-3 mt-3" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <label className="block text-xs font-mono font-medium text-gray-600 mb-1">Login URL</label>
                        <input
                          type="url"
                          value={loginEndpoint}
                          onChange={(e) => setLoginEndpoint(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                          placeholder="https://api.example.com/auth/login"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-medium text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                          placeholder="monitor@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono font-medium text-gray-600 mb-1">Password</label>
                        <input
                          type="password"
                          value={testPassword}
                          onChange={(e) => setTestPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>

            </div>
          </div>

          {/* 3. Monitoring Settings */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono">3</span>
              Monitoring Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
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
          <div style={{ display:'flex', gap:12, paddingBottom:32 }}>
            <button
              type="button"
              onClick={handleReview}
              style={{ flex:1, padding:'13px', background:'#2563eb', color:'#fff', fontWeight:600, fontSize:15, border:'none', borderRadius:12, cursor:'pointer' }}
            >
              Review & Create →
            </button>
            <button
              type="button"
              onClick={() => navigate('/endpoints')}
              style={{ padding:'13px 24px', border:'1px solid #d1d5db', background:'#fff', color:'#374151', fontWeight:500, fontSize:15, borderRadius:12, cursor:'pointer' }}
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