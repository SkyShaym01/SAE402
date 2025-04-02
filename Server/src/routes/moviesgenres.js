const express = require("express");
const sequelize = require("sequelize");
const router = express.Router();
const { MoviesGenres } = require("../sgbd/models.js");

// get all movies-genre relations
router.get("/", async (req, res) => {
  try {
    const moviesGenres = await MoviesGenres.findAll();
    res.json({
      message: "All Movies-Genres",
      date: moviesGenres
    });
  } catch (error) {
    console.error("Error fetching movies-genres:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get movies-genres relations by id
router.get("/:id", async (req, res) => {
  try {
    const moviesGenres = await MoviesGenres.findByPk(req.params.id);
    if (!moviesGenres) {
      return res.status(404).json({ error: "Movies-Genres relation not found" });
    }
    res.json(moviesGenres);
  } catch (error) {
    console.error("Error fetching movies-genres relation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;