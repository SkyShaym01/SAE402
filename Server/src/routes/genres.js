const express = require("express");
const sequelize = require("sequelize");
const router = express.Router();
const { Genres } = require("../sgbd/models.js");

// get all genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genres.findAll();
    res.json({
      message: "All Genres",
      date: genres
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get genre by id
router.get("/:id", async (req, res) => {
  try {
    const genre = await Genres.findByPk(req.params.id);
    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }
    res.json(genre);
  } catch (error) {
    console.error("Error fetching genre:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;