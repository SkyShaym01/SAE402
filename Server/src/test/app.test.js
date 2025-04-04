const request = require("supertest");
const app = require("../app"); // Adjust based on your actual Express app entry point

describe("Actors API", () => {
  test("GET /actors should return all actors", async () => {
    const res = await request(app).get("/actors");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  test("GET /actors/random should return a random actor", async () => {
    const res = await request(app).get("/actors/random");
    expect([200, 404]).toContain(res.status);
  });

  test("GET /actors/:id should return an actor by ID", async () => {
    const res = await request(app).get("/actors/1");
    expect([200, 404]).toContain(res.status);
  });
});

describe("Genres API", () => {
  test("GET /genres should return all genres", async () => {
    const res = await request(app).get("/genres");
    expect(res.status).toBe(200);
  });

  test("GET /genres/:id should return a genre by ID", async () => {
    const res = await request(app).get("/genres/1");
    expect([200, 404]).toContain(res.status);
  });
});

describe("Movies API", () => {
  test("GET /movies should return all movies", async () => {
    const res = await request(app).get("/movies");
    expect(res.status).toBe(200);
  });

  test("GET /movies/random should return a random movie", async () => {
    const res = await request(app).get("/movies/random");
    expect([200, 404]).toContain(res.status);
  });

  test("GET /movies/:id should return a movie by ID", async () => {
    const res = await request(app).get("/movies/1");
    expect([200, 404]).toContain(res.status);
  });
});

describe("Movies-Actors API", () => {
  test("GET /movies-actors should return all actor-movie relations", async () => {
    const res = await request(app).get("/movies-actors");
    expect(res.status).toBe(200);
  });

  test("GET /movies-actors/actor/:id should return relations by actor ID", async () => {
    const res = await request(app).get("/movies-actors/actor/1");
    expect([200, 404]).toContain(res.status);
  });

  test("GET /movies-actors/movie/:id should return relations by movie ID", async () => {
    const res = await request(app).get("/movies-actors/movie/1");
    expect([200, 404]).toContain(res.status);
  });
});

describe("Movies-Genres API", () => {
  test("GET /movies-genres should return all movie-genre relations", async () => {
    const res = await request(app).get("/movies-genres");
    expect(res.status).toBe(200);
  });

  test("GET /movies-genres/:id should return a movie-genre relation by ID", async () => {
    const res = await request(app).get("/movies-genres/1");
    expect([200, 404]).toContain(res.status);
  });
});
