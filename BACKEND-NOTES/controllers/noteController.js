const Note = require("../models/Note");
const createNote = async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  try {
    const note = await Note.create(req.body);

    console.log("NOTE CREATED:", note);

    res.status(201).json(note);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};