/* ══════════════════════════════════════════════
   NYT Connections Clone
   ══════════════════════════════════════════════ */

// ── Puzzle Data ────────────────────────────────────────────────────────────
const PUZZLES = [
  {
    title: "Puzzle #1",
    categories: [
      {
        title: "Types of Cheese",
        color: "yellow",
        words: ["BRIE", "GOUDA", "CHEDDAR", "FETA"],
      },
      {
        title: "Planets",
        color: "green",
        words: ["MARS", "VENUS", "SATURN", "NEPTUNE"],
      },
      {
        title: "___ Stone",
        color: "blue",
        words: ["ROLLING", "KIDNEY", "COBBLE", "LIME"],
      },
      {
        title: "Shades of Blue",
        color: "purple",
        words: ["CERULEAN", "COBALT", "INDIGO", "AZURE"],
      },
    ],
  },
  {
    title: "Puzzle #2",
    categories: [
      {
        title: "Things in a Kitchen",
        color: "yellow",
        words: ["SPATULA", "COLANDER", "WHISK", "LADLE"],
      },
      {
        title: "Classic Rock Bands",
        color: "green",
        words: ["RUSH", "CREAM", "HEART", "BOSTON"],
      },
      {
        title: "Poker Hands",
        color: "blue",
        words: ["FLUSH", "STRAIGHT", "FULL HOUSE", "ROYAL"],
      },
      {
        title: "Words before 'BALL'",
        color: "purple",
        words: ["BASKET", "FOOT", "BASE", "CANNON"],
      },
    ],
  },
  {
    title: "Puzzle #3",
    categories: [
      {
        title: "Dances",
        color: "yellow",
        words: ["WALTZ", "TANGO", "FOXTROT", "RUMBA"],
      },
      {
        title: "Shakespeare Plays",
        color: "green",
        words: ["HAMLET", "OTHELLO", "MACBETH", "TEMPEST"],
      },
      {
        title: "James Bond Actors",
        color: "blue",
        words: ["CONNERY", "MOORE", "BROSNAN", "CRAIG"],
      },
      {
        title: "___ Bear",
        color: "purple",
        words: ["POLAR", "GRIZZLY", "TEDDY", "KODIAK"],
      },
    ],
  },
  {
    title: "Puzzle #4",
    categories: [
      {
        title: "Olympic Sports",
        color: "yellow",
        words: ["FENCING", "ROWING", "CURLING", "BIATHLON"],
      },
      {
        title: "Parts of a Ship",
        color: "green",
        words: ["BOW", "STERN", "HULL", "MAST"],
      },
      {
        title: "Famous Redheads",
        color: "blue",
        words: ["PRINCE HARRY", "CONAN", "LUCILLE", "ED SHEERAN"],
      },
      {
        title: "Phobias",
        color: "purple",
        words: ["ARACHNOPHOBIA", "CLAUSTROPHOBIA", "ACROPHOBIA", "AGORAPHOBIA"],
      },
    ],
  },
  {
    title: "Puzzle #5",
    categories: [
      {
        title: "Ice Cream Flavors",
        color: "yellow",
        words: ["PISTACHIO", "MANGO", "STRACCIATELLA", "MINT CHIP"],
      },
      {
        title: "Famous Composers",
        color: "green",
        words: ["BACH", "BEETHOVEN", "MOZART", "CHOPIN"],
      },
      {
        title: "Types of Triangle",
        color: "blue",
        words: ["SCALENE", "ISOSCELES", "EQUILATERAL", "RIGHT"],
      },
      {
        title: "Words for 'Angry'",
        color: "purple",
        words: ["LIVID", "IRATE", "INCENSED", "FUMING"],
      },
    ],
  },
];

// Color palette (matches CSS variables)
const COLOR_MAP = {
  yellow: { bg: "#f9df6d", dark: "#5a4a00" },
  green:  { bg: "#a0c35a", dark: "#2a4a00" },
  blue:   { bg: "#b0c4ef", dark: "#1a3a7a" },
  purple: { bg: "#ba81c5", dark: "#4a006a" },
};

// ── State ──────────────────────────────────────────────────────────────────
let state = {
  puzzleIndex: 0,
  tiles: [],         // { word, color, solved, selected }
  mistakes: 4,
  solved: [],        // array of solved category objects
  guessHistory: [],  // array of arrays of colors (for modal)
  gameOver: false,
  toastTimer: null,
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const $grid        = document.getElementById("word-grid");
const $solved      = document.getElementById("solved-categories");
const $dots        = document.getElementById("mistake-dots");
const $btnShuffle  = document.getElementById("btn-shuffle");
const $btnDeselect = document.getElementById("btn-deselect");
const $btnSubmit   = document.getElementById("btn-submit");
const $overlay     = document.getElementById("modal-overlay");
const $modalTitle  = document.getElementById("modal-title");
const $modalRes    = document.getElementById("modal-results");
const $modalClose  = document.getElementById("modal-close");
const $toast       = document.getElementById("toast");
const $puzzleBtns  = document.getElementById("puzzle-buttons");

// ── Init ───────────────────────────────────────────────────────────────────
function initGame(puzzleIndex) {
  state.puzzleIndex  = puzzleIndex;
  state.mistakes     = 4;
  state.solved       = [];
  state.guessHistory = [];
  state.gameOver     = false;

  const puzzle = PUZZLES[puzzleIndex];

  // Build flat tile list
  state.tiles = puzzle.categories.flatMap(cat =>
    cat.words.map(word => ({
      word,
      color: cat.color,
      categoryTitle: cat.title,
      solved: false,
      selected: false,
    }))
  );

  shuffle(state.tiles);

  renderAll();
}

// ── Render helpers ─────────────────────────────────────────────────────────
function renderAll() {
  renderSolved();
  renderGrid();
  renderDots();
  updateButtons();
}

function renderGrid() {
  $grid.innerHTML = "";
  state.tiles
    .filter(t => !t.solved)
    .forEach(tile => {
      const el = document.createElement("div");
      el.className = "word-tile" + (tile.selected ? " selected" : "");
      el.textContent = tile.word;
      el.dataset.word = tile.word;
      el.addEventListener("click", () => onTileClick(tile, el));
      $grid.appendChild(el);
    });
}

function renderSolved() {
  $solved.innerHTML = "";
  state.solved.forEach(cat => {
    const row = document.createElement("div");
    row.className = "solved-row";
    const colors = COLOR_MAP[cat.color];
    row.style.background = colors.bg;
    row.style.color = colors.dark;
    row.innerHTML = `
      <div class="category-title">${cat.title}</div>
      <div class="category-words">${cat.words.join(", ")}</div>
    `;
    $solved.appendChild(row);
  });
}

function renderDots() {
  $dots.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement("div");
    dot.className = "dot" + (i >= state.mistakes ? " lost" : "");
    $dots.appendChild(dot);
  }
}

function updateButtons() {
  const count = selectedTiles().length;
  $btnDeselect.disabled = count === 0 || state.gameOver;
  $btnSubmit.disabled   = count !== 4 || state.gameOver;
}

function renderPuzzlePicker() {
  $puzzleBtns.innerHTML = "";
  PUZZLES.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.className = "puzzle-btn" + (i === state.puzzleIndex ? " active" : "");
    btn.textContent = i + 1;
    btn.title = p.title;
    btn.addEventListener("click", () => {
      if (i === state.puzzleIndex) return;
      initGame(i);
      renderPuzzlePicker();
    });
    $puzzleBtns.appendChild(btn);
  });
}

// ── Tile interaction ───────────────────────────────────────────────────────
function onTileClick(tile, el) {
  if (state.gameOver || tile.solved) return;

  if (tile.selected) {
    tile.selected = false;
    el.classList.remove("selected");
  } else {
    if (selectedTiles().length >= 4) return;
    tile.selected = true;
    el.classList.add("selected");
  }
  updateButtons();
}

function selectedTiles() {
  return state.tiles.filter(t => t.selected && !t.solved);
}

// ── Submit guess ───────────────────────────────────────────────────────────
function onSubmit() {
  if (state.gameOver) return;
  const sel = selectedTiles();
  if (sel.length !== 4) return;

  // Check if all 4 belong to the same category
  const category = sel[0].color;
  const allSame  = sel.every(t => t.color === category);

  // Record guess for results modal
  state.guessHistory.push(sel.map(t => t.color));

  if (allSame) {
    // Correct!
    animateTiles(sel.map(t => t.word), "jump", () => {
      // Mark solved
      sel.forEach(t => { t.solved = true; t.selected = false; });

      // Find category object from puzzle
      const puzzle = PUZZLES[state.puzzleIndex];
      const catObj = puzzle.categories.find(c => c.color === category);
      state.solved.push(catObj);

      renderAll();

      // Check win
      if (state.solved.length === 4) {
        setTimeout(() => endGame(true), 400);
      }
    });
  } else {
    // Wrong — check if one away
    const oneAway = isOneAway(sel);
    sel.forEach(t => { t.selected = false; });
    state.mistakes--;

    animateTiles(sel.map(t => t.word), "shake", () => {
      renderDots();
      updateButtons();
      if (oneAway) showToast("One away...");
      if (state.mistakes === 0) {
        setTimeout(() => endGame(false), 600);
      }
    });
  }
}

function isOneAway(sel) {
  // Check if removing any one tile makes the rest match
  for (let i = 0; i < sel.length; i++) {
    const rest = sel.filter((_, j) => j !== i);
    if (rest.every(t => t.color === rest[0].color)) return true;
  }
  return false;
}

// ── Animations ─────────────────────────────────────────────────────────────
function animateTiles(words, animClass, callback) {
  const els = words.map(w =>
    $grid.querySelector(`[data-word="${CSS.escape(w)}"]`)
  ).filter(Boolean);

  let done = 0;
  if (els.length === 0) { callback && callback(); return; }

  els.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add(animClass);
      el.addEventListener("animationend", function handler() {
        el.classList.remove(animClass);
        el.removeEventListener("animationend", handler);
        done++;
        if (done === els.length) callback && callback();
      }, { once: true });
    }, i * 60);
  });
}

// ── End game ───────────────────────────────────────────────────────────────
function endGame(won) {
  state.gameOver = true;

  // If lost, reveal all answers
  if (!won) {
    const puzzle = PUZZLES[state.puzzleIndex];
    // Mark all as solved
    state.tiles.forEach(t => {
      t.solved = true; t.selected = false;
    });
    puzzle.categories.forEach(cat => {
      if (!state.solved.find(s => s.color === cat.color)) {
        state.solved.push(cat);
      }
    });
    renderAll();
  }

  setTimeout(() => showModal(won), won ? 200 : 600);
}

function showModal(won) {
  $modalTitle.textContent = won ? "Magnificent!" : "Better luck next time!";

  // Build color squares from guess history
  $modalRes.innerHTML = "";
  state.guessHistory.forEach(guess => {
    const row = document.createElement("div");
    row.className = "result-row";
    guess.forEach(color => {
      const sq = document.createElement("div");
      sq.className = "result-square";
      sq.style.background = COLOR_MAP[color].bg;
      row.appendChild(sq);
    });
    $modalRes.appendChild(row);
  });

  $overlay.classList.remove("hidden");
  updateButtons();
}

// ── Shuffle ────────────────────────────────────────────────────────────────
function onShuffle() {
  const unsolved = state.tiles.filter(t => !t.solved);
  shuffle(unsolved);
  // Rebuild tiles array: solved order preserved at top (they're shown in #solved-categories),
  // then shuffled unsolved
  state.tiles = [...state.tiles.filter(t => t.solved), ...unsolved];
  renderGrid();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg) {
  if (state.toastTimer) clearTimeout(state.toastTimer);
  $toast.textContent = msg;
  $toast.classList.remove("hidden");
  state.toastTimer = setTimeout(() => $toast.classList.add("hidden"), 1800);
}

// ── Event listeners ────────────────────────────────────────────────────────
$btnShuffle.addEventListener("click", onShuffle);

$btnDeselect.addEventListener("click", () => {
  state.tiles.forEach(t => { t.selected = false; });
  renderGrid();
  updateButtons();
});

$btnSubmit.addEventListener("click", onSubmit);

$modalClose.addEventListener("click", () => {
  $overlay.classList.add("hidden");
  initGame(state.puzzleIndex);
  renderPuzzlePicker();
});

// ── Bootstrap ──────────────────────────────────────────────────────────────
renderPuzzlePicker();
initGame(0);
