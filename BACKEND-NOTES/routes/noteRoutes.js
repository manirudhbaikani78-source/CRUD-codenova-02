const express = require("express");

const {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
} = require("../controllers/notecontroller");

const router = express.Router();

router.route("/")
  .post(createNote)
  .get(getAllNotes);

router.route("/:id")
  .get(getSingleNote)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;