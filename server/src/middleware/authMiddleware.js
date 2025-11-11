import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJWTSecret = () => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return JWT_SECRET;
};

const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
};

const authMiddleware = async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie;
    const hasCookies = !!cookieHeader;
    
    /*console.log('Auth middleware check:', {
      path: req.path,
      method: req.method,
      hasCookieHeader: hasCookies,
      cookieKeys: Object.keys(req.cookies || {}),
    }); */
    
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Token from Authorization header');
      }
    }
    
    if (!token) {
      console.log(' No token found');
      return res.status(401).json({ 
        message: "Not authenticated",
        reason: "no_token"
      });
    }

    const JWT_SECRET = getJWTSecret();
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      //console.log(' Token verified for user:', decoded.id);
    } catch (jwtError) {
      console.log(' Token verification failed:', jwtError.message);
      
      res.clearCookie("token", getCookieConfig());
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Token expired. Please login again.",
          reason: "token_expired"
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: "Invalid token. Please login again.",
          reason: "invalid_token"
        });
      }
      
      return res.status(401).json({ 
        message: "Authentication failed",
        reason: "token_error"
      });
    }
    const user = await User.findById(decoded.id)
      .select('-passwordHash -googleId -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!user) {
      console.log(' User not found for ID:', decoded.id);
      res.clearCookie("token", getCookieConfig());
      return res.status(401).json({ 
        message: "User not found",
        reason: "user_not_found"
      });
    }
    
    if (!user.isActive) {
      console.log(' User inactive:', decoded.id);
      res.clearCookie("token", getCookieConfig());
      return res.status(401).json({ 
        message: "Account is inactive",
        reason: "user_inactive"
      });
    }

    req.user = { ...user, id: user._id.toString() };
    console.log(' Auth successful for:', user.email);
    
    next();
  } catch (error) {
    console.error(" Auth middleware error:", error.message);

    try {
      res.clearCookie("token", getCookieConfig());
    } catch (clearError) {
      console.error("Failed to clear cookie:", clearError.message);
    }
    
    return res.status(500).json({ 
      message: "Authentication error. Please try logging in again.",
      reason: "server_error"
    });
  }
};

export default authMiddleware;