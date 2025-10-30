// src/config/passport.js
import dotenv from "dotenv";
dotenv.config(); // 👈 MUST be here at the very top

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Student from "../models/Student.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // ✅ these should not be undefined
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let student = await Student.findOne({ googleId: profile.id });

        if (!student) {
          student = await Student.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }

        return done(null, student);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((student, done) => {
  done(null, student.id);
});

passport.deserializeUser(async (id, done) => {
  const student = await Student.findById(id);
  done(null, student);
});
