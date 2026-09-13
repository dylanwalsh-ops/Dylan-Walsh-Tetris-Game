import { useState, useEffect } from "react";

interface Props {
  onCreateRoom: (code: string) => void;
  onJoinRoom: (code: string) => void;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const BLOCK_COLORS = ["#00e5ff", "#ff2d78", "#ffbe00", "#cc44ff", "#00ff88", "#4488ff", "#ff8800"];

interface FallingBlock {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

function useFallingBlocks(count: number): FallingBlock[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 10 + Math.random() * 18,
    color: BLOCK_COLORS[i % BLOCK_COLORS.length],
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 8,
  }));
}

export default function Landing({ onCreateRoom, onJoinRoom }: Props) {
  const [mode, setMode] = useState<"idle" | "join">("idle");
  const [joinCode, setJoinCode] = useState("");
  const [blocks] = useState(() => useFallingBlocks(14));

  const handleCreate = () => {
    onCreateRoom(generateCode());
  };

  const handleJoin = () => {
    if (joinCode.length === 4) onJoinRoom(joinCode.toUpperCase());
  };

  return (
    <div
      className="size-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#08080f" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Falling blocks background */}
      {blocks.map((b) => (
        <div
          key={b.id}
          className="absolute pointer-events-none"
          style={{
            left: `${b.x}%`,
            top: "-40px",
            width: b.size,
            height: b.size,
            backgroundColor: `${b.color}18`,
            border: `1px solid ${b.color}44`,
            boxShadow: `0 0 8px ${b.color}33`,
            animation: `fall ${b.duration}s ${b.delay}s linear infinite`,
          }}
        />
      ))}

      {/* Logo */}
      <div className="relative z-10 text-center mb-14">
        <h1
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "clamp(72px, 14vw, 120px)",
            fontWeight: 700,
            color: "#00e5ff",
            letterSpacing: "-3px",
            lineHeight: 1,
            textShadow: "0 0 40px #00e5ff99, 0 0 100px #00e5ff44",
          }}
        >
          BLOKK
        </h1>
        <p
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            color: "#ffffff55",
            fontSize: 13,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginTop: 12,
            fontWeight: 500,
          }}
        >
          Drop blocks. Wreck your friends.
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex flex-col items-center gap-3 w-72">
        <button
          onClick={handleCreate}
          style={{
            width: "100%",
            padding: "16px 0",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            background: "#00e5ff",
            color: "#08080f",
            border: "none",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px #00e5ffaa")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
        >
          Create Room
        </button>

        {mode === "idle" ? (
          <button
            onClick={() => setMode("join")}
            style={{
              width: "100%",
              padding: "16px 0",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              background: "transparent",
              color: "#00e5ff",
              border: "1px solid #00e5ff44",
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#00e5ff88";
              el.style.boxShadow = "0 0 14px #00e5ff22";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#00e5ff44";
              el.style.boxShadow = "none";
            }}
          >
            Join Room
          </button>
        ) : (
          <div style={{ width: "100%", display: "flex", gap: 8 }}>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
              placeholder="ROOM"
              maxLength={4}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              style={{
                flex: 1,
                padding: "14px 12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 8,
                textAlign: "center",
                textTransform: "uppercase",
                background: "transparent",
                color: "#00e5ff",
                border: "1px solid #00e5ff55",
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00e5ff")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#00e5ff55")}
            />
            <button
              onClick={handleJoin}
              disabled={joinCode.length !== 4}
              style={{
                padding: "14px 18px",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                background: joinCode.length === 4 ? "#00e5ff" : "transparent",
                color: joinCode.length === 4 ? "#08080f" : "#00e5ff33",
                border: "1px solid #00e5ff44",
                cursor: joinCode.length === 4 ? "pointer" : "default",
                transition: "all 0.15s",
              }}
            >
              GO
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p
        className="absolute bottom-6"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: 4,
          color: "#ffffff1a",
          textTransform: "uppercase",
        }}
      >
        Two players · One grid war · No mercy
      </p>
    </div>
  );
}
