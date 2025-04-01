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
  },
  { timestamps: false }
);

const MoviesActors = myDB.define(
  "moviesactors",
  {
    id_movie: {
      type: Sequelize.STRING,
      primaryKey: true,
      references: {
        model: Movies,
        key: "id",
      },
    },
    id_actor: {
      type: Sequelize.STRING,
      primaryKey: true,
      references: {
        model: Actors,
        key: "id",
      },
    },
  },
  { timestamps: false }
);

const MoviesGenres = myDB.define(
  "moviesgenres",
  {
    id_movie: {
      type: Sequelize.STRING,
      primaryKey: true,
      references: {
        model: Movies,
        key: "id",
      },
    },
    id_genre: {
      type: Sequelize.STRING,
      primaryKey: true,
      references: {
        model: Genres,
        key: "id",
      },
    },
  },
  { timestamps: false }
);

module.exports = { Actors, Genres, Movies, MoviesActors, MoviesGenres };
