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

  const fetchUser = useCallback(async (force = false) => {
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

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
        signal: fetchAbortControllerRef.current.signal
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setError(null);
        //console.log('✓ User authenticated:', userData.email);
      } else if (res.status === 401) {
        setUser(null);
        setError(null);
        console.log('ℹ User not authenticated');
      } else {
        console.error('Failed to fetch user, status:', res.status);
        setUser(null);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Failed to fetch user:', err);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true); // NEW: Mark auth check as complete
      isFetchingRef.current = false;
      fetchAbortControllerRef.current = null;
    }
  }, [isLoggingOut]);

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
      console.log('✓ Logout completed');
      
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setError(null);
      setAuthMode(null);
      setAuthChecked(true);
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
      fetchUser();
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

export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <Loading />;
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    return <Component {...props} />;
  };
};


export const useLoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, clearError } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }

    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});
      await login(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit
  };
};

export const useRegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    username:'',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, clearError } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }

    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return Promise.reject(new Error('Validation failed'));
    }

    try {
      setLoading(true);
      setErrors({});
      
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      
      return response;
    } catch (error) {
      setErrors({ submit: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors, 
    loading,
    handleChange,
    handleSubmit
  };
};