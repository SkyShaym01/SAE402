const express = require("express");
const router = express.Router();
const { Movies } = require("../sgbd/models.js");

// get all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movies.findAll();
    res.json({
      message: "All Movies",
      date: movies
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get movie by id
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movies.findByPk(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get a random movie


module.exports = router;