/**************************** Constant declaration **************************/
const body = document.body;
const container = document.getElementById("main");
const scoreSpan = document.getElementById("score");
const B_HEIGHT = container.offsetHeight;
const B_WIDTH = container.offsetWidth;
const BOX_SIZE = 32;
const GUTTER = 4;
const GRID_CELL_COLOR = "transparent";
const ROWS = Math.floor(B_HEIGHT / (BOX_SIZE + GUTTER));
const COLS = Math.floor(B_WIDTH / (BOX_SIZE + GUTTER));
const BOMB_ICON = "💣";
const BOMB_SET = new Set(
  _.sample(
    Array(ROWS * COLS)
      .fill(0)
      .map((d, i) => i),
    Math.floor(ROWS * COLS * 0.1)
  ).map((bomb) => `${Math.floor(bomb / COLS)}-${bomb % COLS}`)
);
const HINT_SET = new Set();
/****************************************************************************/

console.log(ROWS, COLS, BOMB_SET);

/**
 * function to create grid for snake game
 * @param {number} rows
 * @param {number} cols
 * @param {number} size
 * @returns {void}
 */
const createGrid = (rows, cols, size) => {
  container.innerHTML = "";
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cell = document.createElement("button");
      cell.classList.add(
        "absolute",
        "border",
        "border-zinc-600",
        "rounded-sm",
        "shadow-inner",
        "bg-zinc-700",
        "hover:bg-zinc-600",
        "text-0",
        "font-mono"
      );
      cell.style.height = `${size}px`;
      cell.style.width = `${size}px`;
      cell.style.left = `${i * size + i * GUTTER}px`;
      cell.style.top = `${j * size + j * GUTTER}px`;
      cell.dataset.position = `${j}-${i}`;
      container.appendChild(cell);
    }
  }
  container.style.marginLeft = `${
    B_WIDTH / 2 - (COLS / 2) * (BOX_SIZE + GUTTER)
  }px`;
};

/**
 * function to return grid items/cells
 * @returns {HTMLDivElement}
 */
const getGridItems = () => container.children;

const parseBombKey = (key) => key.split("-").map((_) => +_);

const getArrayIndex = (row, col) => {
  if (0 <= row && row < ROWS && 0 <= col && col < COLS) {
    return row + col * ROWS;
  }
  return -1;
};

const getBombKey = (row, col) => `${row}-${col}`;

const getNeighbouringIndices = (row, col) => [
  [row, col - 1],
  [row, col + 1],
  [row - 1, col - 1],
  [row - 1, col],
  [row - 1, col + 1],
  [row + 1, col - 1],
  [row + 1, col],
  [row + 1, col + 1],
];

const updateNeighbourIndices = (row, col) => {
  const cells = getGridItems();
  const indices = getNeighbouringIndices(row, col);

  indices.forEach(([row, col]) => {
    if (!BOMB_SET.has(getBombKey(row, col)) && cells[getArrayIndex(row, col)]) {
      const bombNumber = +cells[getArrayIndex(row, col)].innerText || 0;
      cells[getArrayIndex(row, col)].innerText = bombNumber + 1;
      HINT_SET.add(getBombKey(row, col));
    }
  });
};

const placeHints = () => {
  const cells = getGridItems();
  BOMB_SET.forEach((bombPos) => {
    const [row, col] = parseBombKey(bombPos);
    cells[getArrayIndex(row, col)].innerText = BOMB_ICON;
    updateNeighbourIndices(row, col);
  });
};

const makeCellVisible = (cell, textColor = "text-white", isBomb = false) => {
  cell.classList.add(isBomb ? "bg-red-500" : "bg-zinc-900", textColor);
  cell.classList.remove("text-0", "hover:bg-zinc-600", "bg-zinc-700");
};

const getHintColor = (cell) => {
  const value = +cell.innerText;
  switch (value) {
    case 1:
      return "text-sky-500";
    case 2:
      return "text-lime-500";
    case 3:
      return "text-red-500";
    default:
      return "text-white";
  }
};

const showEmptyCells = (position) => {
  const cells = getGridItems();
  let neighbourList = [position];
  const visitedNeighbours = new Set(neighbourList);
  while (neighbourList.length) {
    const immediateNeighbours = [];
    neighbourList.forEach((pos) => {
      getNeighbouringIndices(...pos.split("-").map((_) => +_))
        .filter(([r, c]) => r >= 0 && c >= 0 && r < ROWS && c < COLS)
        .map((d) => d.join("-"))
        .forEach((neighbor) => {
          if (!visitedNeighbours.has(neighbor)) {
            visitedNeighbours.add(neighbor);
            if (HINT_SET.has(neighbor)) {
              const index = getArrayIndex(...parseBombKey(neighbor));
              makeCellVisible(cells[index], getHintColor(cells[index]));
            } else if (!BOMB_SET.has(neighbor)) {
              const index = getArrayIndex(...parseBombKey(neighbor));
              makeCellVisible(cells[index]);
              immediateNeighbours.push(neighbor);
            }
          }
        });
    });
    neighbourList = immediateNeighbours;
  }
};

const showAllBombs = () => {
  const cells = getGridItems();
  BOMB_SET.forEach((pos) => {
    const index = getArrayIndex(...parseBombKey(pos));
    makeCellVisible(cells[index], null, true);
  });
};

const handleButtonClick = (button) => {
  const position = button.dataset.position;
  if (BOMB_SET.has(position)) {
    showAllBombs();
    console.log("game over");
    return;
  }
  const value = button.innerText;
  switch (+value) {
    case 0:
      makeCellVisible(button);
      showEmptyCells(position);
      break;
    case 1:
      makeCellVisible(button, "text-sky-500");
      break;
    case 2:
      makeCellVisible(button, "text-lime-500");
      break;
    case 3:
      makeCellVisible(button, "text-red-500");
      break;
    default:
      makeCellVisible(button);
      break;
  }
};

/**
 * init game event listeners
 * @returns {void}
 */
const initGameListener = () => {
  container.addEventListener("click", ({ target }) => {
    const button = target.closest("button");
    if (button) {
      handleButtonClick(button);
    }
  });
};

/******************************************************************************/

createGrid(ROWS, COLS, BOX_SIZE);
placeHints();
initGameListener();
