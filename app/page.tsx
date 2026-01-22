"use client";

import BandScene from "./BandScene";
import YouTubePlayer from "./YouTubePlayer";
import { useState, useRef, useEffect } from "react";

export default function Page() {
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // UI State
  const [zoom, setZoom] = useState(6);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [positions, setPositions] = useState<{ [key: string]: [number, number, number] }>({
    drummer: [0, 0, -4],
    pianist: [-3, 0, -3],
    bassist: [-3, 0, -2],
    vocalist: [0, 0, -1],
    guitarist: [3, 0, -2],
  });

  // Refs for Audio API
  const audioContextRef = useRef<AudioContext>(null!);
  const sourceRef = useRef<MediaElementAudioSourceNode>(null!);
  const audioRef = useRef<HTMLAudioElement>(null!);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setVideoId("");
    }
  };

  const handlePlayToggle = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleMove = (dx: number, dz: number) => {
    if (selectedId && positions[selectedId]) {
      setPositions(prev => ({
        ...prev,
        [selectedId]: [
          prev[selectedId][0] + dx,
          prev[selectedId][1],
          prev[selectedId][2] + dz
        ]
      }));
    }
  };

  const handlePositionChange = (id: string, newPos: [number, number, number]) => {
    setPositions(prev => ({
      ...prev,
      [id]: newPos
    }));
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      setAnalyser(analyserNode);

      if (sourceRef.current) sourceRef.current.disconnect();

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);
      sourceRef.current = source;

      audioRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div style={{ height: "100vh", background: "#111", color: "#fff", position: 'relative', overflow: 'hidden' }}>
      {/* 3D Scene */}
      <BandScene
        analyser={analyser || undefined}
        positions={positions}
        onPositionChange={handlePositionChange}
        onSelect={setSelectedId}
        selectedId={selectedId}
        zoom={zoom}
      />

      <audio ref={audioRef} src={audioUrl || undefined} crossOrigin="anonymous" />
      {!audioUrl && <YouTubePlayer videoId={videoId} />}

      {/* Top Right: Zoom Controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 5 }}>
        <button onClick={() => setZoom(z => Math.max(2, z - 1))} style={btnStyle}>➕ Zoom In</button>
        <button onClick={() => setZoom(z => Math.min(15, z + 1))} style={btnStyle}>➖ Zoom Out</button>
      </div>

      {/* Center Top: Info */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 0 10px black' }}>RETRO BAND PLAYER</h1>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Click character to select &rarr; Drag or use Arrows</p>
      </div>

      {/* Bottom Center: Play/Stop */}
      <div style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)' }}>
        <button onClick={handlePlayToggle} style={{ ...btnStyle, fontSize: '1.5rem', padding: '10px 30px', background: '#d4af37', color: '#000' }}>
          ▶ / ⏸
        </button>
      </div>

      {/* Bottom Right: D-Pad */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'grid', gridTemplateColumns: '40px 40px 40px', gridTemplateRows: '40px 40px', gap: 5 }}>
        <div />
        <button onClick={() => handleMove(0, -0.5)} style={btnStyle}>▲</button>
        <div />
        <button onClick={() => handleMove(-0.5, 0)} style={btnStyle}>◀</button>
        <button onClick={() => handleMove(0, 0.5)} style={btnStyle}>▼</button>
        <button onClick={() => handleMove(0.5, 0)} style={btnStyle}>▶</button>
      </div>

      {/* Bottom Left: Files */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          padding: 15,
          background: "rgba(0,0,0,0.8)",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <strong>Local MP3:</strong>
          <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ color: '#fff', width: 200 }} />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <strong>YouTube:</strong>
          <input
            style={{ padding: 5, borderRadius: 4, border: "1px solid #444", background: "#222", color: "#fff", width: 120 }}
            value={videoId}
            placeholder="ID"
            onChange={(e) => {
              setVideoId(e.target.value);
              setAudioUrl(null);
              if (analyser) setAnalyser(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: '#333',
  border: '1px solid #555',
  color: 'white',
  borderRadius: 5,
  padding: '8px 12px',
  cursor: 'pointer',
  userSelect: 'none' as const,
  fontWeight: 'bold'
};
