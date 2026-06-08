console.log("SERVER FILE STARTED");
require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`Server running on port 5000`);
});