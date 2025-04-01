require("dotenv").config();

const express = require("express");
var cors = require('cors');
const myDB = require("./src/sgbd/config.js");
require("./src/sgbd/models.js");

const routerActors = require("./src/routes/actors.js");
const routerMovies = require("./src/routes/movies.js");
const routerGenres = require("./src/routes/genres.js");
const routerMoviesActors = require("./src/routes/moviesactors.js");
const routerMoviesGenres = require("./src/routes/moviesgenres.js");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.use("/actors", routerActors);
app.use("/movies", routerMovies);
app.use("/genres", routerGenres);
app.use("/moviesactors", routerMoviesActors);
app.use("/moviesgenres", routerMoviesActors);

const PORT = process.env.PORT || 3000;

app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80')
})

myDB
  .sync({ alter: false, logging: false })
  .then(() => {
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server run on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to synchronize database:", error);
  });
