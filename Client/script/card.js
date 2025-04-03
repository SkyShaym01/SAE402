var width = window.innerWidth;
var height = window.innerHeight;

let cards = [];
let stage, layer;

// Initialize Konva stage and layer in a function that runs when your page loads
function initializeCanvas() {
    stage = new Konva.Stage({
      container: 'container', // this should be the ID of your container div
      width: window.innerWidth,
      height: window.innerHeight,
    });
    
    layer = new Konva.Layer();
    stage.add(layer);
  }
  
  // Call this when your page loads
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    initializeCanvas();
  });

function generateMovieCards() {
//   console.log("Generating cards...");
  for (let i = 0; i < 1; i++) {
    const options = { method: "GET", headers: { "User-Agent": "insomnia/11.0.1" } };
    fetch("http://localhost:3000/movies/random", options)
    .then((data) => data.json())
    .then((data) => {
      console.log(data);
      createCard(500, 500, data);
    })
  }
  layer.draw();
}

function generateActorCards() {
  console.log("Generating cards...");
  for (let i = 0; i < 1; i++) {
    const options = { method: "GET", headers: { "User-Agent": "insomnia/11.0.1" } };
    fetch("http://localhost:3000/actors/random", options)
    .then((data) => data.json())
    .then((data) => {
      console.log(data);
      createCard(100, 100, data);
    })
  }
  layer.draw();
}

function createCard(x, y, data) {
  console.log("Creating card...");
  let group = new Konva.Group({
    x: x,
    y: y,
    draggable: true,
    id: `card-${data.id}`,
  });

  let rect = new Konva.Rect({
    width: 200,
    height: 120,
    fill: "white",
    stroke: "black",
    strokeWidth: 2,
    cornerRadius: 10,
  });

  let text = new Konva.Text({
    text: `${data.name||data.title}`,
    fontSize: 20,
    fontFamily: "Arial",
    fill: "black",
    width: 200,
    align: "center",
    y: 15,
  });
  console.log(text);

  group.add(rect);
  group.add(text);
  layer.add(group);
  cards.push(group);

  group.on("dragend", function () {
    checkForRemoval(group);
  });
}

function checkForRemoval(group) {
  if (group.x() > width || group.y() > height) {
    removeCard(group);
  }
}

function removeCard(group) {
  let index = cards.indexOf(group);
  if (index > -1) {
    cards.splice(index, 1);
  }
  group.destroy();
  layer.batchDraw();
}

function removeAllCards() {
  cards.forEach((card) => {
    card.destroy();
  });
  cards = [];
  layer.batchDraw();
}
