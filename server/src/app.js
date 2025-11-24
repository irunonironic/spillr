import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import privateWallRoutes from "./routes/wall.js";
import feedbackRoutes from "./routes/feedback.js";
import authRoutes from "./routes/auth.js";
import userSettings from "./routes/userSettings.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from 'cookie-parser';
import WallRoute from './routes/wallRoutes.js'
import compression from 'compression';

const app = express();

app.set('trust proxy', 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 
}));


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://www.spillr.live/",
  "https://spillr.vercel.app"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

//console.log(' Allowed CORS origins:', allowedOrigins);

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        console.log(' CORS allowed for:', origin);
        callback(null, true);
      } else {
        console.warn(' CORS blocked for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400
  })
);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http:", "https://res.cloudinary.com"], 
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://res.cloudinary.com"],
      },
    },
    frameguard: { action: "deny" },
     hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.url.startsWith("/uploads/"),
});

app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());


const uploadsPath = path.join(__dirname, "uploads");

app.use("/uploads", (req, res, next) => {
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "public, max-age=86400");
  next();
});

app.use("/uploads", express.static(uploadsPath, {
  maxAge: "1d",
  setHeaders: (res, filePath) => {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
}));


app.use("/api/auth", authRoutes);
app.use("/api/wall", privateWallRoutes);
app.use("/api/public/wall",WallRoute);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/settings", userSettings);


app.use("/api/", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ 
      message: "Validation failed",
      errors: err.errors
    });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ 
      message: err.message || "File upload error"
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const response = {
    message: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
  
});

export default app;