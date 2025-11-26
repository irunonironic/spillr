import React, { useState } from "react";
import { Mail } from "lucide-react";
import { validateEmail } from "../../utils/validation";

const ForgotPasswordForm = ({ onCancel }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

      console.log(' Sending password reset request...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); 

      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      console.log(' Password reset response:', { 
        status: response.status, 
        ok: response.ok,
        message: data.message 
      });

      if (response.ok) {
        setSuccess("Password reset link sent! Check your email.");
        console.log(' Password reset email sent successfully');
      } else {
        setError(data.message || "Failed to send reset link");
        console.error(' Password reset failed:', data.message);
      }
    } catch (err) {
      console.error(" Forgot password error:", err);
      
      if (err.name === 'AbortError') {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
      console.log(' Password reset request completed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border bg-card text-card-foreground shadow-elegant border-1 shadow-card shadow-[4px_4px_0_0_#000]">
        <div className="flex flex-col text-center p-6 space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
            <Mail className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <div className="p-6 pt-0 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 px-4 py-3 rounded-lg text-sm bg-green-50 border border-green-200">
                {success}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleChange}
                disabled={loading}
                className="flex h-12 w-full shadow-card shadow-[2px_2px_0_0_#000] border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                required 
                style={{ fontFamily: "Space Grotesk" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-[0px_0px_0_0_#000] active:translate-y-[6px] active:translate-x-[6px] transition-all duration-200 ease-out text-lg font-medium font-[Space_Grotesk"
              style={{ fontFamily: "Space Grotesk" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 underline disabled:opacity-50"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;