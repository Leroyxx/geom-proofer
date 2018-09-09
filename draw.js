const canvasElement = $('canvas');
const ctx = canvas.getContext("2d");

function initDrawing() {
  view.setDrawListeners();
}

let view = {
  isDrawing: false,
  pathBeginningPoint: {},
  toggleElementOnPage: function(element, bool) {
    return bool ? element.show() : element.hide()
  },
  updateUI(tool) {
    const done = $('#done-selecting');
    switch (tool) {
      case 'draw':
        this.toggleElementOnPage(done, false);
        break;
      case 'select':
        this.toggleElementOnPage(done, true);
        break;
      default: break;
    }
  },
  doneSelecting: function() {
    this.selectTool('draw');
  },
  beginDraw: function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    octopus.writeLastLineBeginningPoint({x: x, y: y});
    const lastBeginningPoint = octopus.getLastPathBeginningPoint();
    view.pathBeginningPoint.x = lastBeginningPoint.x;
    view.pathBeginningPoint.y = lastBeginningPoint.y;
    return view.isDrawing = true;
  },
  updateDrawingPosition: function(event) {
    if (!view.isDrawing) {return false}
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const coordinates = {x1: view.pathBeginningPoint.x, y1: view.pathBeginningPoint.y,
      x2: x2 , y2: y2};
    return view.drawLine(coordinates, false);
  },
  stopDraw: function(event) {
    if (!view.isDrawing) {return false}
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const coordinates = {x1: view.pathBeginningPoint.x, y1: view.pathBeginningPoint.y,
      x2: x2 , y2: y2};
    view.drawLine(coordinates, true);
    return view.isDrawing = false;
  },
  beginSelect: function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    view.pathBeginningPoint = {x: x, y: y};
    return view.isDrawing = true;
  },
  updateSelection: function(event) {
    if (!view.isDrawing) {return false}
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const coordinates = {x1: view.pathBeginningPoint.x, y1: view.pathBeginningPoint.y,
      x2: x2 , y2: y2};
    return view.drawSelect(coordinates, false);
  },
  stopSelect: function(event) {
    if (!view.isDrawing) {return false}
    const rect = canvas.getBoundingClientRect();
    const x2 = event.clientX - rect.left;
    const y2 = event.clientY - rect.top;
    const coordinates = {x1: view.pathBeginningPoint.x, y1: view.pathBeginningPoint.y,
      x2: x2 , y2: y2};
    view.drawSelect(coordinates, true);
    return view.isDrawing = false;
  },
  setDrawListeners: function() {
    canvasElement.on("mousedown", octopus.transferEventToTool);
    canvasElement.on("mousemove", octopus.transferEventToTool);
    canvasElement.on("mouseup", octopus.transferEventToTool);
  },
  removeListeners: function() {
    canvasElement.off("mousedown");
    canvasElement.off("mousemove");
    canvasElement.off("mouseup");
  },
  selectTool: function(tool) {
    this.updateUI(tool);
    return octopus.selectTool(tool);
  },
  clearCanvas: function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  },
  drawLinesFromData: function(data) {
    const lines = octopus.getLines();
    for (const line of lines) {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
      ctx.closePath();
    }
  },
  drawSelectionsFromData: function(data) {
    const selections = octopus.getCurrentSelections();
    if (!selections) {return false}
    for (const selectionCoordinates of selections) {
      this.drawRectangle(selectionCoordinates);
    }
  },
  restoreCanvas: function() {
    this.clearCanvas();
    this.drawLinesFromData();
    this.drawSelectionsFromData();
  },
  //Command to draw line:
  //view.drawLine({x1: x1, x2:, x2, y1: y1, y2: y2} , true, ctx);
  drawLine: function(coordinates, isDoneDrawing) {
    this.restoreCanvas();
    ctx.beginPath();
    ctx.moveTo(coordinates.x1, coordinates.y1);
    ctx.lineTo(coordinates.x2, coordinates.y2);
    ctx.stroke();
    ctx.closePath();
    if (isDoneDrawing) {
      return octopus.writeData(coordinates, 'line')
    }
  },
  drawRectangle: function (coordinates) {
    ctx.beginPath();
    ctx.moveTo(coordinates.x1, coordinates.y1);
    const x1 = coordinates.x1;
    const x2 = coordinates.x2;
    const y1 = coordinates.y1;
    const y2 = coordinates.y2;
    if (x2 < x1) {
      coordinates.x2 = x1;
      coordinates.x1 = x2;
    }
    if (y2 < y1) {
      coordinates.y2 = y1;
      coordinates.y1 = y2;
    }
    const width = coordinates.x2-coordinates.x1;
    const height = coordinates.y2-coordinates.y1;
    ctx.strokeStyle="#13193d";
    ctx.fillStyle="rgba(0, 243, 255, 0.08)"
    ctx.rect(coordinates.x1, coordinates.y1, width, height);
    ctx.fillRect(coordinates.x1, coordinates.y1, width, height);
    ctx.stroke();
  },
  drawSelect: function(coordinates, isDoneDrawing) {
    this.restoreCanvas();
    this.drawRectangle(coordinates);
    if (isDoneDrawing) {
      return octopus.writeData(coordinates, 'selection')
    }
  }
}

//ONDOMREADY:
$(function() {
  initDrawing();
})

//OCTOPUS
let octopus = {
  transferEventToTool: function(event) {
    const tool = data.currentTool;
    const type = event.type;
    switch (tool) {
      case 'draw': switch (type) {
        case 'mousedown': return view.beginDraw(event); break;
        case 'mousemove': return view.updateDrawingPosition(event); break;
        case 'mouseup': return view.stopDraw(event); break;
        default: break;
      }
      case 'select': switch (type) {
        case 'mousedown': return view.beginSelect(event); break;
        case 'mousemove': return view.updateSelection(event); break;
        case 'mouseup': return view.stopSelect(event); break;
        default: break;
      }
      default: break;
    }
  },
  selectTool: function(tool) {
    return data.selectTool(tool)
  },
  writeLastLineBeginningPoint: function(coordinates) {
    return data.writeLastLineBeginningPoint(coordinates)
  },
  getLastPathBeginningPoint: function() {
    return data.getLastPathBeginningPoint()
  },
  writeData: function(obj, type) {
    return data.writeData(obj, type);
  },
  getLines: function() {
    return data.getLines();
  },
  getCurrentSelections: function() {
    return data.getCurrentSelections();
  }
}

//DATA
let data = {
  lineDrawingData: {
    lines: [],
    lastBeginningPoint: null
  },
  selectionData: {
    currentSelections: []
  },
  writeLastLineBeginningPoint: function(coordinates) {
    data.lineDrawingData.lastBeginningPoint = coordinates
  },
  getLastPathBeginningPoint: function() {
    return data.lineDrawingData.lastBeginningPoint
  },
  writeData: function(obj, type) {
    switch (type) {
      case 'line': data.lineDrawingData.lines.push(obj); break;
      case 'selection': data.selectionData.currentSelections.push(obj); break;
      default: break;
    }
  },
  getLines: function() {
    return data.lineDrawingData.lines;
  },
  getCurrentSelections: function() {
    return data.selectionData.currentSelections;
  },
  selectTool: function(tool) {
    switch (tool) {
      case 'draw': data.currentTool = 'draw'; break;
      case 'select': data.currentTool = 'select'; break;
      case 'move': data.currentTool = 'move'; break;
      default: break;
    }
  },
  currentTool: 'draw'
}
