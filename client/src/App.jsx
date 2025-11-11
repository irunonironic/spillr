// App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import AuthRoute from "./components/AuthRoute";
import "./App.css";
import LoadingSpinner from "./components/Loading";
import Settings from "./components/UserSettings";
import PublicWallView from "./components/PublicWallView";
import ResetPasswordForm from './components/auth/ResetPasswordForm'
import VerifyMagicLink from "./components/auth/VerifyMagicLink";

import "@fontsource/space-grotesk/400.css"
import "@fontsource/space-grotesk/700.css"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/700.css"

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./components/Dashboard"));

function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransitionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
      style={{
        animation: transitionStage === "fadeOut" 
          ? "fadeOut 0.15s ease-out forwards" 
          : "fadeIn 0.3s ease-out forwards"
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .page-transition {
          width: 100%;
          min-height: 100vh;
        }
      `}</style>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/wall/:slug" element={<PublicWallView />} />
          <Route path="/verify-magic" element={<VerifyMagicLink />} />
          
          <Route element={<AuthRoute />}>
            <Route 
              path="/dashboard" 
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PageTransition>
                  <Settings />
                </PageTransition>
              } 
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}