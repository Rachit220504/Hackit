const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Configure Passport with JWT Strategy
passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

// Configure GitHub Strategy if env variables are set
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with github id
          let user = await User.findOne({ githubId: profile.id });

          // If user doesn't exist, check if email is already used
          if (!user && profile.emails && profile.emails[0].value) {
            user = await User.findOne({ email: profile.emails[0].value });
            
            // If user exists with email, update github id
            if (user) {
              user.githubId = profile.id;
              await user.save();
            }
          }

          // If user still doesn't exist, create new user
          if (!user) {
            user = await User.create({
              name: profile.displayName || profile.username,
              email: profile.emails ? profile.emails[0].value : `${profile.id}@github.com`,
              githubId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}

// Configure Google Strategy if env variables are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with google id
          let user = await User.findOne({ googleId: profile.id });

          // If user doesn't exist, check if email is already used
          if (!user && profile.emails && profile.emails[0].value) {
            user = await User.findOne({ email: profile.emails[0].value });
            
            // If user exists with email, update google id
            if (user) {
              user.googleId = profile.id;
              await user.save();
            }
          }

          // If user still doesn't exist, create new user
          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
