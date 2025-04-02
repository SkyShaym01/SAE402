const express = require("express");
const sequelize = require("sequelize");
const router = express.Router();
const { MoviesActors } = require("../sgbd/models.js");

// get all actor-movies relations
router.get("/", async (req, res) => {
  try {
    const actors = await MoviesActors.findAll();
    res.json({
      message: "All Actors",
      date: actors
    });
  } catch (error) {
    console.error("Error fetching actors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get actor-movies relation by id
router.get("/:id", async (req, res) => {
  try {
    const actor = await MoviesActors.findByPk(req.params.id);
    if (!actor) {
      return res.status(404).json({ error: "Actor not found" });
    }
    res.json(actor);
  } catch (error) {
    console.error("Error fetching actor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;