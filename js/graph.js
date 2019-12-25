class Graph {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");

    this._edges = [];
    this._loops = [];
    this._vertexes = [];
  }

  get edges() {
    return this._edges;
  }

  get loops() {
    return this._loops;
  }

  get vertexes() {
    return this._vertexes;
  }

  /* VERTEXES */
  createVertex(x, y) {
    const currentVertex = this.findCurrentVertex(x, y);

    if (!currentVertex) {
      this._vertexes.push(new Vertex(x, y, this._vertexes.length));
    }

    this.redraw();
  }

  moveVertex(vertex, { x, y }) {
    vertex.x = x;
    vertex.y = y;

    this.redraw();
  }

  /* VERTEXES */

  /* LOOPS */
  createLoop(x, y) {
    const currentVertex = this.findCurrentVertex(x, y);

    if (currentVertex) {
      this.toggleLoop(currentVertex);
    }
  }

  toggleLoop(vertex, removeIfExists = true) {
    const loopOnVertex = this._loops.find(loop => loop.vertex === vertex);

    if (loopOnVertex && removeIfExists) {
      this._loops = this._loops.filter(loop => loop !== loopOnVertex);
    } else if (!loopOnVertex) {
      this._loops.push(new Loop(vertex));
    }

    this.redraw();
  }

  loopOnVertex(vertex) {
    return this._loops.find(loop => loop.vertex === vertex);
  }

  /* LOOPS */

  /* EDGES */
  createEdge(vertex1, vertex2, weight, direction) {
    this._edges.push(new Edge(vertex1, vertex2, weight, direction));
    this.redraw();
  }

  edgeVertexesConnected(vertex1, vertex2) {
    return this._edges.find(edge =>
      ((edge.vertex1 === vertex1 && edge.vertex2 === vertex2) || (edge.vertex2 === vertex1 && edge.vertex1 === vertex2) && edge.direction === 0) ||
      (edge.vertex1 === vertex1 && edge.vertex2 === vertex2 && edge.direction === 2) ||
      (edge.vertex2 === vertex1 && edge.vertex1 === vertex2 && edge.direction === 1)
    );
  }
  /* EDGES */

  /* HELPERS */
  findCurrentVertex(x, y) {
    return this._vertexes.find(vertex => vertex.isIn(x, y));
  }

  createMatrix() {
    const len = this._vertexes.length;
    const matrix = [];
    for (let i = 0; i < len; ++i) {
      let columns = [];
      for (let j = 0; j < len; ++j) {
        columns[j] = 0;
      }
      matrix[i] = columns;
    }

    for (let i = 0; i < len; i++) {
      let foundLoop = this.loopOnVertex(this._vertexes[i]);
      matrix[i][i] = !!foundLoop ? 1 : 0;

      for (let j = 0; j < len; j++) {
        if (i === j) continue;

        let foundEdge = this.edgeVertexesConnected(this._vertexes[i], this._vertexes[j]);

        matrix[i][j] = !!foundEdge ? foundEdge._weight : 0;
      }
    }

    return matrix;
  }
  /* HELPERS */

  /* CORE */
  redraw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    Loop.initStyle(this.ctx);
    this._loops.forEach(loop => {
      loop.draw(this.ctx);
    });

    Edge.initStyle(this.ctx);
    this._edges.forEach(edge => {
      edge.draw(this.ctx);
    });

    Vertex.initStyle(this.ctx);
    this._vertexes.forEach(vertex => {
      vertex.draw(this.ctx);
    });
  }

  reset() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this._loops = [];
    this._edges = [];
    this._vertexes = [];
  }

  /* CORE */
}

class Vertex {
  static radius() {
    return 5
  };

  static initStyle(ctx) {
    ctx.strokeStyle = "#000";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.font = 'bold 14px serif';
  }

  constructor(x, y, index) {
    this._x = x;
    this._y = y;
    this._index = index;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this._x, this._y, Vertex.radius(), 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText(this._index, this._x - 4, this._y + 20);
  }

  distanceTo(x, y) {
    const distX = Math.abs(x - this._x);
    const distY = Math.abs(y - this._y);
    return Math.sqrt(distX * distX + distY * distY);
  }

  isIn(x, y) {
    return this.distanceTo(x, y) < (Vertex.radius() + 5);
  }


  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
  }
}

class Loop {
  static radiusX() {
    return 8
  };

  static radiusY() {
    return 10
  };

  static initStyle(ctx) {
    ctx.strokeStyle = "#2196F3";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
  }

  constructor(vertex) {
    this._vertex = vertex;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.ellipse(
      this._vertex.x + Vertex.radius(),
      this._vertex.y + Vertex.radius(),
      Loop.radiusX(),
      Loop.radiusY(),
      45 * Math.PI / 180, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  }

  get vertex() {
    return this._vertex;
  }
}

class Edge {
  static initStyle(ctx) {
    ctx.strokeStyle = "#2196F3";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.font = '14px serif';
  }

  constructor(vertex1, vertex2, weight = 1, direction = 0) {
    this._direction = direction;
    this._weight = weight;
    this._vertex1 = vertex1;
    this._vertex2 = vertex2;
  }

  draw(ctx) {
    ctx.beginPath();
    if (this._direction === 0) {
      ctx.moveTo(this.vertex1.x, this.vertex1.y);
      ctx.lineTo(this.vertex2.x, this.vertex2.y);

    } else if (this._direction === 1) {
      ctx.moveTo(this.vertex2.x, this.vertex2.y);
      ctx.lineTo(this.vertex1.x, this.vertex1.y);

      // arrow
      const arrowWidth = 10;
      const arrowAngle = Math.atan2(this.vertex2.x - this.vertex1.x, this.vertex2.y - this.vertex1.y) + Math.PI;
      ctx.moveTo(this.vertex1.x - (arrowWidth * Math.sin(arrowAngle - Math.PI / 6)),
        this.vertex1.y - (arrowWidth * Math.cos(arrowAngle - Math.PI / 6)));
      ctx.lineTo(this.vertex1.x, this.vertex1.y);
      ctx.lineTo(this.vertex1.x - (arrowWidth * Math.sin(arrowAngle + Math.PI / 6)),
        this.vertex1.y - (arrowWidth * Math.cos(arrowAngle + Math.PI / 6)));

    } else if (this._direction === 2) {
      ctx.moveTo(this.vertex1.x, this.vertex1.y);
      ctx.lineTo(this.vertex2.x, this.vertex2.y);

      // arrow
      const arrowWidth = 10;
      const arrowAngle = Math.atan2(this.vertex1.x - this.vertex2.x, this.vertex1.y - this.vertex2.y) + Math.PI;
      ctx.moveTo(this.vertex2.x - (arrowWidth * Math.sin(arrowAngle - Math.PI / 6)),
        this.vertex2.y - (arrowWidth * Math.cos(arrowAngle - Math.PI / 6)));
      ctx.lineTo(this.vertex2.x, this.vertex2.y);
      ctx.lineTo(this.vertex2.x - (arrowWidth * Math.sin(arrowAngle + Math.PI / 6)),
        this.vertex2.y - (arrowWidth * Math.cos(arrowAngle + Math.PI / 6)));
    }
    ctx.closePath();
    ctx.stroke();

    const textX = (this.vertex1.x + this.vertex2.x) / 2;
    const textY = (this.vertex1.y + this.vertex2.y) / 2;
    ctx.fillText(this._weight, textX + 10, textY);
  }

  get vertex1() {
    return this._vertex1;
  }

  set vertex1(value) {
    this._vertex1 = value;
  }

  get vertex2() {
    return this._vertex2;
  }

  set vertex2(value) {
    this._vertex2 = value;
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = (value >= 0 || value <= 2) ? value : 0;
  }

  get weight() {
    return this._weight;
  }

  set weight(value) {
    this._weight = Number(value) ? value : 0;
  }

  updateDirection() {
    this._direction = this._direction === 2 ? 0 : this._direction++;
  }
}