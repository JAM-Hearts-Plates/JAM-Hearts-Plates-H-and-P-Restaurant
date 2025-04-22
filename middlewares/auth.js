import { UserModel } from "../models/user.js";
import { expressjwt } from "express-jwt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";


//jwt authentication middleware
export const isAuthenticated = expressjwt({
    secret: process.env.JWT_SECRET_KEY,
    algorithms: ["HS256"]
});



//google Oauth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                    // Check if user already exists in the database
                    let user = await UserModel.findOne({ googleId: profile.id });

                    if (!user) {
                        // If user does not exist, create a new user
                        user = new UserModel({
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos[0].value,
                            phone: "", // Set empty default value
                            userName: profile.displayName.split(" ").join("").toLowerCase(), // Generate a username
                            firstName: profile.name?.givenName || profile.displayName.split(" ")[0] || "Unknown",
                            lastName: profile.name?.familyName || profile.displayName.split(" ")[1] || "Unknown",
                        });
    
                        await user.save(); // Save the new user in the database
                    }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


// passport session management 
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));




// google OAuth middleware (used in outes)
export const authenticateGoogle = passport.authenticate("google", { scope: ["profile", "email"] });

export const googleCallback = passport.authenticate("google", {
    session: false, // This disables sessions since we're using JWT
    successRedirect: "/dashboard", // Redirect on successful login
    failureRedirect: "/login", // Redirect on failure
});