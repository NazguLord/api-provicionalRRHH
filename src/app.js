require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authMiddleware = require("./middlewares/auth.middleware");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/data", authMiddleware, express.static(path.join(__dirname, "..", "data")));

app.use("/api", routes);
app.use((error, req, res, next) => {
  if (!error) {
    return next();
  }

  res.status(400).json({
    ok: false,
    message: "Error al procesar la solicitud",
    error: error.message
  });
});

module.exports = app;
