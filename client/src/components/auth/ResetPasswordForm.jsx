import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";


const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
      setVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-token/${token}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUserEmail(data.email);
        setError("");
      } else {
        setError(data.message || "Invalid or expired reset link");
      }
    } catch (err) {
      console.error("Token verification error:", err);
      setError("Failed to verify reset link");
    } finally {
      setVerifying(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
      
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
    
        if (data.token) {
          localStorage.setItem('token', data.token);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };


  if (verifying) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-4" ></div>
            <p className="text-muted-foreground"style={{ fontFamily: "Space Grotesk" }}>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
          <div className="flex flex-col text-center p-6 space-y-2 pb-8">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground"style={{ fontFamily: "Space Grotesk" }}>
              Password reset successful
            </h1>
            <p className="text-muted-foreground text-sm"style={{ fontFamily: "Space Grotesk" }}>
              Redirecting you now...
            </p>
          </div>

          <div className="p-6 pt-0">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (invalid/expired token)
  if (error && !formData.password) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-lg border bg-card text-card-foreground shadow-elegant border-0">
          <div className="flex flex-col text-center p-6 space-y-2 pb-8">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground"style={{ fontFamily: "Space Grotesk" }}>
              Invalid reset link
            </h1>
            <p className="text-muted-foreground text-sm"style={{ fontFamily: "Space Grotesk" }}>
              This password reset link is invalid or has expired
            </p>
          </div>

          <div className="p-6 pt-0 space-y-4">
            <div className="text-red-500 px-4 py-3 rounded-lg text-sm bg-red-50">
              {error}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium  transition-colors"style={{ fontFamily: "Space Grotesk" }}
              >
                Request new reset link
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full h-12 mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-[0px_0px_0_0_#000] active:translate-y-[6px] active:translate-x-[6px] transition-all duration-200 ease-out text-lg font-medium font-[Space_Grotesk]"
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md"style={{ fontFamily: "Space Grotesk" }}>
        <div className="rborder bg-card text-card-foreground shadow-elegant border-1 shadow-card  shadow-[4px_4px_0_0_#000] ">
          {/* Header */}
          <div className="flex flex-col text-center p-6 space-y-2 pb-8">
            <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center" >
              <Lock className="h-6 w-6 text-foreground" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Set new password
            </h1>
            <p className="text-muted-foreground text-sm">
              {userEmail ? `Creating new password for ${userEmail}` : "Enter your new password below"}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 pt-0 space-y-6">
            <div className="space-y-4">
              {error && (
                <div className="text-red-500 px-4 py-3 rounded-lg text-sm bg-red-50">
                  {error}
                </div>
              )}

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  onKeyPress={handleKeyPress}
                 className="flex h-12 w-full  border border-input bg-input px-3 py-2 pl-10 pr-10 placeholder:text-muted-foreground focus:outline-none focus:outline-none focus:ring-1 focus:ring-ring shadow-card  shadow-[2px_2px_0_0_#000]"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onKeyPress={handleKeyPress}
                  className="flex h-12 w-full  shadow-card  shadow-[2px_2px_0_0_#000] border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                </ul>
              </div>

             
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-yellow-200 shadow-card  shadow-[4px_4px_0_0_#000] disabled:bg-gray-900 disabled:text-white text-blackfont-medium  transition-colors cursor-pointer hover:border hover:border-2"
              >
                {loading ? (
                  <div className="flex items-center space-x-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating password...</span>
                  </div>
                ) : (
                  "Update password"
                )}
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full text-center text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm; 