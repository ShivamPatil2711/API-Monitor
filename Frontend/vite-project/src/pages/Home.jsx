import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Activity,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle,
  Plus,
} from "lucide-react";

export default function Home() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Hero ── */}
      <section style={styles.hero}>
        {/* animated background blobs */}
        <div style={styles.blob1} />
        <div style={styles.blob2} />

        <div style={styles.heroInner}>
          {/* Badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            Go · MongoDB · JWT · 50 goroutines
          </div>

          <h1 style={styles.h1}>
            Monitor your APIs.
            <br />
            <span style={styles.h1Blue}>Know when they break.</span>
          </h1>

          <p style={styles.heroSub}>
            Add your endpoints, set validation rules, and our Go scheduler
            automatically pings them every 30 seconds — tracking status codes
            and response latency in real time.
          </p>

          <div style={styles.heroCTA}>
            {isLoggedIn ? (
              <Link to="/add-endpoints" style={styles.btnPrimary}>
                <Plus size={18} /> Add Endpoint
              </Link>
            ) : (
              <>
                <Link to="/register" style={styles.btnPrimary}>
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/login" style={styles.btnGhost}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={styles.section}>
        <h2 style={styles.h2}>How it works</h2>
        <p style={styles.sectionSub}>Three steps. No fluff.</p>

        <div style={styles.stepsGrid}>
          <Step
            num="1"
            title="Register & Login"
            desc="Create your account. Sessions are secured with JWT stored in HTTP-only cookies."
          />
          <Step
            num="2"
            title="Add a Monitor"
            desc="Give it a name, set auth (none / bearer / auto-login), configure timeout and retry count, then add your endpoints with expected status codes and max response time."
          />
          <Step
            num="3"
            title="Scheduler takes over"
            desc="Every 30 seconds, 50 concurrent Go workers hit all your endpoints and record the status code, latency, and any error — automatically."
          />
        </div>
      </section>

      {/* ── What we track ── */}
      <section style={{ ...styles.section, background: "#f8faff" }}>
        <h2 style={styles.h2}>What gets tracked</h2>
        <p style={styles.sectionSub}>
          Exactly what the backend stores — nothing more, nothing less.
        </p>

        <div style={styles.trackGrid}>
          <TrackCard
            icon={<CheckCircle size={20} color="#2563eb" />}
            label="Current Status"
            desc="UP / DOWN based on your expected status code"
          />
          <TrackCard
            icon={<Zap size={20} color="#2563eb" />}
            label="Latency"
            desc="Last response time in milliseconds"
          />
          <TrackCard
            icon={<Activity size={20} color="#2563eb" />}
            label="Status Code"
            desc="The actual HTTP status code returned"
          />
          <TrackCard
            icon={<Clock size={20} color="#2563eb" />}
            label="Last Checked"
            desc="Timestamp of the most recent check"
          />
        </div>
      </section>

      {/* ── CTA ── */}
      {!isLoggedIn && (
        <section style={styles.ctaSection}>
          <h2 style={{ ...styles.h2, color: "#fff" }}>Ready to start?</h2>
          <p style={{ ...styles.sectionSub, color: "#93c5fd", marginBottom: 32 }}>
            Create a free account and add your first endpoint in under a minute.
          </p>
          <Link to="/register" style={styles.btnWhite}>
            Create account <ArrowRight size={18} />
          </Link>
        </section>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function Step({ num, title, desc }) {
  return (
    <div style={styles.stepCard}>
      <div style={styles.stepNum}>{num}</div>
      <h3 style={styles.stepTitle}>{title}</h3>
      <p style={styles.stepDesc}>{desc}</p>
    </div>
  );
}

function TrackCard({ icon, label, desc }) {
  return (
    <div style={styles.trackCard}>
      <div style={styles.trackIcon}>{icon}</div>
      <div>
        <div style={styles.trackLabel}>{label}</div>
        <div style={styles.trackDesc}>{desc}</div>
      </div>
    </div>
  );
}

/* ── Styles ── */

const styles = {
  /* Hero */
  hero: {
    position: "relative",
    overflow: "hidden",
    background: "#fff",
    padding: "96px 24px 80px",
    textAlign: "center",
  },
  blob1: {
    position: "absolute",
    top: -120,
    left: "50%",
    transform: "translateX(-60%)",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: -80,
    right: "10%",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroInner: {
    position: "relative",
    maxWidth: 640,
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "4px 14px",
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
    marginBottom: 24,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    display: "inline-block",
    animation: "pulse 2s infinite",
  },
  h1: {
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#111827",
    margin: "0 0 20px",
  },
  h1Blue: {
    color: "#2563eb",
  },
  heroSub: {
    fontSize: 17,
    color: "#4b5563",
    lineHeight: 1.7,
    margin: "0 auto 36px",
    maxWidth: 520,
  },
  heroCTA: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  /* Buttons */
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    padding: "12px 26px",
    borderRadius: 12,
    textDecoration: "none",
    transition: "background 0.2s",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #d1d5db",
    color: "#374151",
    fontWeight: 500,
    fontSize: 15,
    padding: "12px 26px",
    borderRadius: 12,
    textDecoration: "none",
  },
  btnWhite: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    color: "#2563eb",
    fontWeight: 600,
    fontSize: 15,
    padding: "12px 26px",
    borderRadius: 12,
    textDecoration: "none",
  },

  /* Sections */
  section: {
    padding: "72px 24px",
    maxWidth: 960,
    margin: "0 auto",
  },
  h2: {
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
    margin: "0 0 8px",
  },
  sectionSub: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 15,
    marginBottom: 48,
  },

  /* Steps */
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },
  stepCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "28px 24px",
    background: "#fff",
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 700,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  stepTitle: {
    fontWeight: 600,
    fontSize: 16,
    color: "#111827",
    margin: "0 0 8px",
  },
  stepDesc: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.6,
    margin: 0,
  },

  /* Track cards */
  trackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },
  trackCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "20px 18px",
  },
  trackIcon: {
    flexShrink: 0,
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trackLabel: {
    fontWeight: 600,
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  trackDesc: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.5,
  },

  /* CTA section */
  ctaSection: {
    background: "#1d4ed8",
    padding: "72px 24px",
    textAlign: "center",
  },
};