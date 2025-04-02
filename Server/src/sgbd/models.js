const {DataTypes} = require("sequelize");
const myDB = require("./config");

const Actors = myDB.define(
  "actors",
  {
    id: {
      type: DataTypes.STRING,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

const Genres = myDB.define(
  "genres",
  {
    id: {
      type: DataTypes.STRING,
      autoIncrement: true,
      primaryKey: true,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

const Movies = myDB.define(
  "movies",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  { timestamps: false }
);

const MoviesActors = myDB.define(
  "moviesactors",
  {
    id_movie: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: Movies,
        key: "id",
      },
    },
    id_actor: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: Movies,
        key: "id",
      },
    },
    id_genre: {
      type: DataTypes.STRING,
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
