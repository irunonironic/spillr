import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { validateEmail, validateLoginPassword } from "../../utils/validation";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ForgotPasswordForm from "../auth/ForgotPasswordForm";

const LoginForm = ({ onSuccess, onToggleRegister, onCancel }) => {
  const { login, requestMagicLink } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailError = validateEmail(formData.email);

    if (emailError) {
      setErrors({ email: emailError });
      return false;
    }

    if (!useMagicLink) {
      const passwordError = validateLoginPassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (errors.submit) setErrors((prev) => ({ ...prev, submit: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    if (useMagicLink) {
      await handleMagicLinkRequest();
      return;
    }

    const passwordError = validateLoginPassword(formData.password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    setLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response?.success) {
        //console.log('Login successful, calling onSuccess');
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback navigation if onSuccess not provided
          navigate("/dashboard", { replace: true });
        }
      } else {
        setErrors({
          submit: response?.message || "Invalid email or password.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkRequest = async () => {
    setLoading(true);
    setErrors({});

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      setLoading(false);
      return;
    }

    try {
      const result = await requestMagicLink(formData.email);

      if (result.success) {
        setMagicLinkSent(true);
      } else {
        setErrors({ submit: result.message || "Failed to send login link." });
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrors({ submit: "Network error. Check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => setShowForgotPassword(true);
  const closeForgotPassword = () => setShowForgotPassword(false);

  return (
    <div className="w-full max-w-md mx-auto">
      {showForgotPassword ? (
        <ForgotPasswordForm onCancel={closeForgotPassword} />
      ) : (
        <div className="border bg-card text-card-foreground shadow-elegant border-1 shadow-card shadow-[4px_4px_0_0_#000]">
          {/* Header */}
          <div className="flex flex-col text-center p-6 space-y-2 pb-8">
            <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
              <LogIn className="h-6 w-6 text-foreground" />
            </div>
            <h1
              className="text-2xl font-semibold text-foreground"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Sign in to your account
            </h1>
            <p
              className="text-muted-foreground text-sm"
              style={{ fontFamily: "Space Grotesk" }}
            >
              Choose your preferred sign-in method
            </p>

            <div className="flex justify-center mt-3 space-x-2">
              {/* Email Link tab */}
              <button
                type="button"
                onClick={() => setUseMagicLink(true)}
                className={` px-3 py-1 text-sm font-medium border border-black bg-white
      shadow-[2px_2px_0_0_#000]
      hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]
      active:shadow-[0px_0px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]
      transition-all duration-150 ease-out transform select-none
     
                  ${
                    useMagicLink
                      ? "bg-gray-900 text-black"
                      : "bg-transparent text-foreground hover:bg-foreground/10"
                  }`}
                style={{ fontFamily: "Space Grotesk" }}
              >
                Email Link
              </button>

              {/* Password tab */}
              <button
                type="button"
                onClick={() => setUseMagicLink(false)}
                className={`px-3 py-1 text-sm font-medium border border-black bg-white
      shadow-[2px_2px_0_0_#000]
      hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]
      active:shadow-[0px_0px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]
      transition-all duration-150 ease-out transform select-none
                  ${
                    !useMagicLink
                      ? "bg-gray-900 black"
                      : "bg-transparent text-foreground hover:bg-foreground/10"
                  }`}
                style={{ fontFamily: "Space Grotesk" }}
              >
                Password
              </button>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-6">
            {errors.submit && (
              <div className="text-red-700 bg-red-100 border border-red-400 px-4 py-3 text-sm text-center font-medium shadow-card shadow-[2px_2px_0_0_#f00] font-[Space_Grotesk]">
                {errors.submit}
              </div>
            )}

            {magicLinkSent ? (
              <div className="text-center space-y-4">
                <div className="text-green-600 font-medium text-sm">
                  ✓ Login link sent! Check your inbox to sign in.
                </div>
                <p className="text-xs text-gray-600">
                  The link will expire in 15 minutes. Make sure to check your
                  spam folder.
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Send another link
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange("email")}
                    required
                    className="flex h-12 w-full border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-[Space_Grotesk] shadow-card shadow-[2px_2px_0_0_#000]"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password (only if password mode) */}
                {!useMagicLink && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange("password")}
                        className="flex h-12 w-full border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-[Space_Grotesk] shadow-card shadow-[2px_2px_0_0_#000]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-muted-foreground hover:text-foreground underline font-[Space_Grotesk]"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-[0px_0px_0_0_#000] active:translate-y-[6px] active:translate-x-[6px] transition-all duration-200 ease-out text-lg font-medium font-[Space_Grotesk]"
                >
                  {loading
                    ? "Processing..."
                    : useMagicLink
                    ? "Send Sign-In Link"
                    : "Sign In"}
                </button>
              </form>
            )}

            <p className="text-center text-sm mt-4 font-[Space_Grotesk]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onToggleRegister}
                className="underline font-medium"
              >
                Sign up
              </button>
            </p>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full mt-2 underline text-sm font-[Space_Grotesk]"
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
