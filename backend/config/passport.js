const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/github/callback`,
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ 'github.id': profile.id });

        if (user) {
          return done(null, user);
        }

        // Get primary email
        const emails = profile.emails || [];
        const primaryEmail = emails.length > 0 ? emails[0].value : null;

        if (!primaryEmail) {
          return done(new Error('No email found from GitHub profile'), null);
        }

        // Check if user exists with this email
        user = await User.findOne({ email: primaryEmail });

        if (user) {
          // Link GitHub account to existing user
          user.github = {
            id: profile.id,
            username: profile.username
          };
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          name: profile.displayName || profile.username,
          email: primaryEmail,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          github: {
            id: profile.id,
            username: profile.username
          }
        });

        await user.save();
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ 'google.id': profile.id });

          if (user) {
            return done(null, user);
          }

          // Get primary email
          const emails = profile.emails || [];
          const primaryEmail = emails.length > 0 ? emails[0].value : null;

          if (!primaryEmail) {
            return done(new Error('No email found from Google profile'), null);
          }

          // Check if user exists with this email
          user = await User.findOne({ email: primaryEmail });

          if (user) {
            // Link Google account to existing user
            user.google = {
              id: profile.id
            };
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = new User({
            name: profile.displayName,
            email: primaryEmail,
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            google: {
              id: profile.id
            }
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
