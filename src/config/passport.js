import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://anandaraj-sir-project-1-backend.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let student = await Student.findOne({ email });

        if (!student) {
          student = new Student({
            email,
            name: "", // leave blank for frontend setup
            department: "",
            googleName: profile.displayName,
          });
          await student.save();
        }

        return done(null, student);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize & deserialize for session
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const student = await Student.findById(id);
  done(null, student);
});

// Helper to generate JWT token
export const generateToken = (student) => {
  return jwt.sign(
    { id: student._id, email: student.email },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "7d" }
  );
};
