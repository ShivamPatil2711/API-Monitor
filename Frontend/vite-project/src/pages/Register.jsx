import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

// ── mirrors backend validation exactly ──────────────────────────────────────
function validateName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (!/^[A-Za-z\s]+$/.test(trimmed)) return "Name must contain letters only";
  return null;
}

function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Please enter a valid email";
  return null;
}

// password requirement checks — same regex as backend
const PWD_RULES = [
  { label: "At least 6 characters",         test: (p) => p.length >= 6 },
  { label: "One uppercase letter (A–Z)",    test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)",    test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)",              test: (p) => /[0-9]/.test(p) },
  { label: "One special char (!@#$%^&*)",   test: (p) => /[!@#$%^&*]/.test(p) },
];

function validatePassword(password) {
  const failed = PWD_RULES.filter((r) => !r.test(password));
  if (failed.length > 0) return failed[0].label + " required";
  return null;
}
// ────────────────────────────────────────────────────────────────────────────

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});   // per-field error strings
  const [serverErrors, setServerErrors] = useState([]); // array from backend
  const [loading, setLoading] = useState(false);
  const [showPwdHint, setShowPwdHint] = useState(false);

  const navigate = useNavigate();
  const backendApiUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4003";

  // live change — clear error for that field as user types
  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [field]: null }));
    setServerErrors([]);
  };

  // validate all fields, return false if any fail
  const runClientValidation = () => {
    const errs = {
      name:     validateName(form.name),
      email:    validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setFieldErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!runClientValidation()) return;

    setLoading(true);
    setServerErrors([]);

    try {
      const res = await fetch(`${backendApiUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else if (res.status === 422 && data.errors?.length) {
        // backend returns errors array — show them all
        setServerErrors(data.errors);
      } else if (res.status === 409) {
        // duplicate email
        setFieldErrors((fe) => ({ ...fe, email: "This email is already registered" }));
      } else {
        setServerErrors([data.message || "Registration failed"]);
      }
    } catch {
      setServerErrors(["Cannot connect to server. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const pwdValue = form.password;

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Back */}
        <Link to="/" style={s.back}>
          <ArrowLeft size={15} /> Back to Home
        </Link>

        {/* Header */}
        <div style={s.header}>
          <Activity size={16} color="#2563eb" />
          <span style={s.headerTag}>auth / register</span>
        </div>
        <h1 style={s.h1}>Create your account</h1>
        <p style={s.sub}>Start watching your endpoints in seconds.</p>

        {/* Server error banner */}
        {serverErrors.length > 0 && (
          <div style={s.errorBanner}>
            {serverErrors.map((err, i) => (
              <div key={i} style={s.errorBannerRow}>
                <XCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                {err}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={s.form}>
          {/* Name */}
          <Field
            label="Full Name"
            error={fieldErrors.name}
            hint="Letters only, min 2 characters"
          >
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange("name")}
              style={{
                ...s.input,
                ...(fieldErrors.name ? s.inputError : {}),
              }}
            />
          </Field>

          {/* Email */}
          <Field
            label="Email Address"
            error={fieldErrors.email}
            hint="e.g. you@company.com"
          >
            <input
              id="reg-email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange("email")}
              style={{
                ...s.input,
                ...(fieldErrors.email ? s.inputError : {}),
              }}
            />
          </Field>

          {/* Password */}
          <Field label="Password" error={fieldErrors.password}>
            <input
              id="reg-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange("password")}
              onFocus={() => setShowPwdHint(true)}
              style={{
                ...s.input,
                ...(fieldErrors.password ? s.inputError : {}),
              }}
            />
          </Field>

          {/* Password rules checklist — shown when focused or non-empty */}
          {(showPwdHint || pwdValue.length > 0) && (
            <div style={s.pwdRules}>
              {PWD_RULES.map((rule) => {
                const ok = rule.test(pwdValue);
                return (
                  <div key={rule.label} style={s.pwdRule}>
                    {ok ? (
                      <CheckCircle size={13} color="#16a34a" />
                    ) : (
                      <XCircle size={13} color="#dc2626" />
                    )}
                    <span style={{ color: ok ? "#16a34a" : "#6b7280" }}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        <p style={s.loginLink}>
          Already have an account?{" "}
          <Link to="/login" style={s.loginLinkA}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

/* ── Field wrapper ─────────────────────────────────────────────────────────── */
function Field({ label, error, hint, children }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {children}
      {error ? (
        <span style={s.fieldError}>
          <XCircle size={12} color="#dc2626" /> {error}
        </span>
      ) : hint ? (
        <span style={s.fieldHint}>{hint}</span>
      ) : null}
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────────── */
const s = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: "36px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#6b7280",
    textDecoration: "none",
    marginBottom: 28,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  headerTag: {
    fontSize: 11,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6b7280",
  },
  h1: {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 6px",
  },
  sub: {
    fontSize: 14,
    color: "#6b7280",
    margin: "0 0 24px",
  },

  /* Error banner */
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  errorBannerRow: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
    color: "#dc2626",
  },

  /* Form */
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "#6b7280",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    border: "1px solid #d1d5db",
    borderRadius: 10,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    background: "#fff",
    color: "#111827",
  },
  inputError: {
    borderColor: "#f87171",
    background: "#fff7f7",
  },
  fieldError: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#dc2626",
  },
  fieldHint: {
    fontSize: 12,
    color: "#9ca3af",
  },

  /* Password checklist */
  pwdRules: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: -8,
  },
  pwdRule: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
  },

  /* Submit */
  btn: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  loginLink: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  loginLinkA: {
    color: "#2563eb",
    fontWeight: 500,
    textDecoration: "none",
  },
};

export default Register;