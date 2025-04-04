// index.js - Main JavaScript file for the Movie-Actor Association Game using Konva

// Configuration
const API_BASE_URL = "http://localhost:3000"; // This is correct
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;
const NODE_RADIUS = {
  movie: 40,
  actor: 30
};

// State variables
let movies = [];
let actors = [];
let connections = [];
let selectedMovie = null;
let draggedActor = null;
let availableActors = [];
let score = 0;

// D3 force simulation
let simulation;

// Konva objects
let stage, graphLayer, uiLayer;
let movieCards = new Map(); // Maps movie ID to Konva group
let actorCards = new Map(); // Maps actor ID to Konva group
let connectionLines = new Map(); // Maps connection IDs to Konva line

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  createDomStructure();
  initializeKonvaStage();
  initializeForceSimulation();
  await loadInitialData();
  updateScoreDisplay();
});
function createDomStructure() {
  // Create main container
  const container = document.createElement('div');
  container.className = 'game-container';
  container.style.display = 'flex';
  container.style.height = '100vh';
  
  // Create graph container
  const graphContainer = document.createElement('div');
  graphContainer.id = 'graph-container';
  graphContainer.style.flex = '2';
  graphContainer.style.position = 'relative';
  
  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.style.flex = '1';
  sidebar.style.padding = '20px';
  sidebar.style.borderLeft = '1px solid #ccc';
  sidebar.style.display = 'flex';
  sidebar.style.flexDirection = 'column';
  sidebar.style.overflowY = 'auto';
  
  // Movie info panel
  const movieInfoPanel = document.createElement('div');
  movieInfoPanel.id = 'movie-info-panel';
  movieInfoPanel.className = 'movie-info-panel';
  
  // Actor cards container
  const actorCardsContainer = document.createElement('div');
  actorCardsContainer.id = 'actor-cards-container';
  actorCardsContainer.className = 'actor-cards-container';
  actorCardsContainer.style.marginTop = '20px';
  
  // Score display
  const scoreDisplay = document.createElement('div');
  scoreDisplay.id = 'score-display';
  scoreDisplay.className = 'score-display';
  scoreDisplay.style.marginTop = '20px';
  scoreDisplay.style.fontWeight = 'bold';
  
  // New game button
  const newGameButton = document.createElement('button');
  newGameButton.textContent = 'New Game';
  newGameButton.style.marginTop = '20px';
  newGameButton.style.padding = '10px';
  newGameButton.style.cursor = 'pointer';
  newGameButton.addEventListener('click', startNewGame);
  
  // Add elements to sidebar
  sidebar.appendChild(scoreDisplay);
  sidebar.appendChild(movieInfoPanel);
  sidebar.appendChild(actorCardsContainer);
  sidebar.appendChild(newGameButton);
  
  // Add containers to main container
  container.appendChild(graphContainer);
  container.appendChild(sidebar);
  
  // Add main container to body
  document.body.appendChild(container);
}

function initializeKonvaStage() {
  // Create Konva stage
  stage = new Konva.Stage({
    container: 'graph-container',
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT
  });
  
  // Create layers
  graphLayer = new Konva.Layer(); // For graph nodes and connections
  uiLayer = new Konva.Layer(); // For UI elements like hints, feedback
  
  // Add layers to stage
  stage.add(graphLayer);
  stage.add(uiLayer);
}

function initializeForceSimulation() {
  // Create force simulation
  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(STAGE_WIDTH / 2, STAGE_HEIGHT / 2))
    .on('tick', updateKonvaPositions);
}

// loadInitialData function to fetch 5 random movies
async function loadInitialData() {
  try {
    // Fetch 5 random movies to start
    const randomMovies = await fetchRandomMovies(5);
    if (randomMovies && randomMovies.length > 0) {
      movies = randomMovies;
      
      // Add all movies to the graph
      movies.forEach(movie => {
        addMovieToGraph(movie);
      });
      
      // Set the first movie as selected by default
      setSelectedMovie(movies[0]);
      displayMovieInfo(movies[0]);
    }
    
    // Fetch available actors - ensure it's an array
    try {
      availableActors = await fetchActors();
      // Ensure availableActors is an array
      if (!Array.isArray(availableActors)) {
        console.warn("availableActors is not an array, initializing as empty array");
        availableActors = [];
      }
    } catch (error) {
      console.error("Error fetching actors:", error);
      availableActors = []; // Initialize as empty array on error
    }
    
    // Render 5 random actor cards if we have actors available
    if (availableActors.length > 0) {
      renderRandomActorCards(5);
    } else {
      console.warn("No actors available to display");
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
}

async function fetchRandomMovies(count) {
  try {
    console.log(`Fetching ${count} random movies from ${API_BASE_URL}/movies/random`);
    const movies = [];
    
    // Make multiple calls to get the required number of movies
    for (let i = 0; i < count; i++) {
      const response = await fetch(`${API_BASE_URL}/movies/random`);
      
      if (!response.ok) {
        console.error(`API response error: ${response.status} ${response.statusText}`);
        continue; // Skip this iteration if there's an error
      }
      
      const data = await response.json();
      console.log("API returned movie data:", data);
      
      // Add the movie to our collection if it's valid
      if (data && (Array.isArray(data) ? data.length > 0 : true)) {
        // Handle both array response and single object response
        const movieData = Array.isArray(data) ? data[0] : data;
        
        // Check if we already have this movie (avoid duplicates)
        if (!movies.some(m => m.id === movieData.id)) {
          movies.push(movieData);
        }
      }
    }
    
    // If we couldn't get enough movies, use fallback data
    if (movies.length < count) {
      console.warn(`Only got ${movies.length} movies from API, using some fallback data`);
      const fallbackMovies = getFallbackMovies(count - movies.length);
      return [...movies, ...fallbackMovies];
    }
    
    return movies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return getFallbackMovies(count);
  }
}

function getFallbackMovies(count) {
  console.log("Using fallback movie data");
  const movies = [
    { id: "m1", title: "Inception", poster: "https://via.placeholder.com/300x450", actorIds: ["a1", "a2", "a3"] },
    { id: "m2", title: "The Dark Knight", poster: "https://via.placeholder.com/300x450", actorIds: ["a1", "a4", "a6"] },
    { id: "m3", title: "Interstellar", poster: "https://via.placeholder.com/300x450", actorIds: ["a2", "a5", "a7"] },
    { id: "m4", title: "Pulp Fiction", poster: "https://via.placeholder.com/300x450", actorIds: ["a8", "a9", "a10"] },
    { id: "m5", title: "The Matrix", poster: "https://via.placeholder.com/300x450", actorIds: ["a11", "a12", "a13"] }
  ];
  return movies.slice(0, count);
}

async function fetchActors() {
  try {
    console.log(`Fetching actors from ${API_BASE_URL}/actors`);
    const response = await fetch(`${API_BASE_URL}/actors`);
    
    if (!response.ok) {
      console.error(`API response error: ${response.status} ${response.statusText}`);
      throw new Error('Network response was not ok');
    }
    
    const responseData = await response.json();
    console.log("API returned actor data:", responseData);
    
    // IMPORTANT FIX: Check the actual structure of the response
    if (responseData && responseData.data) {
      // If responseData.data is an array with one element that contains the actors
      if (Array.isArray(responseData.data) && responseData.data.length === 1 && Array.isArray(responseData.data[0])) {
        return responseData.data[0]; // Return the actual actors array
      } 
      // If responseData.data is directly the actors array
      else if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
    }
    
    console.warn("API returned invalid data format:", responseData);
    return getFallbackActors();
  } catch (error) {
    console.error("Error fetching actors:", error);
    return getFallbackActors();
  }
}

function getFallbackActors() {
  console.log("Using fallback actor data");
  return [
    { id: "a1", name: "Leonardo DiCaprio"},
    { id: "a2", name: "Joseph Gordon-Levitt"},
    { id: "a3", name: "Ellen Page"},
    { id: "a4", name: "Brad Pitt"},
    { id: "a5", name: "Emma Stone"},
    { id: "a6", name: "Tom Hardy"},
    { id: "a7", name: "Matthew McConaughey"},
    { id: "a8", name: "Samuel L. Jackson"},
    { id: "a9", name: "John Travolta"},
    { id: "a10", name: "Uma Thurman"},
    { id: "a11", name: "Keanu Reeves"},
    { id: "a12", name: "Laurence Fishburne"},
    { id: "a13", name: "Carrie-Anne Moss"}
  ];
}

async function checkActorInMovie(actorId, movieId) {
  try {
    // Fix the endpoint URL - use id_actor instead of actorId
    const response = await fetch(`${API_BASE_URL}/moviesactors/actor/${actorId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    // Get the list of movies this actor has been in
    const actorMovies = await response.json();
    
    // Check if the movieId is in the list of the actor's movies
    return actorMovies.some(movie => movie.id === movieId);
  } catch (error) {
    console.error("Error checking actor in movie:", error);
    
    // Safer fallback that doesn't assume actorIds exists
    const movie = movies.find(m => m.id === movieId);
    return movie?.actorIds ? movie.actorIds.includes(actorId) : false;
  }
}

async function checkMovieHasActor(movieId, actorId) {
  try {
    // Fix the endpoint URL - use id_movie instead of movieId
    const response = await fetch(`${API_BASE_URL}/moviesactors/movie/${movieId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    // Get the list of actors in this movie
    const movieActors = await response.json();
    
    // Check if the actorId is in the list of the movie's actors
    return movieActors.some(actor => actor.id === actorId);
  } catch (error) {
    console.error("Error checking movie has actor:", error);
    
    // Fallback for testing
    const movie = movies.find(m => m.id === movieId);
    return movie?.actorIds ? movie.actorIds.includes(actorId) : false;
  }
}

function renderActorCards() {
  // Call the new function with 5 cards
  renderRandomActorCards(5);
}

function renderRandomActorCards(count) {
  const container = document.getElementById('actor-cards-container');
  if (!container) {
    console.error("Actor cards container not found");
    return;
  }
  
  container.innerHTML = '';
  
  // Create header
  const header = document.createElement('h3');
  header.textContent = 'Available Actors';
  container.appendChild(header);
  
  // Debug availableActors
  console.log("Available actors:", availableActors);
  
  // Create Konva stage for actor cards
  const cardStage = new Konva.Stage({
    container: container,
    width: 250,
    height: count * 70
  });
  
  const cardLayer = new Konva.Layer();
  cardStage.add(cardLayer);
  
  // Ensure availableActors is an array before filtering
  if (!Array.isArray(availableActors)) {
    console.error("availableActors is not an array");
    return;
  }
  
  // Filter out actors already in the graph
  // Also filter out invalid actors without id or name
  const unusedActors = availableActors.filter(actor => 
    actor && actor.id && actor.name && !actors.some(a => a.id === actor.id)
  );
  
  console.log(`Filtered down to ${unusedActors.length} unused actors`);
  
  // If no valid actors available, show a message
  if (unusedActors.length === 0) {
    const noActorsMsg = document.createElement('p');
    noActorsMsg.textContent = 'No actors available';
    container.appendChild(noActorsMsg);
    return;
  }
  
  // Randomly select actors
  const shuffledActors = shuffleArray([...unusedActors]);
  const selectedActors = shuffledActors.slice(0, Math.min(count, shuffledActors.length));
  
  console.log(`Selected ${selectedActors.length} actors for display`);
  
  // Create actor cards
  selectedActors.forEach((actor, index) => {
    createKonvaActorCard(actor, index, cardLayer);
  });
  
  cardLayer.draw();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createKonvaActorCard(actor, index, layer) {
  // Debug logging
  console.log("Creating actor card with data:", actor);
  
  // Safeguard against invalid actor data
  if (!actor || !actor.id || !actor.name) {
    console.error("Invalid actor data:", actor);
    return; // Skip this actor
  }
  
  const y = index * 70 + 10;
  
  // Create card group
  const cardGroup = new Konva.Group({
    x: 10,
    y: y,
    width: 230,
    height: 60,
    draggable: true
  });
  
  // Card background
  const cardBg = new Konva.Rect({
    width: 230,
    height: 60,
    fill: 'white',
    stroke: '#ddd',
    strokeWidth: 1,
    cornerRadius: 5,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowBlur: 5,
    shadowOffset: { x: 0, y: 2 },
    shadowOpacity: 0.3
  });
  
  // Add avatar circle
  const avatarCircle = new Konva.Circle({
    x: 30,
    y: 30,
    radius: 20,
    fill: '#ff7f0e'
  });
  
  // Actor name - ensure we have a name
  const nameText = new Konva.Text({
    x: 65,
    y: 20,
    text: actor.name || "Unknown Actor",
    fontSize: 16,
    fontFamily: 'Arial',
    fill: '#333',
    width: 155
  });
  
  // Store actor data with the group
  cardGroup.actor = actor;
  
  // Add shapes to group
  cardGroup.add(cardBg);
  cardGroup.add(avatarCircle);
  cardGroup.add(nameText);
  
  // Add drag events
  cardGroup.on('dragstart', function() {
    draggedActor = actor;
    this.moveTo(uiLayer); // This won't work across stages - needs fixing
    
    // Store original position for returning if drag is cancelled
    this.originalX = this.x();
    this.originalY = this.y();
    
    // console.log("Started dragging actor:", actor.name);
  });
  
  cardGroup.on('dragmove', function() {
    // Copy to cursor in main stage when dragging
    const mousePos = stage.getPointerPosition();
    if (mousePos) {
      // console.log("Dragging at position:", mousePos);
    }
  });
  
  cardGroup.on('dragend', function() {
    // console.log("Drag ended for actor:", actor.name);
    
    // Get cursor position relative to main stage
    const stageContainer = stage.container();
    const stageRect = stageContainer.getBoundingClientRect();
    const globalMousePos = {
      x: window.event.clientX,
      y: window.event.clientY
    };
    
    // Convert to stage coordinates
    const stagePos = {
      x: globalMousePos.x - stageRect.left,
      y: globalMousePos.y - stageRect.top
    };
    
    console.log("Dropped at stage pos:", stagePos);
    
    // Check if dropped over the graph
    if (stagePos.x >= 0 && stagePos.x <= STAGE_WIDTH &&
        stagePos.y >= 0 && stagePos.y <= STAGE_HEIGHT &&
        selectedMovie) {
      
      // Continue with your validation logic
      checkActorInMovie(actor.id, selectedMovie.id).then(isValid => {
        if (isValid) {
          // Add actor to graph and update score
          addActorToGraph(actor);
          connections.push({ source: selectedMovie.id, target: actor.id });
          score += 10;
          updateScoreDisplay();
          showFeedback(true, `${actor.name} added to ${selectedMovie.title}`);
        } else {
          // Show feedback for incorrect association
          showFeedback(false, `${actor.name} is not in ${selectedMovie.title}`);
          addNewRandomActorCard(layer); // Add a new random actor card

        }
        
        // Remove card from UI layer
        this.destroy();
        layer.draw();
      });
    } else {
      // Return card to original position
      this.position({
        x: this.originalX,
        y: this.originalY
      });
      
      console.log("Card returned to original position");
      layer.draw();
    }
    
    draggedActor = null;
  });
  
  layer.add(cardGroup);
  return cardGroup;
}

function addNewRandomActorCard(layer) {
  // Filter out actors already in the graph
  const unusedActors = availableActors.filter(actor => 
    !actors.some(a => a.id === actor.id)
  );
  
  if (unusedActors.length > 0) {
    // Randomly select an actor
    const randomIndex = Math.floor(Math.random() * unusedActors.length);
    const newActor = unusedActors[randomIndex];
    
    // Get existing cards count to determine position
    const existingCards = layer.children.filter(child => child.className === 'Group');
    const index = existingCards.length;
    
    // Create and add new card
    createKonvaActorCard(newActor, index, layer);
    layer.draw();
  }
}

function showFeedback(isCorrect, message) {
  // Create feedback text
  const feedbackText = new Konva.Text({
    x: STAGE_WIDTH / 2,
    y: 20,
    text: message || (isCorrect ? 'Correct!' : 'Wrong actor!'),
    fontSize: 24,
    fontFamily: 'Arial',
    fill: isCorrect ? '#28a745' : '#dc3545',
    align: 'center',
    width: 200,
    offsetX: 100
  });
  
  // Add to UI layer
  uiLayer.add(feedbackText);
  uiLayer.draw();
  
  // Animate
  feedbackText.to({
    opacity: 0,
    duration: 1,
    onFinish: function() {
      feedbackText.destroy();
      uiLayer.draw();
    }
  });
}

function addMovieToGraph(movie) {
  // Create movie node group
  const movieGroup = new Konva.Group({
    x: STAGE_WIDTH / 2,
    y: STAGE_HEIGHT / 2,
    id: movie.id,
    draggable: true
  });
  
  // Add movie node circle
  const movieCircle = new Konva.Circle({
    radius: NODE_RADIUS.movie,
    fill: '#69b3a2',
    stroke: 'white',
    strokeWidth: 2
  });
  
  // Add movie title text
  const movieTitle = new Konva.Text({
    text: movie.title.length > 10 ? movie.title.substring(0, 10) + '...' : movie.title,
    fontSize: 12,
    fontFamily: 'Arial',
    fill: 'white',
    align: 'center',
    width: NODE_RADIUS.movie * 2,
    x: -NODE_RADIUS.movie,
    y: -6
  });
  
  // Add to group
  movieGroup.add(movieCircle);
  movieGroup.add(movieTitle);
  
  // Add click event
  movieGroup.on('click', () => {
    setSelectedMovie(movie);
  });
  
  // Add drag events for simulation
  movieGroup.on('dragstart', function() {
    if (simulation) {
      // Get the movie node from simulation
      const node = simulation.nodes().find(n => n.id === movie.id);
      if (node) {
        node.fx = node.x;
        node.fy = node.y;
      }
    }
  });
  
  movieGroup.on('dragmove', function() {
    if (simulation) {
      // Get the movie node from simulation
      const node = simulation.nodes().find(n => n.id === movie.id);
      if (node) {
        node.fx = this.x();
        node.fy = this.y();
        simulation.alpha(0.3).restart();
      }
    }
  });
  
  movieGroup.on('dragend', function() {
    if (simulation) {
      // Get the movie node from simulation
      const node = simulation.nodes().find(n => n.id === movie.id);
      if (node) {
        node.fx = null;
        node.fy = null;
        simulation.alpha(0.3).restart();
      }
    }
  });
  
  // Store movieGroup in map
  movieCards.set(movie.id, movieGroup);
  
  // Add to graph layer
  graphLayer.add(movieGroup);
  graphLayer.draw();
  
  // Add to simulation
  updateSimulation();
}

function addActorToGraph(actor) {
  // Create actor node group
  const actorGroup = new Konva.Group({
    x: STAGE_WIDTH / 2, // Will be updated by simulation
    y: STAGE_HEIGHT / 2, // Will be updated by simulation
    id: actor.id,
    draggable: true
  });
  
  // Add actor node circle
  const actorCircle = new Konva.Circle({
    radius: NODE_RADIUS.actor,
    fill: '#ff7f0e',
    stroke: 'white',
    strokeWidth: 2
  });
  
  // Add actor name text
  const actorName = new Konva.Text({
    text: actor.name.length > 10 ? actor.name.substring(0, 10) + '...' : actor.name,
    fontSize: 12,
    fontFamily: 'Arial',
    fill: 'white',
    align: 'center',
    width: NODE_RADIUS.actor * 2,
    x: -NODE_RADIUS.actor,
    y: -6
  });
  
  // Add to group
  actorGroup.add(actorCircle);
  actorGroup.add(actorName);
  
  // Add drag events for simulation
  actorGroup.on('dragstart', function() {
    if (simulation) {
      // Get the actor node from simulation
      const node = simulation.nodes().find(n => n.id === actor.id);
      if (node) {
        node.fx = node.x;
        node.fy = node.y;
      }
    }
  });
  
  actorGroup.on('dragmove', function() {
    if (simulation) {
      // Get the actor node from simulation
      const node = simulation.nodes().find(n => n.id === actor.id);
      if (node) {
        node.fx = this.x();
        node.fy = this.y();
        simulation.alpha(0.3).restart();
      }
    }
  });
  
  actorGroup.on('dragend', function() {
    if (simulation) {
      // Get the actor node from simulation
      const node = simulation.nodes().find(n => n.id === actor.id);
      if (node) {
        node.fx = null;
        node.fy = null;
        simulation.alpha(0.3).restart();
      }
    }
  });
  
  // Store actorGroup in map
  actorCards.set(actor.id, actorGroup);
  
  // Add to graph layer
  graphLayer.add(actorGroup);
  graphLayer.draw();
}

function addConnection(source, target) {
  // Create connection line
  const line = new Konva.Line({
    points: [0, 0, 0, 0], // Will be updated by simulation
    stroke: '#999',
    strokeWidth: 2,
    opacity: 0.6
  });
  
  // Store connection
  const connectionId = `${source}-${target}`;
  connectionLines.set(connectionId, line);
  
  // Add to graph layer (below nodes)
  graphLayer.add(line);
  line.moveToBottom();
  graphLayer.draw();
}

function updateSimulation() {
  // Prepare data for simulation
  const nodes = [
    ...movies.map(m => ({ ...m, type: 'movie' })),
    ...actors.map(a => ({ ...a, type: 'actor' }))
  ];
  
  const links = connections.map(c => ({
    source: c.source,
    target: c.target
  }));
  
  // Create any missing actor nodes in the graph
  actors.forEach(actor => {
    if (!actorCards.has(actor.id)) {
      addActorToGraph(actor);
    }
  });
  
  // Create any missing connections in the graph
  connections.forEach(conn => {
    const connectionId = `${conn.source}-${conn.target}`;
    if (!connectionLines.has(connectionId)) {
      addConnection(conn.source, conn.target);
    }
  });
  
  // Update simulation
  simulation.nodes(nodes);
  simulation.force('link').links(links);
  simulation.alpha(1).restart();
}

function updateKonvaPositions() {
  // Get simulation nodes
  const nodes = simulation.nodes();
  
  // Update movie positions
  movies.forEach(movie => {
    const node = nodes.find(n => n.id === movie.id);
    const movieGroup = movieCards.get(movie.id);
    
    if (node && movieGroup) {
      movieGroup.position({
        x: node.x,
        y: node.y
      });
    }
  });
  
  // Update actor positions
  actors.forEach(actor => {
    const node = nodes.find(n => n.id === actor.id);
    const actorGroup = actorCards.get(actor.id);
    
    if (node && actorGroup) {
      actorGroup.position({
        x: node.x,
        y: node.y
      });
    }
  });
  
  // Update connection lines
  connections.forEach(conn => {
    const sourceNode = nodes.find(n => n.id === conn.source);
    const targetNode = nodes.find(n => n.id === conn.target);
    const line = connectionLines.get(`${conn.source}-${conn.target}`);
    
    if (sourceNode && targetNode && line) {
      line.points([sourceNode.x, sourceNode.y, targetNode.x, targetNode.y]);
    }
  });
  
  // Redraw the layer with updated positions
  graphLayer.draw();
}

function displayMovieInfo(movie) {
  const container = document.getElementById('movie-info-panel');
  container.innerHTML = '';
  
  const header = document.createElement('h2');
  header.textContent = movie.title;
  
  const poster = document.createElement('img');
  poster.src = movie.poster;
  poster.alt = movie.title;
  poster.style.width = '100%';
  poster.style.marginTop = '10px';
  poster.style.cursor = 'pointer';
  
  poster.addEventListener('click', () => {
    setSelectedMovie(movie);
  });
  
  container.appendChild(header);
  container.appendChild(poster);
}

function setSelectedMovie(movie) {
  selectedMovie = movie;
  
  // Highlight selected movie in graph
  movies.forEach(m => {
    const movieGroup = movieCards.get(m.id);
    if (movieGroup) {
      const circle = movieGroup.findOne('Circle');
      if (circle) {
        circle.stroke(m.id === movie.id ? '#ff0000' : '#fff');
        circle.strokeWidth(m.id === movie.id ? 3 : 2);
      }
    }
  });
  
  graphLayer.draw();
}

function showFeedback(isCorrect) {
  // Create feedback text
  const feedbackText = new Konva.Text({
    x: STAGE_WIDTH / 2,
    y: 20,
    text: isCorrect ? 'Correct!' : 'Wrong actor!',
    fontSize: 24,
    fontFamily: 'Arial',
    fill: isCorrect ? '#28a745' : '#dc3545',
    align: 'center',
    width: 200,
    offsetX: 100
  });
  
  // Add to UI layer
  uiLayer.add(feedbackText);
  uiLayer.draw();
  
  // Animate
  feedbackText.to({
    opacity: 0,
    duration: 1,
    onFinish: function() {
      feedbackText.destroy();
      uiLayer.draw();
    }
  });
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('score-display');
  scoreDisplay.textContent = `Score: ${score}`;
}

async function startNewGame() {
  // Reset state
  connections = [];
  actors = [];
  selectedMovie = null;
  score = 0;
  
  // Clear maps
  movieCards.forEach(card => card.destroy());
  movieCards.clear();
  actorCards.forEach(card => card.destroy());
  actorCards.clear();
  connectionLines.forEach(line => line.destroy());
  connectionLines.clear();
  
  // Clear layers
  graphLayer.destroyChildren();
  graphLayer.draw();
  
  // Load initial data again
  await loadInitialData();
  updateScoreDisplay();
}