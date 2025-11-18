// backend/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import Student from "../models/Student.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // ✅ Step 1: Check if student already exists
        let student = await Student.findOne({ email });

        // ✅ Step 2: If not, create a new record
        if (!student) {
  student = new Student({
    email,
    name: "", // Keep empty so frontend detects incomplete profile
    department: "", // Keep empty
    googleName: profile.displayName // if you want to store Google name separately
  });
  await student.save();
}


        // ✅ Step 3: Return student to callback
        return done(null, student);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;
