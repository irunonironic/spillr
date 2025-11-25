import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import Loading from '../components/Loading.jsx'

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL must be set in .env");
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); 
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const fetchAbortControllerRef = useRef(null);
  const lastFetchTimeRef = useRef(0);

  const fetchUser = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 5000) {
      //console.log('Skipping fetchUser - called too recently');
      return;
    }
    if (isFetchingRef.current && !force) {
      return;
    }

    if (isLoggingOut) {
      setLoading(false);
      setAuthChecked(true);
      return;
    }

    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
    }

    fetchAbortControllerRef.current = new AbortController();
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
        signal: fetchAbortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setError(null);
        //console.log(' User authenticated:', userData.email);
      } else if (res.status === 401) {
        setUser(null);
        setError(null);
        console.log('ℹ User not authenticated');
      } else {
        console.error('Failed to fetch user, status:', res.status);
        if (!user) {
          setUser(null);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
        console.error('Network error during auth check:', err.message);
      // Keep existing user state if we have it
      if (!user) {
        setUser(null);
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
      isFetchingRef.current = false;
      fetchAbortControllerRef.current = null;
    }
  }, [isLoggingOut, user]);

 const login = useCallback(async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        const message = data.message || "Invalid email or password";
        setError(message);
        setLoading(false);
        return { success: false, message };
      }

      setUser(data.user);
      setError(null);
      setAuthChecked(true);
      setLoading(false);
      lastFetchTimeRef.current = Date.now();
      
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        const message = data.message || "Registration failed. Please try again.";
        setError(message);
        setLoading(false);
        throw new Error(message);
      }

      setUser(data.user);
      setError(null);
      setAuthChecked(true);
      setLoading(false);
      lastFetchTimeRef.current = Date.now();
      
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred during registration.");
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      setError(null);
      
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      }); 
      
      setUser(null);
      setError(null);
      setAuthMode(null);
      setAuthChecked(true);
      lastFetchTimeRef.current = 0;
      
      //console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setError(null);
      setAuthMode(null);
      setAuthChecked(true);
      lastFetchTimeRef.current = 0;
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  const requestMagicLink = useCallback(async (email) => {
    try {
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/auth/request-magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || "Failed to send magic link.";
        setError(message);
        return { success: false, message };
      }

      return { success: true, message: data.message || "Magic link sent successfully." };
    } catch (err) {
      console.error("Magic link request error:", err);
      const message = err.message || "Network error while sending magic link.";
      setError(message);
      return { success: false, message };
    }
  }, []);

  const verifyMagicLink = useCallback(async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-magic-link/${token}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const message = data.message || "Invalid or expired link.";
        setError(message);
        setLoading(false);
        return { success: false, message };
      }

      setUser(data.user);
      setError(null);
      setAuthChecked(true);
      setLoading(false);
      lastFetchTimeRef.current = Date.now();
      
      return { success: true, user: data.user };
    } catch (err) {
      console.error("Verify magic link error:", err);
      const message = err.message || "Verification failed.";
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      //console.log(' Initializing auth check...');
      fetchUser(true);
    }
  }, [fetchUser]);

  const value = {
    user,
    loading,
    error,
    authMode,
    setAuthMode,
    isAuthenticated: !!user,
    authChecked,
    login,
    register,
    logout,
    clearError,
    refetchUser: () => fetchUser(true),
    requestMagicLink,
    verifyMagicLink
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && !authChecked ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};