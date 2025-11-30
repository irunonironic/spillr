import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { validateEmail, validateLoginPassword } from "../../utils/validation";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ForgotPasswordForm from "../auth/ForgotPasswordForm";

const LoginForm = ({ onSuccess, onToggleRegister, onCancel }) => {
  const { login, requestMagicLink } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("magic");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
 
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
      
    setFieldErrors({});
    setSubmitError("");

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      //console.log("Email validation failed:", emailErr);
      return;
    }

    const pwErr = validateLoginPassword(formData.password);
    if (pwErr) {
      setFieldErrors({ password: pwErr });
      //console.log(" Password validation failed:", pwErr);
      return;
    }

    setLoading(true);
    //console.log("Loading set to TRUE");

    try {
      //console.log("Calling login API...");
      
      const result = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

 
      if (!result || result.success === false) {
        const errorMsg = result?.message || "Invalid email or password. Please try again.";
        setSubmitError(errorMsg);
        setLoading(false);
        return;
      }

      setLoading(false);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setSubmitError(err?.message || "Network error. Please try again.");
      setLoading(false);
      
    }
  };

  const handleMagicSubmit = async (e) => {
    e.preventDefault();
    
    setFieldErrors({});
    setSubmitError("");
    
    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      return;
    }

    setLoading(true);
    
    try {
      const result = await requestMagicLink(formData.email.trim());
      
      if (result && result.success) {
        setMagicLinkSent(true);
      } else {
        setSubmitError(result?.message || "Failed to send login link.");
      }
    } catch (err) {
      console.error("Magic link error:", err);
      setSubmitError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onCancel={() => setShowForgotPassword(false)} />;
  }



  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-2 bg-white shadow-[4px_4px_0_0_#000] border-black">
        {/* HEADER */}
        <div className="flex flex-col text-center p-6 space-y-3 border-b-2 border-black bg-yellow-100">
          <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-2">
            <LogIn className="h-6 w-6 text-yellow-200" />
          </div>

          <h1 className="text-2xl mb-2 font-bold text-black" style={{ fontFamily: "Space Grotesk" }}>
            Sign in to your account
          </h1>

          <p className="text-gray-700 text-sm" style={{ fontFamily: "Space Grotesk" }}>
            Choose your preferred sign-in method
          </p>

          {/* TABS */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              type="button"
              onClick={() => { 
                setTab("magic"); 
                setFieldErrors({});
                setSubmitError("");
                setMagicLinkSent(false);
              }}
              className={`px-3 py-1 text-sm font-medium border border-black
      shadow-[2px_2px_0_0_#000]
      hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]
      active:shadow-[0px_0px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]
      transition-all duration-150 ease-out transform select-none
                ${tab === "magic" ? "bg-black text-yellow-200" : "bg-white text-black hover:bg-gray-50"}`}
              style={{ fontFamily: "Space Grotesk" }}
            >
              Email Link
            </button>

            <button
              type="button"
              onClick={() => { 
                setTab("password"); 
                setFieldErrors({});
                setSubmitError("");
                setMagicLinkSent(false);
              }}
              className={`px-3 py-1 text-sm font-medium border border-black
      shadow-[2px_2px_0_0_#000]
      hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]
      active:shadow-[0px_0px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]
      transition-all duration-150 ease-out transform select-none
                ${tab === "password" ? "bg-black text-yellow-200" : "bg-white text-black hover:bg-gray-50"}`}
              style={{ fontFamily: "Space Grotesk" }}
            >
              Password
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
         
          {submitError && submitError.length > 0 && (
            <div 
              className="bg-red-50 border-2 border-red-500 rounded-none p-2 shadow-[4px_4px_0_0_#dc2626] mb-4" 
              style={{ fontFamily: "Space Grotesk" }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-base mb-1">Login Failed</h3>
                  <p className="text-red-800 text-sm leading-relaxed">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {magicLinkSent && tab === "magic" ? (
            <div className="text-center space-y-4 p-4 bg-green-50 border-1 border-green-500"  style={{ fontFamily: "Space Grotesk" }}>
              <p className="text-green-700 font-semibold" >✓ Login link sent! Check your inbox.</p>
              <p className="text-sm text-green-600">The link will expire in 15 minutes.</p>
              <button 
                onClick={() => { 
                  setMagicLinkSent(false); 
                  setSubmitError(""); 
                }} 
                className="text-sm text-green-700 underline hover:text-green-900 font-medium"
              >
                ← Send another link
              </button>
            </div>
          ) : (
            <form 
              onSubmit={tab === "magic" ? handleMagicSubmit : handlePasswordLogin} 
              className="space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label 
                  className="block text-sm font-bold text-gray-700 mb-2" 
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange("email")}
                    className={`h-12 w-full px-3 pl-10 border-2 ${
                      fieldErrors.email ? 'border-red-500' : 'border-black'
                    } shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-black`}
                    style={{ fontFamily: "Space Grotesk" }}
                    disabled={loading}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              {tab === "password" && (
                <>
                  <div>
                    <label 
                      className="block text-sm font-bold text-gray-700 mb-2" 
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        className={`h-12 w-full px-3 pl-10 pr-10 border-2 ${
                          fieldErrors.password ? 'border-red-500' : 'border-black'
                        } shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-black`}
                        style={{ fontFamily: "Space Grotesk" }}
                        disabled={loading}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black" 
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <button 
                      type="button" 
                      onClick={() => setShowForgotPassword(true)} 
                      className="text-sm underline text-gray-600 hover:text-black font-medium" 
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </>
              )}

              {/* SUBMIT */}
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 px-4 py-2 border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-none active:translate-y-[6px] active:translate-x-[6px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed  text-base" 
                style={{ fontFamily: "Space Grotesk" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin " />
                    Processing...
                  </span>
                ) : (
                  tab === "magic" ? "Send Sign-In Link" : "Sign In"
                )}
              </button>
            </form>
          )}

          {/* FOOTER */}
          <div className="border-t-2 border-gray-200 pt-4 space-y-3">
            {onToggleRegister && (
              <p className="text-center text-sm" style={{ fontFamily: "Space Grotesk" }}>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={onToggleRegister} 
                  className="underline font-bold text-black hover:text-gray-700"
                >
                  Sign up here
                </button>
              </p>
            )}
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel} 
                className="w-full text-center underline text-sm text-gray-600 hover:text-black" 
                style={{ fontFamily: "Space Grotesk" }}
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;