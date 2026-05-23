import { useNavigate ,Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, Zap, ShieldCheck, Bell } from "lucide-react";
//import { authStore, useAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
function Home() {
  // const user = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 /* useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);*/

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    // authStore.login(email);
    toast.success(mode === "login" ? "Welcome back" : "Account created");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
     
      <main className="relative flex-1">
        {/* Glow - Light version */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
          style={{ background: "var(--gradient-glow-light)" }}
        />

        {/* Grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          {/* Hero */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 font-mono text-[11px] text-gray-500">
              <span className="status-dot bg-blue-600 pulse-dot" />
              <span>Go · MongoDB · JWT · zero-bloat</span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Monitor every endpoint.
              <br />
              <span className="text-blue-600">Catch every outage.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base text-gray-600">
              A blazing-fast API monitor written in pure Go. Schedules checks,
              measures latency, watches SSL, and pings you the moment something breaks.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => document.getElementById("auth")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-xl text-lg transition-all active:scale-[0.985]"
              >
                Get started <ArrowRight className="h-5 w-5" />
              </button>

              <button className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 font-medium px-6 py-3.5 rounded-xl text-lg transition-all">
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
              <Feature icon={Zap} label="10s scheduler" />
              <Feature icon={ShieldCheck} label="SSL expiry" />
              <Feature icon={Bell} label="Smart alerts" />
            </div>
          </div>

        
        </div>
      </main>
     
    </div>
  );
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl border border-gray-200 bg-white p-4">
      <Icon className="h-5 w-5 text-blue-600" />
      <span className="font-mono text-[11px] text-gray-500 mt-1">{label}</span>
    </div>
  );
}
export default Home;