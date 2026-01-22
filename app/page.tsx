"use client";

import BandScene from "./BandScene";
import YouTubePlayer from "./YouTubePlayer";
import { useState } from "react";

export default function Page() {
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");

  return (
    <div style={{ height: "100vh", background: "#111" }}>
      <YouTubePlayer videoId={videoId} />
      <BandScene />

      <input
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          padding: 8,
        }}
        placeholder="YouTube Video ID"
        onChange={(e) => setVideoId(e.target.value)}
      />
    </div>
  );
}
