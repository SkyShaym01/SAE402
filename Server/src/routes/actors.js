const express = require("express");
const sequelize = require("sequelize");
const router = express.Router();
const { Actors } = require("../sgbd/models.js");

// get all actor
router.get("/", async (req, res) => {
  try {
    const actors = await Actors.findAll();
    res.json({
      message: "All Actors",
      date: actors,
    });
  } catch (error) {
    console.error("Error fetching actors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/random', async (req, res) => {
  try {
      const randomActor = await Actors.findOne({
          order: sequelize.literal('RAND()'),
          attributes: ['id', 'name']
      });
      
      if (!randomActor) {
          return res.status(404).json({ error: 'No actors found' });
      }
      
      res.json(randomActor);
  } catch (err) {
      console.error('Error fetching random actor:', err);
      res.status(500).json({ error: 'Failed to fetch random actor' });
  }
});

// get actor by id
router.get("/:id", async (req, res) => {
  try {
    const actor = await Actors.findByPk(req.params.id);
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
