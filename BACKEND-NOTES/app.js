const express = require("express");
const cors = require("cors");

const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running Successfully",
  });
});

app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

module.exports = app;