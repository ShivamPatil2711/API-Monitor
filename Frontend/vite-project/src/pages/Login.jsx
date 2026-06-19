import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { setIsLoggedIn, setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const backendApiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4003";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendApiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Logged in successfully");
        setIsLoggedIn(true);
        setUser(data.user);
        navigate("/");        // or "/" or "/endpoints"
      } else {
        toast.error(data.message || data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="relative">
          {/* Glow Effect */}
          <div
            aria-hidden
            className="absolute -inset-px rounded-3xl opacity-60"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklab, #3b82f6 30%, transparent), transparent 60%)",
            }}
          />

          <div className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gray-500">
              <Activity className="h-4 w-4 text-blue-600" />
              auth / login
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
              Sign in to your console
            </h1>

            <p className="mt-2 text-gray-600">
              Resume monitoring your services.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-wider text-gray-500 block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-wider text-gray-500 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition-all active:scale-[0.985] ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center font-mono text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Register
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[11px] text-gray-500">
            Demo mode — Backend connected
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;