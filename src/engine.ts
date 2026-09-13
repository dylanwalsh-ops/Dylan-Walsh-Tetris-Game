export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type Cell = string | null;
export type Board = Cell[][];
export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export const PIECES: Record<PieceType, { shapes: number[][][]; color: string }> = {
  I: { shapes: [[[1, 1, 1, 1]], [[1], [1], [1], [1]]], color: "#00e5ff" },
  O: { shapes: [[[1, 1], [1, 1]]], color: "#ffbe00" },
  T: {
    shapes: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]],
    ],
    color: "#cc44ff",
  },
  S: { shapes: [[[0, 1, 1], [1, 1, 0]], [[1, 0], [1, 1], [0, 1]]], color: "#00ff88" },
  Z: { shapes: [[[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]]], color: "#ff4444" },
  J: {
    shapes: [
      [[1, 0, 0], [1, 1, 1]],
      [[1, 1], [1, 0], [1, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[0, 1], [0, 1], [1, 1]],
    ],
    color: "#4488ff",
  },
  L: {
    shapes: [
      [[0, 0, 1], [1, 1, 1]],
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]],
    ],
    color: "#ff8800",
  },
};

const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export interface ActivePiece {
  type: PieceType;
  rotation: number;
  x: number;
  y: number;
}

export function getShape(piece: ActivePiece): number[][] {
  const def = PIECES[piece.type];
  return def.shapes[piece.rotation % def.shapes.length];
}

export function getColor(type: PieceType): string {
  return PIECES[type].color;
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null) as Cell[]);
}

export function randomPiece(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

export function spawnPiece(type: PieceType): ActivePiece {
  const shape = PIECES[type].shapes[0];
  return {
    type,
    rotation: 0,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
  };
}

export function isValid(board: Board, piece: ActivePiece): boolean {
  const shape = getShape(piece);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false;
      if (y >= 0 && board[y][x]) return false;
    }
  }
  return true;
}

export function lockPiece(board: Board, piece: ActivePiece): Board {
  const shape = getShape(piece);
  const color = getColor(piece.type);
  const next = board.map((row) => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const y = piece.y + r;
      const x = piece.x + c;
      if (y >= 0 && y < BOARD_HEIGHT) next[y][x] = color;
    }
  }
  return next;
}

export function clearLines(board: Board): { board: Board; lines: number } {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const lines = BOARD_HEIGHT - kept.length;
  const empty = Array.from({ length: lines }, () => Array(BOARD_WIDTH).fill(null) as Cell[]);
  return { board: [...empty, ...kept], lines };
}

export function scoreLines(lines: number, level: number): number {
  const base = [0, 100, 300, 500, 800];
  return (base[Math.min(lines, 4)] ?? 0) * (level + 1);
}

export function getLevel(totalLines: number): number {
  return Math.floor(totalLines / 10);
}

export function dropInterval(level: number): number {
  return Math.max(80, 800 - level * 75);
}
