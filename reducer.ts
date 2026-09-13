import {
  Board,
  ActivePiece,
  PieceType,
  createBoard,
  randomPiece,
  spawnPiece,
  isValid,
  lockPiece,
  clearLines,
  scoreLines,
  getLevel,
  PIECES,
} from "./engine";

export interface GameState {
  board: Board;
  current: ActivePiece | null;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  started: boolean;
}

export type GameAction =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "MOVE_DOWN" }
  | { type: "ROTATE" }
  | { type: "HARD_DROP" };

export function createInitialState(): GameState {
  return {
    board: createBoard(),
    current: null,
    next: randomPiece(),
    score: 0,
    lines: 0,
    level: 0,
    gameOver: false,
    started: false,
  };
}

function doSpawn(state: GameState): GameState {
  const piece = spawnPiece(state.next);
  const next = randomPiece();
  if (!isValid(state.board, piece)) {
    return { ...state, gameOver: true, current: null };
  }
  return { ...state, current: piece, next };
}

function doLock(state: GameState): GameState {
  if (!state.current) return state;
  const locked = lockPiece(state.board, state.current);
  const { board, lines } = clearLines(locked);
  const totalLines = state.lines + lines;
  const level = getLevel(totalLines);
  const score = state.score + scoreLines(lines, level);
  return doSpawn({ ...state, board, lines: totalLines, level, score, current: null });
}

function tryMove(state: GameState, dx: number, dy: number): GameState {
  if (!state.current) return state;
  const moved = { ...state.current, x: state.current.x + dx, y: state.current.y + dy };
  if (isValid(state.board, moved)) return { ...state, current: moved };
  if (dy > 0) return doLock(state);
  return state;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.gameOver && action.type !== "START") return state;

  switch (action.type) {
    case "START":
      return doSpawn({ ...createInitialState(), started: true });

    case "TICK":
      if (!state.started || !state.current) return state;
      return tryMove(state, 0, 1);

    case "MOVE_LEFT":
      return tryMove(state, -1, 0);

    case "MOVE_RIGHT":
      return tryMove(state, 1, 0);

    case "MOVE_DOWN":
      return tryMove(state, 0, 1);

    case "ROTATE": {
      if (!state.current) return state;
      const def = PIECES[state.current.type];
      const nextRot = (state.current.rotation + 1) % def.shapes.length;
      const rotated = { ...state.current, rotation: nextRot };
      for (const kick of [0, 1, -1, 2, -2]) {
        const kicked = { ...rotated, x: rotated.x + kick };
        if (isValid(state.board, kicked)) return { ...state, current: kicked };
      }
      return state;
    }

    case "HARD_DROP": {
      if (!state.current) return state;
      let piece = state.current;
      while (isValid(state.board, { ...piece, y: piece.y + 1 })) {
        piece = { ...piece, y: piece.y + 1 };
      }
      return doLock({ ...state, current: piece });
    }

    default:
      return state;
  }
}
