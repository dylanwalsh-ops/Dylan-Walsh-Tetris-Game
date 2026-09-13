import {
  Board as BoardType,
  ActivePiece,
  getShape,
  getColor,
  isValid,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from "../game/engine";

const CELL = 24;

interface Props {
  board: BoardType;
  current: ActivePiece | null;
  label: string;
  accent: string;
}

interface DisplayCell {
  color: string | null;
  ghost: boolean;
}

export default function Board({ board, current, label, accent }: Props) {
  const grid: DisplayCell[][] = board.map((row) =>
    row.map((cell) => ({ color: cell, ghost: false }))
  );

  if (current) {
    // Ghost piece
    let ghost = current;
    while (isValid(board, { ...ghost, y: ghost.y + 1 })) {
      ghost = { ...ghost, y: ghost.y + 1 };
    }
    if (ghost.y !== current.y) {
      const shape = getShape(ghost);
      const color = getColor(ghost.type);
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const y = ghost.y + r;
          const x = ghost.x + c;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && !grid[y][x].color) {
            grid[y][x] = { color, ghost: true };
          }
        }
      }
    }

    // Active piece
    const shape = getShape(current);
    const color = getColor(current.type);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const y = current.y + r;
        const x = current.x + c;
        if (y >= 0 && y < BOARD_HEIGHT) {
          grid[y][x] = { color, ghost: false };
        }
      }
    }
  }

  return (
    <div>
      <div
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          color: accent,
          fontSize: 11,
          letterSpacing: 4,
          fontWeight: 700,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL}px)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL}px)`,
          border: `1px solid ${accent}28`,
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: 2,
          gap: 1,
        }}
      >
        {grid.flat().map((cell, i) => {
          const filled = cell.color && !cell.ghost;
          const isGhost = cell.color && cell.ghost;
          return (
            <div
              key={i}
              style={{
                width: CELL,
                height: CELL,
                backgroundColor: filled
                  ? cell.color!
                  : isGhost
                  ? `${cell.color}18`
                  : "rgba(255,255,255,0.018)",
                border: filled
                  ? `1px solid ${cell.color}cc`
                  : isGhost
                  ? `1px solid ${cell.color}44`
                  : "1px solid rgba(255,255,255,0.04)",
                boxShadow: filled
                  ? `0 0 8px ${cell.color}77, inset 0 0 4px ${cell.color}44`
                  : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
