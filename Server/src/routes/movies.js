const express = require("express");
const sequelize = require("sequelize");
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

// get random movie
router.get('/random', async (req, res) => {
  try {
    const randomMovie = await Movies.findOne({
      order: sequelize.literal('RAND()'),
      attributes: ['id', 'title', 'year']
    });
    
    if (!randomMovie) {
      return res.status(404).json({ error: 'No movies found' });
    }
    
    res.json(randomMovie);
  } catch (err) {
    console.error('Error fetching random movie:', err);
    res.status(500).json({ error: 'Failed to fetch random movie' });
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


module.exports = router;