if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");

// Safe import for connect-mongo across versions
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo;

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressErr.js");

const listingsRoute = require("./routes/listing.route.js");
const reviewsRoute = require("./routes/review.route.js");
const usersRoute = require("./routes/user.route.js");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;
const dbOptions = {
  family: 4,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  w: "majority",
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

// 1. Connect Mongoose
async function main() {
  if (!dbUrl) {
    throw new Error("ATLASDB_URL is missing from the environment configuration.");
  }

  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(dbUrl, dbOptions);
      break;
    } catch (err) {
      await mongoose.disconnect();
      if (attempt === maxAttempts) {
        throw err;
      }
      console.error(`MongoDB connection attempt ${attempt} failed. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("Connected TO DB");

  // 2. MongoDB session store, sharing Mongoose's established connection.
  const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    touchAfter: 24 * 3600,
  });

  store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE:", err);
  });

  return store;
}

// 3. Session configuration
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "defaultsessionsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

async function startServer() {
  try {
    sessionOptions.store = await main();
    app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

app.get(["/", "/listing"], (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", usersRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const { statusCode = 500, message = "Something went wrong!" } = err;
  return res.status(statusCode).render("error.ejs", { err });
});

    const port = process.env.PORT || 4040;
    const server = app.listen(port, () => {
      console.log(`Server is listening at ${port}`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Stop the other server or use a different PORT.`);
      } else {
        console.error("Server startup error:", err);
      }
      process.exitCode = 1;
    });
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exitCode = 1;
  }
}

startServer();
