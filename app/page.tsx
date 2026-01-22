"use client";

import BandScene from "./BandScene";
import YouTubePlayer from "./YouTubePlayer";
import { useState, useRef, useEffect } from "react";


const btnStyle = {
  background: '#333',
  border: '1px solid #555',
  color: 'white',
  borderRadius: 5,
  padding: '8px 12px',
  cursor: 'pointer',
  userSelect: 'none' as const,
  fontWeight: 'bold',
  fontSize: '0.9rem'
};

export default function Page() {
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // UI State
  const [zoom, setZoom] = useState(6);
  const [angle, setAngle] = useState(0);
  const [focus, setFocus] = useState<[number, number]>([0, 0]); // Camera Pan Focus
  const [theme, setTheme] = useState("City"); // Theme State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false); // Visualizer Toggle State
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

  // Pan Camera
  const handlePan = (dx: number, dz: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Pan relative to camera view
    const rdx = dx * cos - dz * sin;
    const rdz = dx * sin + dz * cos;
    setFocus(prev => [prev[0] + rdx, prev[1] + rdz]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setVideoId("");
    }
  };

  const handlePlayToggle = async () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        try {
          await audioRef.current.play();
        } catch (e) {
          console.log("Play interrupted or failed:", e);
        }
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Adjust move delta based on angle rotation so controls stay intuitive (relative to camera)
  // or keep them absolute (World Space). Keeping absolute for simplicity for now.
  const handleMove = (dx: number, dz: number) => {
    if (selectedId && positions[selectedId]) {
      // Rotate inputs by camera angle to make movements relative to view
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rdx = dx * cos - dz * sin;
      const rdz = dx * sin + dz * cos;

      setPositions(prev => ({
        ...prev,
        [selectedId]: [
          prev[selectedId][0] + rdx,
          prev[selectedId][1],
          prev[selectedId][2] + rdz
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

      audioRef.current.play().catch(e => console.log("Auto-play failed:", e));
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
        angle={angle}
        focus={focus}
        theme={theme}
        showVisualizer={showVisualizer}
      />

      <audio ref={audioRef} src={audioUrl || undefined} crossOrigin="anonymous" />
      {!audioUrl && <YouTubePlayer videoId={videoId} />}

      {/* Theme Selector (Top Left) */}
      <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 5, zIndex: 20 }}>
        {['City', 'Sea', 'Mountain', 'River', 'Nightclub'].map(t => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              ...btnStyle,
              background: theme === t ? '#d4af37' : '#333',
              color: theme === t ? '#000' : '#fff'
            }}
          >
            {t}
          </button>
        ))}
        {/* Visualizer Toggle */}
        <button
          onClick={() => setShowVisualizer(v => !v)}
          style={{
            ...btnStyle,
            background: showVisualizer ? '#d4af37' : '#333',
            color: showVisualizer ? '#000' : '#fff',
            marginLeft: 10
          }}
        >
          👁️ Visualizer
        </button>
      </div>

      {/* Center Top: Info & Play */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 0 10px black' }}>RETRO BAND PLAYER</h1>
        <p style={{ margin: '5px 0', fontSize: '0.8rem', opacity: 0.7 }}>Click &rarr; Control</p>

        {/* Play Button Moved Here */}
        <div style={{ pointerEvents: 'auto', marginTop: 10 }}>
          <button onClick={handlePlayToggle} style={{ ...btnStyle, fontSize: '1.2rem', padding: '8px 25px', background: '#d4af37', color: '#000', boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}>
            ▶ / ⏸ PLAY
          </button>
        </div>
      </div>

      {/* Top Right: Zoom & Rotate Controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => setZoom(z => Math.max(2, z - 1))} style={btnStyle}>➕ Zoom In</button>
          <button onClick={() => setZoom(z => Math.min(15, z + 1))} style={btnStyle}>➖ Zoom Out</button>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => setAngle(a => a - 0.2)} style={btnStyle}>↺ Rotate Left</button>
          <button onClick={() => setAngle(a => a + 0.2)} style={btnStyle}>↻ Rotate Right</button>
        </div>
      </div>

      {/* Bottom Right: D-Pad (Camera Pan) */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'grid', gridTemplateColumns: '40px 40px 40px', gridTemplateRows: '40px 40px', gap: 5 }}>
        <div />
        {/* Up: Pan Forward */}
        <button onClick={() => handlePan(0, -1)} style={btnStyle}>▲</button>
        <div />
        {/* Left: Pan Left */}
        <button onClick={() => handlePan(-1, 0)} style={btnStyle}>◀</button>
        {/* Down: Pan Backward */}
        <button onClick={() => handlePan(0, 1)} style={btnStyle}>▼</button>
        {/* Right: Pan Right */}
        <button onClick={() => handlePan(1, 0)} style={btnStyle}>▶</button>
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


      {/* Mobile Landscape Overlay */}
      <div className="mobile-overlay">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>↻</div>
          <h2>Please Rotate Your Device</h2>
          <p>This experience is best viewed in landscape mode.</p>
        </div>
      </div>

      <style jsx global>{`
        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #111;
          color: white;
          z-index: 9999;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        @media screen and (orientation: portrait) and (max-width: 768px) {
          .mobile-overlay {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}


