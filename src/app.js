import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// 🧩 Import routes
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import studentAuthRoutes from "./routes/studentAuthRoutes.js"; 
import adminRoutes from "./routes/adminRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import studentSelfTestRoutes from "./routes/studentSelfTestRoutes.js";

// ⚙️ Passport configuration
import "./config/passport.js";

dotenv.config();
connectDB();

const app = express();

// ✅ CORS updated for deployed frontend
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://anandaraj-sir-project-1-frontend.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session (required for passport Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

// ✅ Passport setup
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.get("/", (req, res) => {
  res.send("📚 Smart LMS API Running...");
});

// 🔹 Admin Auth
app.use("/api/admin", adminAuthRoutes);

// 🔹 Student Auth (Google login + profile update)
app.use("/api/auth", studentAuthRoutes);

// 🔹 Admin feature routes
app.use("/api/admin", adminRoutes);

// 🔹 Student feature routes
app.use("/api/student", studentRoutes);

// 🔹 General data routes
app.use("/api/subjects", subjectRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/units", unitRoutes);

// 🔹 Static uploads
app.use("/uploads", express.static("uploads"));

// 🔹 Student self-test
app.use("/api/student", studentSelfTestRoutes);

export default app;
