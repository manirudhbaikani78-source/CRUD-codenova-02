const express = require("express");

const {
  registerUser,
  getUsers,
} = require("../controllers/userController");

const router = express.Router();

router.route("/")
  .post(registerUser)
  .get(getUsers);

module.exports = router;