import { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Plus, User, LogOut, Menu, X, BarChart2, ChevronDown } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const useIsMobile = () => {
  const [mob, setMob] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const h = () => setMob(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mob;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowProfileDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  // ─── Styles ────────────────────────────────────────────────────────────────
  const S = {
    nav: {
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(229,231,235,0.9)",
      boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.09)" : "none",
      transition: "box-shadow 0.3s",
      fontFamily: "'Inter', system-ui, sans-serif",
    },
    inner: {
      maxWidth: 1200, margin: "0 auto", padding: "0 20px",
      height: 64, display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 12,
    },
    logo: {
      display: "flex", alignItems: "center", gap: 10,
      textDecoration: "none", flexShrink: 0,
    },
    logoIcon: {
      width: 36, height: 36,
      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      borderRadius: 10, display: "flex", alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
    },
    logoText: { fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: -0.5 },
    logoBlue: { color: "#2563eb" },

    // Desktop nav links
    desktopLinks: { display: "flex", alignItems: "center", gap: 4, flex: 1, padding: "0 20px" },
    desktopLink: (active) => ({
      display: "flex", alignItems: "center", gap: 6,
      padding: "7px 14px", borderRadius: 9,
      fontSize: 14, fontWeight: active ? 600 : 500,
      textDecoration: "none",
      color: active ? "#fff" : "#6b7280",
      background: active ? "#2563eb" : "transparent",
      transition: "all 0.15s",
    }),

    // Desktop right
    desktopRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
    authPill: {
      display: "flex", alignItems: "center",
      background: "#f9fafb", border: "1px solid #e5e7eb",
      borderRadius: 12, padding: 4, gap: 3,
    },
    // Only the active route gets a solid blue background. Inactive = plain text.
    loginBtn: (active) => ({
      padding: "7px 18px", borderRadius: 9,
      fontSize: 14, fontWeight: active ? 700 : 500,
      textDecoration: "none",
      color: active ? "#fff" : "#6b7280",
      background: active ? "#2563eb" : "transparent",
      transition: "all 0.15s",
      display: "inline-block",
    }),
    registerBtn: (active) => ({
      padding: "7px 18px", borderRadius: 9,
      fontSize: 14, fontWeight: active ? 700 : 500,
      textDecoration: "none",
      color: active ? "#fff" : "#6b7280",
      background: active ? "#2563eb" : "transparent",
      transition: "all 0.15s",
      display: "inline-block",
    }),
    addBtn: (active) => ({
      display: "inline-flex", alignItems: "center", gap: 6,
      background: active ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#fff",
      color: active ? "#fff" : "#374151",
      fontSize: 14, fontWeight: 600,
      padding: "8px 16px", borderRadius: 10,
      border: active ? "none" : "1.5px solid #d1d5db",
      cursor: "pointer",
      boxShadow: active ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
      transition: "all 0.15s",
    }),

    // Profile
    profileBtn: {
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 10px 6px 8px", borderRadius: 12,
      border: "1px solid #e5e7eb", background: "#fff",
      cursor: "pointer", transition: "all 0.15s",
    },
    profileAvatar: {
      width: 32, height: 32,
      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
      borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center",
      border: "1.5px solid #bfdbfe",
    },
    dropdown: {
      position: "absolute", right: 0, top: "calc(100% + 8px)",
      width: 220, background: "#fff",
      border: "1px solid #e5e7eb", borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      overflow: "hidden", zIndex: 100,
    },

    // Hamburger
    hamburger: {
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 40, height: 40, borderRadius: 10,
      border: "1.5px solid #e5e7eb", background: "#fff",
      cursor: "pointer", color: "#374151", flexShrink: 0,
    },

    // Mobile panel
    mobilePanel: {
      position: "fixed", top: 64, left: 0, right: 0, zIndex: 999,
      background: "rgba(255,255,255,0.98)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
    },
    // All mobile items (Endpoints, Login, Register, user card, actions) stack vertically.
    mobileBody: {
      padding: 16, display: "flex", flexDirection: "column", gap: 8,
    },

    // Mobile nav link (Endpoints)
    mobileNavLink: (active) => ({
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 16px", borderRadius: 12,
      fontSize: 15, fontWeight: active ? 600 : 500,
      textDecoration: "none",
      color: active ? "#fff" : "#374151",
      background: active ? "#2563eb" : "transparent",
      transition: "all 0.15s",
      width: "100%",
      boxSizing: "border-box",
    }),
    mobileNavIcon: (active) => ({
      width: 34, height: 34, borderRadius: 9,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: active ? "rgba(255,255,255,0.2)" : "#f3f4f6",
      color: active ? "#fff" : "#6b7280",
      flexShrink: 0,
    }),

    // Mobile auth divider — stacks Login then Register vertically, full width
    authDivider: {
      borderTop: "1px solid #f3f4f6",
      paddingTop: 12, marginTop: 4,
      display: "flex", flexDirection: "column", gap: 10,
    },

    // Mobile Login button — full width, only blue bg when active
    mobileLogin: (active) => ({
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "100%", padding: "14px 16px",
      borderRadius: 12, fontSize: 15, fontWeight: active ? 700 : 600,
      textDecoration: "none",
      color: active ? "#fff" : "#2563eb",
      background: active ? "#2563eb" : "#fff",
      border: active ? "2px solid #2563eb" : "2px solid #e5e7eb",
      transition: "all 0.15s",
      boxSizing: "border-box",
    }),

    // Mobile Register button — full width, only blue bg when active
    mobileRegister: (active) => ({
      display: "flex", alignItems: "center", justifyContent: "center",
      width: "100%", padding: "14px 16px",
      borderRadius: 12, fontSize: 15, fontWeight: active ? 700 : 600,
      textDecoration: "none",
      color: active ? "#fff" : "#2563eb",
      background: active ? "#2563eb" : "#fff",
      border: active ? "2px solid #2563eb" : "2px solid #e5e7eb",
      transition: "all 0.15s",
      boxSizing: "border-box",
    }),

    // Mobile user card
    mobileUserCard: {
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 16px", borderRadius: 12,
      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
      border: "1px solid #bfdbfe",
    },
    mobileUserAvatar: {
      width: 40, height: 40,
      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      borderRadius: "50%", display: "flex",
      alignItems: "center", justifyContent: "center", flexShrink: 0,
    },

    // Mobile action buttons row — stacked vertically too, not side-by-side
    mobileActionRow: { display: "flex", flexDirection: "column", gap: 8 },
    mobileAddBtn: (active) => ({
      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 600,
      color: active ? "#fff" : "#374151",
      background: active ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#fff",
      border: active ? "none" : "1.5px solid #d1d5db",
      cursor: "pointer",
      boxShadow: active ? "0 2px 8px rgba(37,99,235,0.25)" : "none",
      boxSizing: "border-box",
    }),
    mobileLogoutBtn: {
      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "13px", borderRadius: 12, fontSize: 14, fontWeight: 600,
      color: "#ef4444", background: "#fff",
      border: "2px solid #fecaca", cursor: "pointer",
      boxSizing: "border-box",
    },
  };

  return (
    <>


      <nav style={S.nav}>
        <div style={S.inner}>
          {/* Logo */}
          <Link to="/" style={S.logo}>
            <div style={S.logoIcon}><Activity size={18} color="#fff" /></div>
            <span style={S.logoText}>Watch<span style={S.logoBlue}>API</span></span>
          </Link>

          {/* Desktop Links — hidden on mobile via JS */}
          {!isMobile && (
            <div style={S.desktopLinks}>
              {isLoggedIn && (
                <Link to="/endpoints" style={S.desktopLink(isActive("/endpoints"))}>
                  <BarChart2 size={15} /> Endpoints
                </Link>
              )}
            </div>
          )}

          {/* Desktop Right — hidden on mobile via JS */}
          {!isMobile && (
            <div style={S.desktopRight}>
              {!isLoggedIn ? (
                <div style={S.authPill}>
                  <Link to="/login" style={S.loginBtn(isActive("/login"))}>Login</Link>
                  <Link to="/register" style={S.registerBtn(isActive("/register"))}>Register</Link>
                </div>
              ) : (
                <>
                  <button style={S.addBtn(isActive("/add-endpoints"))} onClick={() => navigate("/add-endpoints")}>
                    <Plus size={15} /> Add Endpoint
                  </button>
                  <div style={{ position: "relative" }} ref={dropdownRef}>
                    <button style={S.profileBtn} onClick={() => setShowProfileDropdown(v => !v)}>
                      <div style={S.profileAvatar}><User size={15} color="#2563eb" /></div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{user?.name}</div>
                        <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 500 }}>● Online</div>
                      </div>
                      <ChevronDown size={14} color="#9ca3af"
                        style={{ transform: showProfileDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                    {showProfileDropdown && (
                      <div style={S.dropdown}>
                        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f3f4f6" }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{user?.name}</div>
                          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                        </div>
                        <button
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#ef4444", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                          onClick={async () => { await logout(); setShowProfileDropdown(false); navigate("/login"); }}
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Hamburger — only on mobile via JS */}
          {isMobile && (
            <button style={S.hamburger} onClick={() => setIsOpen(v => !v)}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 998 }}
          />
          <div className="nav-mobile-panel" style={S.mobilePanel}>
            <div style={S.mobileBody}>

              {/* Endpoints link (logged in only) */}
              {isLoggedIn && (
                <Link
                  to="/endpoints"
                  style={S.mobileNavLink(isActive("/endpoints"))}
                  onClick={() => setIsOpen(false)}
                >
                  <div style={S.mobileNavIcon(isActive("/endpoints"))}><BarChart2 size={17} /></div>
                  Endpoints
                </Link>
              )}

              {/* ── Not logged in: Login + Register stacked vertically ── */}
              {!isLoggedIn ? (
                <div style={S.authDivider}>
                  {/* LOGIN — full width, blue fill only when active */}
                  <Link
                    to="/login"
                    style={S.mobileLogin(isActive("/login"))}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>

                  {/* REGISTER — full width, blue fill only when active */}
                  <Link
                    to="/register"
                    style={S.mobileRegister(isActive("/register"))}
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              ) : (
                /* ── Logged in: user card + actions, all stacked vertically ── */
                <>
                  <div style={S.mobileUserCard}>
                    <div style={S.mobileUserAvatar}><User size={18} color="#fff" /></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{user?.name}</div>
                      <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>● Online</div>
                    </div>
                  </div>
                  <div style={S.mobileActionRow}>
                  <button style={S.mobileAddBtn(isActive("/add-endpoints"))} onClick={() => { navigate("/add-endpoints"); setIsOpen(false); }}>
                    <Plus size={16} /> Add Endpoint
                  </button>
                    <button style={S.mobileLogoutBtn} onClick={async () => { await logout(); setIsOpen(false); navigate("/login"); }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;