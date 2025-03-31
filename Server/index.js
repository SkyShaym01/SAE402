require("dotenv").config();

const express = require("express");
var cors = require('cors');
const myDB = require("./src/sgbd/config.js");
require("./src/sgbd/models.js");

const routerPlayers = require("./src/routes/player.js");
const routerChampionships = require("./src/routes/championship");
const routerWins = require("./src/routes/win");
const routerPlays = require("./src/routes/plays");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.use("/players", routerPlayers); //a changer


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
