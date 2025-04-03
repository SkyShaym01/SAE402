// index.js - Main JavaScript file for the Movie-Actor Association Game

// Configuration
const API_BASE_URL = "http://localhost:3000"; // Replace with your actual API base URL
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
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

// DOM Elements
let svg, simulation, movieInfoPanel, actorCardsContainer, scoreDisplay;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});

async function initializeGame() {
  createDomStructure();
  initializeForceGraph();
  await loadInitialData();
  renderActorCards();
  updateScoreDisplay();
}

function createDomStructure() {
  // Create main container
  const container = document.createElement('div');
  container.className = 'game-container';
  container.style.display = 'flex';
  container.style.height = '100vh';
  
  // Create graph container
  const graphContainer = document.createElement('div');
  graphContainer.className = 'graph-container';
  graphContainer.style.flex = '2';
  graphContainer.style.position = 'relative';
  
  // Create SVG element
  svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', SVG_WIDTH);
  svg.setAttribute('height', SVG_HEIGHT);
  svg.style.border = '1px solid #ccc';
  graphContainer.appendChild(svg);
  
  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.style.flex = '1';
  sidebar.style.padding = '20px';
  sidebar.style.borderLeft = '1px solid #ccc';
  sidebar.style.display = 'flex';
  sidebar.style.flexDirection = 'column';
  
  // Movie info panel
  movieInfoPanel = document.createElement('div');
  movieInfoPanel.className = 'movie-info-panel';
  
  // Actor cards container
  actorCardsContainer = document.createElement('div');
  actorCardsContainer.className = 'actor-cards-container';
  actorCardsContainer.style.marginTop = '20px';
  
  // Score display
  scoreDisplay = document.createElement('div');
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
  
  // Create drop zone
  const dropZone = document.createElement('div');
  dropZone.className = 'drop-zone';
  dropZone.style.position = 'absolute';
  dropZone.style.width = '100%';
  dropZone.style.height = '100%';
  dropZone.style.top = '0';
  dropZone.style.left = '0';
  dropZone.style.pointerEvents = 'none';
  graphContainer.appendChild(dropZone);
}

function initializeForceGraph() {
  // Create force simulation
  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(SVG_WIDTH / 2, SVG_HEIGHT / 2))
    .on('tick', tickSimulation);
  
  // Create link and node groups
  const linksGroup = d3.select(svg).append('g').attr('class', 'links');
  const nodesGroup = d3.select(svg).append('g').attr('class', 'nodes');
}

async function loadInitialData() {
  try {
    // Fetch random movie to start
    const randomMovie = await fetchRandomMovie();
    if (randomMovie) {
      movies = [randomMovie];
      updateGraph();
      displayMovieInfo(randomMovie);
    }
    
    // Fetch available actors
    availableActors = await fetchActors();
  } catch (error) {
    console.error("Error loading initial data:", error);
  }
}

async function fetchRandomMovie() {
  try {
    const response = await fetch(`${API_BASE_URL}/movie/random`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error fetching movie:", error);
    // Fallback for testing
    return { 
      id: "m1", 
      title: "Inception", 
      poster: "https://via.placeholder.com/300x450",
      actorIds: ["a1", "a2", "a3"] 
    };
  }
}

async function fetchActors() {
  try {
    const response = await fetch(`${API_BASE_URL}/actors`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Error fetching actors:", error);
    // Fallback for testing
    return [
      { id: "a1", name: "Leonardo DiCaprio", image: "https://via.placeholder.com/100x100" },
      { id: "a2", name: "Joseph Gordon-Levitt", image: "https://via.placeholder.com/100x100" },
      { id: "a3", name: "Ellen Page", image: "https://via.placeholder.com/100x100" },
      { id: "a4", name: "Brad Pitt", image: "https://via.placeholder.com/100x100" },
      { id: "a5", name: "Emma Stone", image: "https://via.placeholder.com/100x100" }
    ];
  }
}

async function checkActorInMovie(actorId, movieId) {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/actors/${actorId}`);
    return response.ok;
  } catch (error) {
    console.error("Error checking actor in movie:", error);
    
    // Fallback for testing
    const movie = movies.find(m => m.id === movieId);
    return movie?.actorIds.includes(actorId);
  }
}

function renderActorCards() {
  // Clear container
  actorCardsContainer.innerHTML = '';
  
  // Create header
  const header = document.createElement('h3');
  header.textContent = 'Available Actors';
  actorCardsContainer.appendChild(header);
  
  // Create actor cards
  availableActors.forEach(actor => {
    if (!actors.some(a => a.id === actor.id)) {
      const card = createActorCard(actor);
      actorCardsContainer.appendChild(card);
    }
  });
}

function createActorCard(actor) {
  const card = document.createElement('div');
  card.className = 'actor-card';
  card.dataset.id = actor.id;
  card.style.padding = '10px';
  card.style.margin = '5px 0';
  card.style.border = '1px solid #ddd';
  card.style.borderRadius = '5px';
  card.style.cursor = 'grab';
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  
  // Actor image
  const img = document.createElement('img');
  img.src = actor.image;
  img.alt = actor.name;
  img.width = 40;
  img.height = 40;
  img.style.borderRadius = '50%';
  img.style.marginRight = '10px';
  
  // Actor name
  const name = document.createElement('span');
  name.textContent = actor.name;
  
  card.appendChild(img);
  card.appendChild(name);
  
  // Add drag events
  card.addEventListener('dragstart', (event) => {
    draggedActor = actor;
    event.dataTransfer.setData('text/plain', actor.id);
    card.style.opacity = '0.5';
  });
  
  card.addEventListener('dragend', () => {
    card.style.opacity = '1';
    draggedActor = null;
  });
  
  card.setAttribute('draggable', true);
  
  return card;
}

function displayMovieInfo(movie) {
  movieInfoPanel.innerHTML = '';
  
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
  
  movieInfoPanel.appendChild(header);
  movieInfoPanel.appendChild(poster);
}

function setSelectedMovie(movie) {
  selectedMovie = movie;
  
  // Highlight selected movie in graph
  d3.select(svg).selectAll('.node')
    .filter(d => d.type === 'movie')
    .attr('stroke', d => d.id === movie.id ? '#ff0000' : '#fff')
    .attr('stroke-width', d => d.id === movie.id ? 3 : 1);
  
  // Enable drop on SVG
  svg.style.pointerEvents = 'auto';
  svg.addEventListener('dragover', handleDragOver);
  svg.addEventListener('drop', handleDrop);
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

async function handleDrop(event) {
  event.preventDefault();
  
  if (!draggedActor || !selectedMovie) return;
  
  const actorId = draggedActor.id;
  const movieId = selectedMovie.id;
  
  // Check if actor is in the movie
  const isValid = await checkActorInMovie(actorId, movieId);
  
  if (isValid) {
    // Add actor to graph
    actors.push(draggedActor);
    
    // Add connection
    connections.push({
      source: actorId,
      target: movieId
    });
    
    // Update score
    score += 10;
    updateScoreDisplay();
    
    // Update graph
    updateGraph();
    
    // Update actor cards
    renderActorCards();
  } else {
    // Show incorrect feedback
    showFeedback(false);
  }
}

function showFeedback(isCorrect) {
  const feedback = document.createElement('div');
  feedback.className = 'feedback';
  feedback.textContent = isCorrect ? 'Correct!' : 'Wrong actor!';
  feedback.style.position = 'absolute';
  feedback.style.top = '20px';
  feedback.style.left = '50%';
  feedback.style.transform = 'translateX(-50%)';
  feedback.style.padding = '10px 20px';
  feedback.style.borderRadius = '5px';
  feedback.style.color = 'white';
  feedback.style.backgroundColor = isCorrect ? '#28a745' : '#dc3545';
  feedback.style.zIndex = '1000';
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateGraph() {
  // Prepare data
  const nodes = [
    ...movies.map(m => ({ ...m, type: 'movie' })),
    ...actors.map(a => ({ ...a, type: 'actor' }))
  ];
  
  const links = connections.map(c => ({
    source: c.source,
    target: c.target
  }));
  
  // Update force simulation
  simulation.nodes(nodes);
  simulation.force('link').links(links);
  
  // Update links
  const link = d3.select(svg).select('.links')
    .selectAll('.link')
    .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
  
  link.exit().remove();
  
  const linkEnter = link.enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2);
  
  // Update nodes
  const node = d3.select(svg).select('.nodes')
    .selectAll('.node')
    .data(nodes, d => d.id);
  
  node.exit().remove();
  
  const nodeEnter = node.enter()
    .append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));
  
  nodeEnter.append('circle')
    .attr('r', d => d.type === 'movie' ? NODE_RADIUS.movie : NODE_RADIUS.actor)
    .attr('fill', d => d.type === 'movie' ? '#69b3a2' : '#ff7f0e')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5);
  
  nodeEnter.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .text(d => d.type === 'movie' ? (d.title.length > 10 ? d.title.substring(0, 10) + '...' : d.title) : 
                             (d.name.length > 10 ? d.name.substring(0, 10) + '...' : d.name))
    .attr('fill', '#fff');
  
  // Add click event to movie nodes
  nodeEnter.filter(d => d.type === 'movie')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      displayMovieInfo(d);
      setSelectedMovie(d);
    });
  
  // Tooltip for full names on hover
  nodeEnter.append('title')
    .text(d => d.type === 'movie' ? d.title : d.name);
  
  // Restart simulation
  simulation.alpha(1).restart();
}

function tickSimulation() {
  d3.select(svg).selectAll('.link')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);
  
  d3.select(svg).selectAll('.node')
    .attr('transform', d => `translate(${d.x},${d.y})`);
}

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

async function startNewGame() {
  // Reset state
  connections = [];
  actors = [];
  selectedMovie = null;
  
  // Get new random movie
  const randomMovie = await fetchRandomMovie();
  if (randomMovie) {
    movies = [randomMovie];
    displayMovieInfo(randomMovie);
    updateGraph();
    renderActorCards();
  }
}