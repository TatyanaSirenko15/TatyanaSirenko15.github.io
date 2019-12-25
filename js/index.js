const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let currentMode = document.querySelector('.tools__control__input:checked').value;
document.querySelectorAll('.tools__control__input')
  .forEach(control => {
    control.addEventListener('change', e => {
      currentMode = e.target.value;
    })
  });

let graph = new Graph(canvas);

let moveVertex = false;
let movingVertex = undefined;
let edgeVertex1 = undefined;

canvas.addEventListener('mousedown', function (e) {
  const mouseX = e.pageX - this.offsetLeft;
  const mouseY = e.pageY - this.offsetTop;

  if (currentMode === 'vertex') {
    const vertexFound = graph.findCurrentVertex(mouseX, mouseY);

    if (vertexFound) {
      moveVertex = true;
      movingVertex = vertexFound;
    } else {
      graph.createVertex(mouseX, mouseY);
    }

  } else if (currentMode === 'loop') {
    graph.createLoop(mouseX, mouseY);

  } else if (currentMode === 'edge') {
    const vertexFound = graph.findCurrentVertex(mouseX, mouseY);

    if (!!vertexFound && !edgeVertex1) {
      edgeVertex1 = vertexFound;
    } else if (!!vertexFound && !!edgeVertex1) {
      if (edgeVertex1 === vertexFound) {
        graph.toggleLoop(vertex1, false);

      } else {
        const weight = Number(window.prompt("Вес ребра:", "1"));
        const direction = Number(window.prompt("Укажите направление (0 - без направления, 1 - в сторону 1 точки, 2 - в сторону 2 точки):", "0"));

        graph.createEdge(edgeVertex1, vertexFound, weight || 1, direction || 0);
      }
      edgeVertex1 = undefined;
    }
  }
});

canvas.addEventListener('mousemove', function (e) {
  if (moveVertex) {
    const x = e.pageX - this.offsetLeft;
    const y = e.pageY - this.offsetTop;

    graph.moveVertex(movingVertex, { x, y });
  }
});

canvas.addEventListener('mouseup', () => {
  moveVertex = false;
  movingVertex = false;
});
canvas.addEventListener('mouseleave', () => {
  moveVertex = false;
  movingVertex = false;
});

document.querySelector('.control__clear').addEventListener('click', () => {
  graph.reset();
});

document.querySelector('.control__matrix').addEventListener('click', () => {
  const matrix = graph.createMatrix();
  const message = `Полученная матрица смежности:

${matrix.map(line => line.join(' ')).join('\n')}
`;

  window.alert(message);
});

window.addEventListener('resize', () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  graph.redraw();
})
