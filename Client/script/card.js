var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
container: 'container',
width: width,
height: height
});

var layer = new Konva.Layer();
stage.add(layer);

  let cards = [];

  function generateCards() {
    console.log("Generating cards...");
      for (let i = 0; i < 1 ; i++) {
          createCard(Math.random() * (width - 100), Math.random() * (height - 150), i);
        }
        layer.draw();
  }

  function createCard(x, y, id) {
      let group = new Konva.Group({
          x: x,
          y: y,
          draggable: true,
          id: `card-${id}`
      });

      let rect = new Konva.Rect({
          width: 100,
          height: 150,
          fill: 'white',
          stroke: 'black',
          strokeWidth: 2,
          cornerRadius: 10
      });

      let text = new Konva.Text({
          text: `Card ${id}`,
          fontSize: 20,
          fontFamily: 'Arial',
          fill: 'black',
          width: 100,
          align: 'center',
          y: 60
      });

      group.add(rect);
      group.add(text);
      layer.add(group);
      cards.push(group);

      group.on('dragend', function () {
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
        cards.forEach(card => {
            card.destroy();
        });
        cards = [];
        layer.batchDraw();
    }