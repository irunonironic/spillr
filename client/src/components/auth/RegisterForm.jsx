import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, AtSign, UserPlus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateUsername,
} from "../../utils/validation";

const RegisterForm = ({ onSuccess, onToggleLogin, onCancel }) => {
  const { register, requestMagicLinkRegister } = useAuth();

  const [tab, setTab] = useState("magic");
  const [magicForm, setMagicForm] = useState({ name: "", email: "" });
  const [magicErrors, setMagicErrors] = useState({});
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClass =
    "h-12 w-full px-3 pl-10 border border-black border-t-[1px] " +
    "focus:outline-none focus:border-t-2 focus:border-t-black shadow-card shadow-[2px_2px_0_0_#000]";

  const inputClassPassword =
    "h-12 w-full px-3 pl-10 pr-10 border border-black border-t-[1px] " +
    "focus:outline-none focus:border-t-2 focus:border-t-black shadow-card shadow-[2px_2px_0_0_#000]";

  const handleMagicChange = (field) => (e) => {
    setMagicForm((p) => ({ ...p, [field]: e.target.value }));
    setMagicErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleMagicSubmit = async (e) => {
    e.preventDefault();
    setMagicErrors({});

    const nameError = validateName(magicForm.name);
    if (nameError) return setMagicErrors({ name: nameError });

    const emailError = validateEmail(magicForm.email);
    if (emailError) return setMagicErrors({ email: emailError });

    setMagicLoading(true);

    const result = await requestMagicLinkRegister({
      email: magicForm.email,
      name: magicForm.name,
    });

    if (result.success) {
      setMagicSent(true);
    } else if (result.shouldRedirectToLogin) {
      setMagicErrors({
        submit: "Account already exists. Redirecting...",
      });
      setTimeout(() => onToggleLogin?.(), 2000);
    } else {
      setMagicErrors({ submit: result.message });
    }

    setMagicLoading(false);
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleChange = (f) => (e) => {
    setFormData((p) => ({ ...p, [f]: e.target.value }));
    setErrors((p) => ({ ...p, [f]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const v = validatePasswordForm();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response?.success || response?.userCreated) {
        onSuccess?.();
      } else {
        setErrors({ submit: response?.message || "Registration failed" });
      }
    } catch {
      setErrors({ submit: "Registration failed. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="border bg-card text-card-foreground shadow-elegant border-1 shadow-card shadow-[4px_4px_0_0_#000]"
        style={{ fontFamily: "Space Grotesk" }}
      >
        {/* Header */}
        <div className="flex flex-col text-center p-6 space-y-2 border-b-2 border-black bg-yellow-100">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center bg-black rounded-full  ">
            <UserPlus className="h-6 w-6 text-foreground text-yellow-200" />
          </div>

          <h1 className="text-2xl font-semibold">Create your account</h1>

          {/* Tabs */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => setTab("magic")}
              className={`px-3 py-1 text-sm font-medium border border-black
      shadow-[2px_2px_0_0_#000]
      hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]
      active:shadow-[0px_0px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]
      transition-all duration-150 ease-out transform select-none
                ${
                  tab === "magic"
                    ? "bg-black text-yellow-200"
                    : "bg-white text-black"
                }`}
            >
              Email Link
            </button>

            <button
              onClick={() => setTab("password")}
              className={`px-3 py-1 text-sm font-medium border border-black 
      shadow-[2px_2px_0_0_#000]
      hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px]
      active:shadow-[0px_0px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]
      transition-all duration-150 ease-out transform select-none
                ${
                  tab === "password"
                    ? "bg-black text-yellow-200"
                    : "bg-white text-black"
                }`}
            >
              Password
            </button>
          </div>
        </div>

        <div className="p-6 pt-0 mt-4 ">
        
          {tab === "magic" && (
            <div className="space-y-6">
              {magicErrors.submit && (
                <div className="text-red-700 bg-red-100 border border-red-400 px-4 py-3 text-sm text-center shadow-[2px_2px_0_0_#FF0000]">
                  {magicErrors.submit}
                </div>
              )}

              {magicSent ? (
                <div className="text-center space-y-2">
                  <p className="text-green-600 font-medium">
                    ✓ Link sent! Check your inbox.
                  </p>
                  <button
                    onClick={() => setMagicSent(false)}
                    className="text-blue-600 underline text-sm"
                  >
                    Send again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={magicForm.name}
                      onChange={handleMagicChange("name")}
                      className={inputClass}
                    />
                    {magicErrors.name && (
                      <p className="text-red-400 text-sm mt-1">
                        {magicErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={magicForm.email}
                      onChange={handleMagicChange("email")}
                      className={inputClass}
                    />
                    {magicErrors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {magicErrors.email}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={magicLoading}
                    className="w-full h-12 mt-8 mb-4 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-[0px_0px_0_0_#000] active:translate-y-[6px] active:translate-x-[6px] transition-all duration-200 ease-out text-lg font-medium font-[Space_Grotesk] font-bold"
                  >
                    {magicLoading ? "Sending..." : "Send Registration Link"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* PASSWORD FORM */}
          {tab === "password" && (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.submit && (
                  <div className="text-red-700 bg-red-100 border border-red-400 px-4 py-3 text-sm text-center shadow-[2px_2px_0_0_#FF0000]">
                    {errors.submit}
                  </div>
                )}

                {/* Name */}
                <div className="relative ">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground " />
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange("name")}
                    className={inputClass}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Username */}
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange("username")}
                    className={inputClass}
                  />
                  {errors.username && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    className={inputClassPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className={inputClassPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-8 mb-4 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-[0px_0px_0_0_#000] active:translate-y-[6px] active:translate-x-[6px] transition-all duration-200 ease-out text-lg font-medium font-[Space_Grotesk]"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>
            </div>
          )}

          {/* TOGGLE LOGIN */}
          {onToggleLogin && (
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <button onClick={onToggleLogin} className="underline">
                Sign in
              </button>
            </p>
          )}

          {/* CANCEL */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full mt-2 underline text-sm"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
