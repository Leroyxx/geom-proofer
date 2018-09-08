function initDrawing() {
  let canvasElement = $('canvas');
  let ctx = canvas.getContext("2d");
  let isDrawing = false;
  let isDragging;
  let pathBeginningPoint = {};
  //SET UP EVENT LISTENERS
  canvasElement.on("mousedown", beginDraw);
  canvasElement.on("mousemove", updateMousePosition);
  canvasElement.on("mouseup", stopDraw);
  //
  function beginDraw(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    octopus.writeLastBeginningPoint({x: x, y: y});
    const lastBeginningPoint = octopus.getLastPathBeginningPoint();
    pathBeginningPoint.x = lastBeginningPoint.x;
    pathBeginningPoint.y = lastBeginningPoint.y;
    return isDrawing = true;
  }
  function updateMousePosition(event) {
    if (!isDrawing) {return false}
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const coordinates = {x1: pathBeginningPoint.x, y1: pathBeginningPoint.y,
      x2: x2 , y2: y2};
    return view.drawLine(coordinates, false, ctx);
  }
  function stopDraw(event) {
    if (!isDrawing) {return false}
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const coordinates = {x1: pathBeginningPoint.x, y1: pathBeginningPoint.y,
      x2: x2 , y2: y2};
    view.drawLine(coordinates, true, ctx);
    return isDrawing = false;
  }
}

let view = {
  clearCanvas: function(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
  drawLinesFromData: function(ctx) {
    const lines = octopus.getLines();
    for (const line of lines) {
      ctx.beginPath();
      ctx.moveTo(line.beginCoordinates.x, line.beginCoordinates.y);
      ctx.lineTo(line.endCoordinates.y, line.endCoordinates.y);
      ctx.stroke();
    }
  },
  restoreCanvas: function(ctx) {
    this.clearCanvas(ctx);
    this.drawLinesFromData(ctx);
  },
  drawLine: function(coordinates, isDoneDrawing, ctx) {
    this.restoreCanvas(ctx);
    ctx.beginPath();
    ctx.moveTo(coordinates.x1, coordinates.y1);
    ctx.lineTo(coordinates.x2, coordinates.y2);
    ctx.stroke();
    if (isDoneDrawing) {
      const lineObj = {beginCoordinates: {x: coordinates.x1, y: coordinates.y1},
      endCoordinates: {x: coordinates.x2, y: coordinates.y2}};
      return octopus.writeLine(lineObj)
    }
  }
}

//ONDOMREADY:
$(function() {
  initDrawing();
})

//OCTOPUS
let octopus = {
  writeLastBeginningPoint: function(coordinates) {
    return data.writeLastBeginningPoint(coordinates)
  },
  getLastPathBeginningPoint: function() {
    return data.getLastPathBeginningPoint()
  },
  writeLine: function(lineObj) {
    return data.writeLine(lineObj);
  },
  getLines: function() {
    return data.getLines();
  }
}

//DATA
let data = {
  lineDrawingData: {
    lines: [],
    lastBeginningPoint: null
  },
  writeLastBeginningPoint: function(coordinates) {
    data.lineDrawingData.lastBeginningPoint = coordinates
  },
  getLastPathBeginningPoint: function() {
    return data.lineDrawingData.lastBeginningPoint
  },
  writeLine: function(lineObj) {
    console.log(lineObj);
    data.lineDrawingData.lines.push(lineObj);
  },
  getLines: function() {
    return data.lineDrawingData.lines;
  }
}
