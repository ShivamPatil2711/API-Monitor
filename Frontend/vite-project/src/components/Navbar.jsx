import { useState,useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Plus, User, LogOut, Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();


  const isActive = (path) => location.pathname === path;

  const navLinks = [
    ...(isLoggedIn ? [{ name: "Endpoints", path: "/endpoints" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-2xl tracking-tight text-gray-900">
              Watch<span className="text-blue-600">API</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-gray-900 ${
                  isActive(link.path) ? "text-gray-900 font-semibold" : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Login / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* Add Endpoint Button */}
                <button
                  onClick={() => navigate("/add-endpoints")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-2xl transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Endpoint
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500 -mt-0.5">Online</p>
                    </div>
                    <span className="text-gray-400">▼</span>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={async () => {
                          await logout();
                          setShowProfileDropdown(false);
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-2xl text-base font-medium ${
                  isActive(link.path) ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-2xl"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-3 text-center bg-blue-600 text-white rounded-2xl"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/add-endpoint");
                    setIsOpen(false);
                  }}
                  className="mt-2 bg-blue-600 text-white py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add New Endpoint
                </button>

                <button
                  onClick={async () => {
                    await logout();
                    setIsOpen(false);
                    navigate('/login');
                  }}
                  className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;