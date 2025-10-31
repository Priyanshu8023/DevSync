import React, { useEffect, useState } from "react";
import {
  UserCircle,
  Clock,
  Home,
  Sparkle,
  Info,
  Github,
  Phone,
  HelpCircle,
  X,
  LayoutDashboard, // Make sure this is imported
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FloatingNav } from "../ui/floating-navbar";
import DarkModeToggle from "../ui/DarkModeToggle";
import { useTimer } from "../../context/TimerContext";

const publicNavItems = [
  { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Features", link: "#features", icon: <Sparkle className="h-4 w-4" /> },
  { name: "About us", link: "#about", icon: <Info className="h-4 w-4" /> },
  {
    name: "Github",
    link: "https://github.com/DevSyncx/DevSync.git",
    icon: <Github className="h-4 w-4" />,
  },
  { name: "Contact Us", link: "#contact", icon: <Phone className="h-4 w-4" /> },
  { name: "FAQ", link: "#faq", icon: <HelpCircle className="h-4 w-4" /> },
];

const authenticatedNavItems = [
  { name: "Dashboard", link: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { name: "Profile", link: "/profile", icon: <UserCircle className="h-4 w-4" /> },
  { name: "Timer", link: "/pomodoro", icon: <Clock className="h-4 w-4" /> },
];


// --- Mobile Navigation Overlay Component (defined in the same file) ---
const MobileNavOverlay = ({ isOpen, onClose, navItems, isAuthenticated, handleLogout }) => {
  const overlayClasses = `mobile-nav-overlay ${isOpen ? "open" : ""}`;

  const handleLinkClick = () => {
    onClose();
  };
  
  const handleLogoutClick = () => {
    handleLogout();
    onClose();
  }

  return (
    <div className={overlayClasses}>
      <button onClick={onClose} className="absolute top-8 right-8 text-foreground">
        <X size={32} />
      </button>
      <nav className="flex flex-col items-center justify-center h-full">
        <ul>
          {!isAuthenticated ? (
            navItems.map((item) => (
              <li key={item.name}>
                <a href={item.link} onClick={handleLinkClick}>
                  {item.name}
                </a>
              </li>
            ))
          ) : (
            // --- MODIFIED SECTION: Use authenticatedNavItems for mobile menu ---
            authenticatedNavItems.map((item) => (
              <li key={item.name}>
                <Link to={item.link} onClick={handleLinkClick}>
                  {item.name}
                </Link>
              </li>
            ))
            // --- END OF MODIFIED SECTION ---
          )}
        </ul>
      </nav>

      <div className="mobile-nav-footer">
        {!isAuthenticated ? (
          <>
            <Link to="/register" className="w-full">
              <button onClick={handleLinkClick} className="signup-btn-mobile">
                Sign Up
              </button>
            </Link>
            <DarkModeToggle />
          </>
        ) : (
          <>
            <button onClick={handleLogoutClick} className="logout-btn-mobile">
              Logout
            </button>
            <DarkModeToggle />
          </>
        )}
      </div>
    </div>
  );
}; 


// --- Main Navbar Component ---
const Navbar = () => {
  const [showFloating, setShowFloating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [displayTime, setDisplayTime] = useState("25:00");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const { timeLeft, isRunning } = useTimer();
  
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowFloating(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      const seconds = String(timeLeft % 60).padStart(2, "0");
      setDisplayTime(`${minutes}:${seconds}`);
    }, 500);
    return () => clearInterval(interval);
  }, [timeLeft, isRunning]);

  useEffect(() => {
    const handleStorageChange = () =>
      setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div className="w-full font-sans">
      {!showFloating && (
        <header
          className="fixed top-0 inset-x-0 z-50 w-full backdrop-blur-xl border-b px-4 md:px-6 py-3 md:py-4 shadow-md"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link to="/">
              <h1
                className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight hover:scale-105 transition-transform duration-300"
                style={{ color: "var(--primary)" }}
              >
                DevSync
              </h1>
            </Link>

            <nav className="hidden lg:flex space-x-6 lg:space-x-8 items-center">
                {/* --- Public Nav Items --- */}
                {!isAuthenticated &&
                  publicNavItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.link}
                      className="relative text-[15px] md:text-[16px] lg:text-[17px] font-medium transition-all duration-300 group flex items-center gap-2 hover:pb-1"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {item.icon} <span>{item.name}</span>
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[var(--primary)] to-purple-500 transition-all duration-500 group-hover:w-full"></span>
                    </a>
                  ))}

                {/* --- MODIFIED SECTION: Authenticated Nav Items --- */}
                {/* We now map over authenticatedNavItems instead of hardcoding 'Profile' */}
                {isAuthenticated &&
                  authenticatedNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.link}
                      className="relative text-[15px] md:text-[16px] lg:text-[17px] font-medium transition-all duration-300 group flex items-center gap-2 hover:pb-1"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {item.icon} <span>{item.name}</span>
                      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-[var(--primary)] to-purple-500 transition-all duration-500 group-hover:w-full"></span>
                    </Link>
                  ))}
                {/* --- END OF MODIFIED SECTION --- */}


                {/* --- Timer Display --- */}
                {isAuthenticated && isRunning && (
                  <div
                    onClick={() => navigate("/pomodoro")}
                    className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:shadow-[var(--primary)]/30"
                  >
                    <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                    <span className="text-sm font-mono">{displayTime}</span>
                  </div>
                )}

                {/* --- Auth/Public Buttons --- */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-3 ml-4">
                    {/* The Profile link is now part of the map above */}
                    <button
                      onClick={handleLogout}
                      className="text-[16px] lg:text-[17px] font-medium text-red-500 transition-colors duration-300 hover:text-red-600"
                    >
                      Logout
                    </button>
                    <DarkModeToggle />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 ml-4">
                    <Link to="/register">
                      <button className="px-4 md:px-5 lg:px-6 py-2 rounded-md font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer text-sm md:text-base">
                        Sign Up
                      </button>
                    </Link>
                    <DarkModeToggle />
                  </div>
                )}
            </nav>

            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative w-8 h-6 flex flex-col justify-between items-center z-[110]"
              >
                <span
                  className={`block h-1 w-full rounded transform transition duration-300 ease-in-out ${
                    menuOpen ? "rotate-45 translate-y-[9px] bg-white" : "bg-current"
                  }`}
                />
                <span
                  className={`block h-1 w-full rounded transition duration-300 ease-in-out ${
                    menuOpen ? "opacity-0" : "bg-current"
                  }`}
                />
                <span
                  className={`block h-1 w-full rounded transform transition duration-300 ease-in-out ${
                    menuOpen ? "-rotate-45 -translate-y-[9px] bg-white" : "bg-current"
                  }`}
                />
              </button>
            </div>
          </div>
        </header>
      )}

      <MobileNavOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={publicNavItems} // This is correct, MobileNavOverlay handles auth logic internally
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
      />

      {/* This part was already correct from our last change */}
      {showFloating && (
        <FloatingNav
          navItems={isAuthenticated ? authenticatedNavItems : publicNavItems}
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Navbar;