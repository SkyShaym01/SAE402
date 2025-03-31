// src/sgbd/models.js
const Sequelize = require("sequelize");
const myDB = require("./config");

const Actors = myDB.define(
  "actors",
  {
    id: {
      type: Sequelize.STRING,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

const Genres = myDB.define(
  "genres",
  {
    id: {
      type: Sequelize.STRING,
      autoIncrement: true,
      primaryKey: true,
    },
    genre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

const Movies = myDB.define(
  "movies",
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    year: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: false }
);

const MoviesActors = myDB.define(
  "win",
  {
    championship_id: {
      type: Sequelize.STRING,
      primaryKey: true,
      references: {
        model: Championship,
        key: "id",
      },
    },
    winner_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: {
        model: Player,
        key: "id",
      },
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: false }
);

module.exports = { Player, Championship, Play, Win };
