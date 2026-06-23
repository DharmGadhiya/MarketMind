const express = require("express");
require("dotenv").config({ override: true });
const CORS = require("cors");
const { default: mongoose } = require("mongoose");
const cookieParser = require("cookie-parser");
const checkForAuthenticationCookie = require("./middlewares/auth");
const app = express();
const PORT = 8000 || process.env.PORT;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("DB connection failed");
  });

app.use(
  CORS({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(checkForAuthenticationCookie("Token"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
