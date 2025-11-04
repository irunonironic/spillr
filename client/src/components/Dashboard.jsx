import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Feedback from "./Feedback";
import Footer from "./Footer";

export default function Navbar() {
  const { user, logout, setAuthMode } = useAuth();
  const [activeItem, setActiveItem] = useState(user ? "Messages" : "Register");
  const [isVisible, setIsVisible] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const [isReady, setIsReady] = useState(false);

  const navRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setIsReady(true);
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [user]);


  const updateIndicator = (label) => {
    const el = navRefs.current[label];
    if (el) {
      setIndicatorStyle({
        width: el.offsetWidth,
        left: el.offsetLeft,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeItem);
  }, [activeItem, user]);

  const getNavItems = (isLoggedIn) => {
    if (isLoggedIn) {
      return [
        {
          label: "Messages",
          onClick: () => setActiveItem("Messages"),
          href: "#messages",
        },
        {
          label: "Settings",
          onClick: () => navigate("/settings"),
          href: "#settings",
        },
        { label: "Logout", onClick: logout, href: "#logout" },
      ];
    } else {
      return [
        {
          label: "Register",
          onClick: () => setAuthMode("register"),
          href: "#register",
        },
        { label: "Login", onClick: () => setAuthMode("login"), href: "#login" },
      ];
    }
  };

  const items = getNavItems(!!user);

  const handleItemClick = (item) => {
    item.onClick();
    setActiveItem(item.label);
  };

  return (
    <div style={{ fontFamily: "Space Grotesk" }}>
      <header className="fixed top-0 left-0 right-0 flex items-center bg-yellow-200 border-b border-black h-16 z-50 max-w-full overflow-hidden">
        <div className="w-full flex justify-between items-center px-4">
          <div className="font-['Fasthin',cursive] text-2xl sm:text-3xl md:text-4xl text-black tracking-wide shrink-0">
            Spillr
          </div>

          {/* Navigation */}
          <nav className="relative flex items-center gap-2 sm:gap-3 md:gap-4 shrink min-w-0">
            <div
              className="absolute bottom-0 h-[4px] bg-black transition-all duration-700 ease-out"
              style={{
                width: indicatorStyle.width,
                left: indicatorStyle.left,
              }}
            />

            {items.map((item) => (
              <a
                key={item.label}
                ref={(el) => (navRefs.current[item.label] = el)}
                href={item.href}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => updateIndicator(item.label)}
                onMouseLeave={() => updateIndicator(activeItem)}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${activeItem === item.label
                  ? "text-gray-700"
                  : "text-black hover:text-gray-800"
                  }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="pt-20">
        <Feedback />
      </div>

      <Footer />
    </div>
  );
}
