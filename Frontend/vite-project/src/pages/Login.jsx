import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArrowLeft, XCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

// ── frontend validation (login only needs basic checks) ─────────────────────
function validateEmail(email) {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Please enter a valid email";
  return null;
}

function validatePassword(password) {
  if (!password) return "Password is required";
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

const Login = () => {
  const { setIsLoggedIn, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");   // single string from backend
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const backendApiUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:4003";

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [field]: null }));
    setServerError("");
  };

  const runClientValidation = () => {
    const errs = {
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
    setServerError("");

    try {
      const res = await fetch(`${backendApiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email:    form.email.trim(),
          password: form.password,
        }),
      });

      if (res.ok) {
        // success — backend sends JSON on 200
        const data = await res.json();
        setIsLoggedIn(true);
        setUser(data.user);
        navigate("/endpoints");
      } else {
        // backend uses http.Error → plain text, not JSON
        const text = await res.text();
        const msg = text.trim() || "Login failed";

        if (res.status === 401) {
          // show on both fields to match "Invalid Credentials"
          setFieldErrors({
            email:    "Invalid email or password",
            password: "Invalid email or password",
          });
        } else {
          setServerError(msg);
        }
      }
    } catch {
      setServerError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <span style={s.headerTag}>auth / login</span>
        </div>
        <h1 style={s.h1}>Sign in to your console</h1>
        <p style={s.sub}>Resume monitoring your endpoints.</p>

        {/* Server error banner (non-401 errors) */}
        {serverError && (
          <div style={s.errorBanner}>
            <XCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={s.form}>
          {/* Email */}
          <Field label="Email Address" error={fieldErrors.email}>
            <input
              id="login-email"
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
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange("password")}
              style={{
                ...s.input,
                ...(fieldErrors.password ? s.inputError : {}),
              }}
            />
          </Field>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={s.registerLink}>
          Don't have an account?{" "}
          <Link to="/register" style={s.registerLinkA}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

/* ── Field wrapper ─────────────────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {children}
      {error && (
        <span style={s.fieldError}>
          <XCircle size={12} color="#dc2626" /> {error}
        </span>
      )}
    </div>
  );
}

/* ── Styles — identical design tokens as Register ──────────────────────────── */
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
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "11px 14px",
    marginBottom: 20,
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

  registerLink: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  registerLinkA: {
    color: "#2563eb",
    fontWeight: 500,
    textDecoration: "none",
  },
};

export default Login;