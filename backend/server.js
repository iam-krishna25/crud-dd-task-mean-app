const express = require("express");
const cors = require("cors"); // keep if you need cross-origin requests

const app = express();

// optional: enable CORS (uncomment if frontend calls backend from another origin)
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// recommended: silence the strictQuery deprecation warning and be explicit
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// Read DB URL from environment (works inside Docker)
// Fallback to a sensible container-aware default (service name 'mongo')
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/appdb";

const db = require("./app/models");

// connect using environment variable
db.mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.error("Cannot connect to the database!", err);
    // don't exit immediately in production; here we keep behavior as before
    process.exit(1);
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Test application." });
});

// make sure the route filename is correct in your project
// original used "./app/routes/turorial.routes" (typo?). Keep it if file exists.
require("./app/routes/turorial.routes")(app);

// set port (use env PORT set by docker-compose), default to 4000 to match compose
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
