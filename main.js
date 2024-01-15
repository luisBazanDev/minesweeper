const canvas = document.getElementById("canvas");
const HEIGHT = 1000;
const WIDTH = 1000;

const config = {
  height_cells: 20,
  width_cells: 20,
  one_of_each: 7, // Default 5. Increasing this value reduces the density of bombs
};

// Game object
const game = {
  height: config.height_cells,
  width: config.width_cells,
  cells: [],
  gameOver: false,
  win: false,
};

// Cell class
class Cell {
  constructor({ x, y, isBomb }) {
    this.x = x;
    this.y = y;
    this.isBomb = isBomb;
    this.value = null;
    this.hide = true;
    this.target = false;
  }

  calculeBombs() {
    if (this.isBomb) return -1;

    let count = 0;

    for (const cell of game.cells) {
      if (
        // Calculate distance
        Math.sqrt(Math.pow(cell.y - this.y, 2) + Math.pow(cell.x - this.x, 2)) <
          2 &&
        cell.isBomb
      )
        count++;
    }

    return count;
  }

  drawInCanvasContext(context, x, y, width, height) {
    if (this.target && this.hide) {
      context.fillStyle = "rgb(100,100,200)";
      context.fillRect(x, y, width, height);
    } else if (this.hide) {
      context.fillStyle = "rgb(200,200,200)";
      context.fillRect(x, y, width, height);
    } else if (this.isBomb) {
      if (game.win) context.fillStyle = "rgb(255,215,0)";
      else context.fillStyle = "rgb(255,0,0)";
      context.fillRect(x, y, width, height);
    } else {
      context.font = width / 2 + "px Arial";
      context.fillStyle = "rgb(150,150,150)";
      context.fillRect(x, y, width, height);
      context.fillStyle = "rgb(0,0,0)";
      if (this.value == null) this.value = this.calculeBombs();
      if (this.value != 0)
        context.fillText(this.value, x + width * 0.35, y + height * 0.65);
    }

    if (this.target && !this.hide) {
      console.log(this);
      context.fillStyle = "rgba(100,100,200,0.7)";
      let borderX = Math.floor(height * 0.2);
      let borderY = Math.floor(width * 0.2);
      context.fillRect(
        x + borderX + 1,
        y + borderY + 1,
        width - borderX * 2,
        height - borderY * 2
      );
    }
  }
}

// ---- Debug ----
function hideAll() {
  for (const cell of game.cells) {
    cell.hide = true;
  }
  draw();
}
function showAll() {
  for (const cell of game.cells) {
    cell.hide = false;
  }
  draw();
}

// Util function
function getRandomNumber(MIN, MAX) {
  return Math.floor(Math.random() * (MAX - MIN) + MIN);
}

// Game over function
function gameOver(cell) {
  game.gameOver = true;
  for (const cell of game.cells) {
    cell.hide = false;
  }
  draw();
}

// Game win function
function gameWin() {
  game.win = true;
  for (const cell of game.cells) {
    cell.target = false;
    cell.hide = false;
  }
  draw();
}

function cellRightClick(cell) {
  if (cell.hide) cell.target = !cell.target;
  draw();
}

function cellClick(cell) {
  if (cell.target) return;
  if (cell.isBomb) return gameOver(cell);

  if (!cell.hide) return;

  cell.value = cell.calculeBombs();
  if (cell.value != 0) return (cell.hide = false);

  // Cell null
  cell.hide = false;
  var openCells = [cell];
  while (openCells.length > 0) {
    for (const analizeCell of openCells) {
      let coincidens = 0;
      for (const otherCell of game.cells) {
        if (otherCell == analizeCell) continue;
        if (otherCell.target) continue;
        if (otherCell.value == null) otherCell.value = otherCell.calculeBombs();
        const distance = Math.sqrt(
          Math.pow(otherCell.y - analizeCell.y, 2) +
            Math.pow(otherCell.x - analizeCell.x, 2)
        );
        // Show cells with value
        if (distance < 2 && otherCell.hide && otherCell.value != 0)
          otherCell.hide = false;

        // show cells with value 0
        if (distance < 2 && otherCell.value == 0 && otherCell.hide) {
          otherCell.hide = false;
          openCells.push(otherCell);
          coincidens++;
        }
      }
      openCells = openCells.filter((a) => a !== analizeCell);
    }
  }

  // Check game win
  let win = true;
  for (const cell of game.cells) {
    if (!cell.isBomb && cell.hide) win = false;
  }
  if (win) gameWin();
}

// Util function to fill game.cells
function fillCells() {
  for (let x = 0; x < game.width; x++) {
    for (let y = 0; y < game.width; y++) {
      const cell = new Cell({
        x,
        y,
        isBomb: getRandomNumber(0, config.one_of_each) == 0,
      });
      game.cells.push(cell);
    }
  }
}

// Draw function to render game
function draw() {
  const context = canvas.getContext("2d");
  const cellWidth = WIDTH / game.width;
  const cellHeight = HEIGHT / game.height;

  for (const cell of game.cells) {
    const x = cellWidth * cell.x;
    const y = cellHeight * cell.y;
    cell.drawInCanvasContext(context, x, y, cellWidth, cellHeight);
  }

  // Draw lines
  context.lineWidth = 2;
  context.strokeStyle = "rgb(255,255,255)";
  // Verical lines
  for (let i = 0; i < game.width + 1; i++) {
    const x = i * cellWidth;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, HEIGHT);
    context.stroke();
  }
  // Horizontal lines
  for (let i = 0; i < game.height + 1; i++) {
    const y = i * cellHeight;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WIDTH, y);
    context.stroke();
  }
}

// Start game
fillCells();
draw();

// Events

// Right click
canvas.addEventListener("contextmenu", function (event) {
  event.preventDefault();
  var canvasRect = canvas.getBoundingClientRect();
  var canvasX = canvasRect.left;
  var canvasMaxX = canvasRect.right;
  var canvasY = canvasRect.top;
  var canvasMaxY = canvasRect.bottom;

  const mouseX = Math.floor((event.clientX * WIDTH) / (canvasMaxX - canvasX));
  const mouseY = Math.floor((event.clientY * HEIGHT) / (canvasMaxY - canvasY));

  const cellX = Math.floor(mouseX / (WIDTH / game.width));
  const cellY = Math.floor(mouseY / (HEIGHT / game.height));

  const cell = game.cells[Math.floor(cellY + cellX * game.width)];

  cellRightClick(cell);
});

// Left click
canvas.addEventListener("click", function (event) {
  var canvasRect = canvas.getBoundingClientRect();
  var canvasX = canvasRect.left;
  var canvasMaxX = canvasRect.right;
  var canvasY = canvasRect.top;
  var canvasMaxY = canvasRect.bottom;

  const mouseX = Math.floor((event.clientX * WIDTH) / (canvasMaxX - canvasX));
  const mouseY = Math.floor((event.clientY * HEIGHT) / (canvasMaxY - canvasY));

  const cellX = Math.floor(mouseX / (WIDTH / game.width));
  const cellY = Math.floor(mouseY / (HEIGHT / game.height));

  const cell = game.cells[Math.floor(cellY + cellX * game.width)];

  // Muestra las coordenadas en la consola (puedes hacer lo que quieras con estas coordenadas)
  console.log("Clic en X:", cellX, " Y:", cellY);
  if (!game.gameOver) {
    cellClick(cell);
  }
  draw();
});
