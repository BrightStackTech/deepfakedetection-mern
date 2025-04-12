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
      secure: true,
      sameSite: "none",
    },
    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: "sessions",
    }),
  })
);
app.use((res, req, next) => {
  res.header("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow requests from your Vercel frontend
    credentials: true, // Allow cookies and credentials
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);


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
                  // User exists – if no googleId then already registered using email/password
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
  (req,res) => {
      res.redirect(`${process.env.CLIENT_URL}/home`);
  }
);

app.use(passport.initialize());
app.use(passport.session());

// redirect user to google for authentication
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// google callback after authentication
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    console.log("authenticated User: ", req.user);
    res.redirect(`${process.env.CLIENT_URL}/home`);
  }
);

app.get("/home", isLoggedin, (req, res) => {
  console.log("Authenticated User:", req.user); 
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
