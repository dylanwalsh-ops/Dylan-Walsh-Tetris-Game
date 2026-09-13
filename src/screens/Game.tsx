import { useReducer, useEffect, useRef } from "react";
import { gameReducer, createInitialState, GameState } from "../game/reducer";
import { PIECES, dropInterval } from "../game/engine";
import { computeBestMove, BotTarget } from "../game/bot";
import Board from "../components/Board";
import NextPiece from "../components/NextPiece";

interface Props {
  roomCode: string;
  onExit: () => void;
}

function StatBlock({
  label,
  value,
  valueColor,
  align = "left",
}: {
  label: string;
  value: string | number;
  valueColor: string;
  align?: "left" | "right";
}) {
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 10,
          letterSpacing: 3,
          color: "#ffffff44",
          textTransform: "uppercase",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function Game({ roomCode, onExit }: Props) {
  const [human, humanDispatch] = useReducer(gameReducer, undefined, createInitialState);
  const [bot, botDispatch] = useReducer(gameReducer, undefined, createInitialState);
  const botTargetRef = useRef<BotTarget | null>(null);

  // Start both on mount
  useEffect(() => {
    humanDispatch({ type: "START" });
    botDispatch({ type: "START" });
  }, []);

  // Human gravity
  useEffect(() => {
    if (!human.started || human.gameOver) return;
    const id = setInterval(() => humanDispatch({ type: "TICK" }), dropInterval(human.level));
    return () => clearInterval(id);
  }, [human.started, human.gameOver, human.level]);

  // Bot gravity
  useEffect(() => {
    if (!bot.started || bot.gameOver) return;
    const id = setInterval(() => botDispatch({ type: "TICK" }), dropInterval(bot.level));
    return () => clearInterval(id);
  }, [bot.started, bot.gameOver, bot.level]);

  // Bot AI moves
  useEffect(() => {
    if (!bot.started || bot.gameOver || !bot.current) return;

    if (!botTargetRef.current) {
      botTargetRef.current = computeBestMove(bot.board, bot.current);
    }

    const target = botTargetRef.current;
    const current = bot.current;

    const id = setTimeout(() => {
      const def = PIECES[current.type];
      const curRot = current.rotation % def.shapes.length;
      const tgtRot = target.rotation % def.shapes.length;

      if (curRot !== tgtRot) {
        botDispatch({ type: "ROTATE" });
        return;
      }
      if (current.x < target.x) {
        botDispatch({ type: "MOVE_RIGHT" });
        return;
      }
      if (current.x > target.x) {
        botDispatch({ type: "MOVE_LEFT" });
        return;
      }
      botDispatch({ type: "HARD_DROP" });
      botTargetRef.current = null;
    }, 95);

    return () => clearTimeout(id);
  }, [bot]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (human.gameOver) return;
      switch (e.code) {
        case "ArrowLeft":
          humanDispatch({ type: "MOVE_LEFT" });
          break;
        case "ArrowRight":
          humanDispatch({ type: "MOVE_RIGHT" });
          break;
        case "ArrowDown":
          humanDispatch({ type: "MOVE_DOWN" });
          break;
        case "ArrowUp":
          e.preventDefault();
          humanDispatch({ type: "ROTATE" });
          break;
        case "Space":
          e.preventDefault();
          humanDispatch({ type: "HARD_DROP" });
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [human.gameOver]);

  const gameOver = human.gameOver || bot.gameOver;
  const humanWon = bot.gameOver && !human.gameOver;

  return (
    <div
      className="size-full flex flex-col relative"
      style={{ background: "#08080f", fontFamily: "'Rajdhani', sans-serif" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 32px",
          borderBottom: "1px solid rgba(0,229,255,0.08)",
        }}
      >
        <button
          onClick={onExit}
          style={{
            background: "none",
            border: "none",
            color: "#ffffff33",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 12,
            letterSpacing: 3,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff88")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff33")}
        >
          ← Exit
        </button>

        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#00e5ff",
            letterSpacing: 2,
            textShadow: "0 0 20px #00e5ff66",
          }}
        >
          BLOKK
        </span>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: 3,
            color: "#ffffff33",
          }}
        >
          {roomCode}
        </span>
      </div>

      {/* Game area */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ gap: 40, padding: "16px 24px" }}
      >
        {/* Human */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Board board={human.board} current={human.current} label="You" accent="#00e5ff" />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 90 }}>
            <div>
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 10,
                  letterSpacing: 3,
                  color: "#ffffff44",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Next
              </div>
              <NextPiece type={human.next} />
            </div>
            <StatBlock label="Score" value={human.score.toLocaleString()} valueColor="#ffbe00" />
            <StatBlock label="Lines" value={human.lines} valueColor="#00e5ff" />
            <StatBlock label="Level" value={human.level} valueColor="#cc44ff" />
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: "#ffffff22",
          }}
        >
          <div style={{ width: 1, height: 80, background: "rgba(255,255,255,0.07)" }} />
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            VS
          </span>
          <div style={{ width: 1, height: 80, background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Bot */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexDirection: "row-reverse" }}>
          <Board board={bot.board} current={bot.current} label="Bot" accent="#ff2d78" />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 90, alignItems: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 10,
                  letterSpacing: 3,
                  color: "#ffffff44",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Next
              </div>
              <NextPiece type={bot.next} />
            </div>
            <StatBlock label="Score" value={bot.score.toLocaleString()} valueColor="#ffbe00" align="right" />
            <StatBlock label="Lines" value={bot.lines} valueColor="#ff2d78" align="right" />
            <StatBlock label="Level" value={bot.level} valueColor="#cc44ff" align="right" />
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div
        style={{
          textAlign: "center",
          padding: "8px 0 14px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: 3,
          color: "#ffffff1a",
          textTransform: "uppercase",
        }}
      >
        ← → move · ↑ rotate · ↓ soft drop · space hard drop
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: "rgba(8,8,15,0.92)", backdropFilter: "blur(4px)" }}
        >
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(48px, 10vw, 80px)",
              fontWeight: 700,
              letterSpacing: -1,
              color: humanWon ? "#00e5ff" : "#ff2d78",
              textShadow: humanWon ? "0 0 50px #00e5ffaa" : "0 0 50px #ff2d78aa",
              marginBottom: 8,
            }}
          >
            {humanWon ? "YOU WIN" : "BOT WINS"}
          </div>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 13,
              letterSpacing: 5,
              color: "#ffffff44",
              textTransform: "uppercase",
              marginBottom: 32,
            }}
          >
            {humanWon ? "Not bad." : "Get wrecked."}
          </div>

          <div style={{ display: "flex", gap: 48, marginBottom: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: 3, color: "#ffffff44", marginBottom: 4, textTransform: "uppercase" }}
              >
                Your score
              </div>
              <div
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: "#ffbe00" }}
              >
                {human.score.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, letterSpacing: 3, color: "#ffffff44", marginBottom: 4, textTransform: "uppercase" }}
              >
                Bot score
              </div>
              <div
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, color: "#ff2d78" }}
              >
                {bot.score.toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={onExit}
            style={{
              padding: "16px 48px",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              background: "#00e5ff",
              color: "#08080f",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px #00e5ffaa")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
