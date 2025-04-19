const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./Models/user");
const MongoStore = require("connect-mongo");
require('dotenv').config();
const userRoutes = require("./Routes/userRoutes");
const authRoutes = require("./Routes/authRoutes");
const testRoutes = require("./test-deployment");
const path = require('path');

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const port = process.env.PORT || 5000;

// Force NODE_ENV to production on Render
if (process.env.RENDER) {
  process.env.NODE_ENV = 'production';
}

console.log('Environment:', process.env.NODE_ENV);
console.log('Client URL:', process.env.CLIENT_URL);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    },
    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native'
    }),
  })
);

// Initialize passport before any routes
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.get('/api/test-cookies', (req, res) => {
  // Set a test cookie
  res.cookie('testCookie', 'cookieValue', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({
    message: 'Cookie set',
    env: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL
  });
});


passport.serializeUser((user, done) => {
  console.log("Serialized User: ", user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log("Deserialized User: ", id);
  try {
    User.findById(id).then((user) => done(null, user));
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (user) {
          // User exists – if no googleId then already registered using email/password
          if (!user.googleId) {
            return done(null, false, {
              message:
                "the entered email has signed up using different sign up method",
            });
          }
          return done(null, user);
        } else {
          // Create a new user with Google
          let username = profile.displayName.replace(/\s+/g, "_").toLowerCase();
          const newUser = {
            googleId: profile.id,
            username,
            email,
            profilePicture: profile.photos[0].value,
            isVerified: true,
          };
          user = await User.create(newUser);
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google authentication routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      `${process.env.CLIENT_URL}/login?error=the%20entered%20email%20has%20signed%20up%20using%20different%20sign%20up%20method`,
  }),
  (req, res) => {
    // Log the authenticated user
    console.log("authenticated User: ", req.user);
    res.redirect(`${process.env.CLIENT_URL}/home`);
  }
);

app.get("/home", isLoggedin, (req, res) => {
  res.send("Welcome to DeepTrace");
});

function isLoggedin(req, res, next) {
  console.log("Authenticated User:", req.user); // Log the user session
  if (req.isAuthenticated()) {
    return next();
  }
  console.log("User not authenticated");
  res.redirect("/login");
}

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect(`${process.env.CLIENT_URL}/`));
});

app.use("/api", userRoutes);
app.use("/api", authRoutes);
app.use("/api", testRoutes);

// app.post("/metadata-update", (req, res) => {
//   const filePath = path.resolve(__dirname, req.body.filename);
//   const result = req.body.result;
//   const accuracy = req.body.accuracy;

//   const command = `cd "C:/Users/Kartik/Downloads/exiftool-12.97_64/exiftool-12.97_64" && exiftool -Title="This video is ${result}" -Description="Deepfake Detection Prediction: ${accuracy}%" ${filePath}`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error: ${error.message}`);
//       return res.status(500).send('Error executing ExifTool');
//     }
//     if (stderr) {
//       console.error(`Stderr: ${stderr}`);
//       return res.status(500).send('ExifTool encountered an error');
//     }
//     res.send(`Metadata updated successfully! Output: ${stdout}`);
//   });

//   // console.log("Metadata updated:", req.body);
//   // res.send("Metadata updated successfully");
// });

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
