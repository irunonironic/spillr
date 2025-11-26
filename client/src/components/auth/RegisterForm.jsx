import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, AtSign, UserPlus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePassword, validateName, validateUsername } from "../../utils/validation";

const RegisterForm = ({
  onSuccess,
  onToggleLogin,
  onCancel,
}) => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
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

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response?.success || response?.userCreated) {
        console.log("Registration successful");
        
      if (!response?.wallCreated && response?.userCreated) {
        console.warn("Wall creation failed, but user registered successfully");
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrors({
          submit: response?.message || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        submit: error?.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border bg-card text-card-foreground shadow-elegant border-1 shadow-card  shadow-[4px_4px_0_0_#000] ">
        {/* Header */}
        <div className="flex flex-col text-center p-6 space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-foreground" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground"style={{ fontFamily: "Space Grotesk" }}>
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm"style={{ fontFamily: "Space Grotesk" }}>
            Join us and start your journey today
          </p>
        </div>

        {/* Form */}
        <div className="p-6 pt-0 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Submit Error */}
            {errors.submit && (
              <div 
                className="text-red-700 bg-red-100 border border-red-400 px-4 py-3 rounded-md text-sm text-center font-medium shadow-card  shadow-[2px_2px_0_0_#FF0000]" style={{ fontFamily: "Space Grotesk" }}
                role="alert"
              >
                {errors.submit}
              </div>
            )}

            {/* Name Input */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange("name")}
                className="flex h-12 w-full  border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-card  shadow-[2px_2px_0_0_#000]  "
                required style={{ fontFamily: "Space Grotesk" }}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1"style={{ fontFamily: "Space Grotesk" }}>{errors.name}</p>
              )}
            </div>

            {/* Username Input */}
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange("username")}
                className="flex h-12 w-full  border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-card  shadow-[2px_2px_0_0_#000]"style={{ fontFamily: "Space Grotesk" }}
                required
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1"style={{ fontFamily: "Space Grotesk" }}>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange("email")}
                className="flex h-12 w-full  border border-input bg-input px-3 py-2 pl-10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-card  shadow-[2px_2px_0_0_#000]"style={{ fontFamily: "Space Grotesk" }}
                required
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1" style={{ fontFamily: "Space Grotesk" }}>{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange("password")}
                className="flex h-12 w-full  border border-input bg-input px-3 py-2 pl-10 pr-10 placeholder:text-muted-foreground focus:outline-none focus:outline-none focus:ring-1 focus:ring-ring shadow-card  shadow-[2px_2px_0_0_#000]"
                required style={{ fontFamily: "Space Grotesk" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1"style={{ fontFamily: "Space Grotesk" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                className="flex h-12 w-full  border border-input bg-input px-3 py-2 pl-10 pr-10 placeholder:text-muted-foreground focus:outline-none focus:outline-none focus:ring-1 focus:ring-ring shadow-card  shadow-[2px_2px_0_0_#000]"
                required style={{ fontFamily: "Space Grotesk" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1"style={{ fontFamily: "Space Grotesk" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-12 mt-8 px-4 py-2 text-black border-2 border-black bg-yellow-200 shadow-[6px_6px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] hover:translate-y-[3px] hover:translate-x-[3px] active:shadow-[0px_0px_0_0_#000] active:translate-y-[6px] active:translate-x-[6px] transition-all duration-200 ease-out text-lg font-medium font-[Space_Grotesk]">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Toggle to Login */}
          {onToggleLogin && (
            <p className="text-center text-sm text-muted-foreground mt-4"style={{ fontFamily: "Space Grotesk" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleLogin}
                className="text-foreground hover:underline font-medium underline"
              >
                Sign in
              </button>
            </p>
          )}

          {/* Back to Home */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full mt-2 text-muted-foreground hover:text-foreground text-sm transition-colors underline"style={{ fontFamily: "Space Grotesk" }}
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