"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Environment } from "@react-three/drei";
import { VoxelPart } from "./VoxelCharacter";
import AudioReactiveBlob from "./AudioReactiveBlob";
import {
  DRUMMER_BODY, DRUMMER_ARM_L, DRUMMER_ARM_R, DRUMMER_LEG_L, DRUMMER_LEG_R, INSTRUMENT_DRUMS,
  GUITARIST_BODY, GUITARIST_ARM_R, INSTRUMENT_GUITAR,
  BASSIST_BODY, BASSIST_ARM_R, INSTRUMENT_BASS,
  PIANIST_BODY, PIANIST_ARM_L, PIANIST_ARM_R, INSTRUMENT_PIANO,
  VOCALIST_BODY, VOCALIST_ARM_L, VOCALIST_ARM_R, INSTRUMENT_MIC_STAND
} from "./models";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

// --- Audio Analysis Helper ---
const getFrequencyBands = (analyser: AnalyserNode, dataArray: any) => {
  analyser.getByteFrequencyData(dataArray);

  // Bass: 0~10 index avg normalized to 0~100 (User Request)
  let bass = 0;
  for (let i = 0; i < 10; i++) bass += dataArray[i];
  bass /= 10 * 2.55;

  // Mid: 20~50 index avg normalized
  let mid = 0;
  for (let i = 20; i < 50; i++) mid += dataArray[i];
  mid /= 30 * 2.55;

  // High: 80+ index avg normalized
  let high = 0;
  for (let i = 80; i < dataArray.length; i++) high += dataArray[i];
  high /= (dataArray.length - 80) * 2.55;

  return { bass, mid, high };
};

// --- Camera Controller ---
function CameraController({ zoom, angle, focus }: { zoom: number, angle: number, focus: [number, number] }) {
  const { camera } = useThree();
  const currentFocus = useRef(new THREE.Vector3(focus[0], 0, focus[1]));

  useFrame(() => {
    // Smoothly interpolate currentFocus towards target focus
    const targetFocus = new THREE.Vector3(focus[0], 0, focus[1]);
    currentFocus.current.lerp(targetFocus, 0.1);

    // Orbital Camera Logic with Pan (Smoothed Focus)
    const x = zoom * Math.sin(angle);
    const z = zoom * Math.cos(angle);
    const targetY = 2 + (zoom - 6) * 0.2;

    // Camera position follows the smoothed focus
    const targetPos = new THREE.Vector3(
      x + currentFocus.current.x,
      targetY,
      z + currentFocus.current.z
    );

    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(currentFocus.current);
  });
  return null;
}

// --- Scene Effects (Strobe, etc) ---
function SceneEffects({ theme }: { theme: string }) {
  const strobeRef = useRef<THREE.SpotLight>(null!);

  useFrame(({ clock }) => {
    if (theme === 'Nightclub' && strobeRef.current) {
      strobeRef.current.intensity = Math.sin(clock.elapsedTime * 20) > 0 ? 500 : 0;
      strobeRef.current.color.setHSL((clock.elapsedTime * 0.5) % 1, 1, 0.5);
    }
  });

  if (theme !== 'Nightclub') return null;

  return (
    <spotLight ref={strobeRef} position={[0, 10, 0]} angle={1} penumbra={1} />
  );
}

// --- Floating Notes Effect ---
import { Text } from "@react-three/drei";

function FloatingNotes({ analyser }: { analyser?: AnalyserNode }) {
  const [notes, setNotes] = useState<{ id: number, x: number, y: number, z: number, opacity: number, vel: number }[]>([]);
  const frameRef = useRef(0);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    // Spawn notes based on kick/bass
    let spawn = false;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      // Check bass frequencies for kick
      const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      if (bass > 200 && Math.random() > 0.8) spawn = true;
    } else {
      // Auto pattern if no audio
      if (Math.random() > 0.97) spawn = true;
    }

    if (spawn) {
      const id = Date.now() + Math.random();
      setNotes(prev => [
        ...prev,
        {
          id,
          x: (Math.random() - 0.5) * 8, // Random width across stage
          y: 0,
          z: (Math.random() - 0.5) * 4 - 2,
          opacity: 1,
          vel: 0.02 + Math.random() * 0.03
        }
      ]);
    }

    // Update notes
    setNotes(prev => prev.map(n => ({
      ...n,
      y: n.y + n.vel,
      opacity: n.opacity - 0.01
    })).filter(n => n.opacity > 0));
  });

  return (
    <group>
      {notes.map(n => (
        <Text
          key={n.id}
          position={[n.x, n.y, n.z]}
          fontSize={0.5}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          fillOpacity={n.opacity}
        >
          {Math.random() > 0.5 ? "♪" : "♫"}
        </Text>
      ))}
    </group>
  );
}

// --- Character Components ---
function Drummer({ analyser, position, onPointerDown, isSelected }: any) {
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const rightLeg = useRef<THREE.Group>(null!);
  const bodyGroup = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    let bass = 0;

    if (analyser) {
      const bands = getFrequencyBands(analyser, dataArray);
      bass = bands.bass;
    } else {
      // Auto animation
      const t = clock.elapsedTime * 4;
      bass = (Math.cos(t) + 1) * 30; // Simulate ~60 value
    }

    // Apply animation based on normalized 0-100 value
    // Scale down significantly for 3D scene (100 -> ~1.0 or less)
    const intensity = bass * 0.01;

    // Boosted Intensity
    if (leftArm.current) leftArm.current.rotation.x = -intensity * 2.5;
    if (rightArm.current) rightArm.current.rotation.x = -intensity * 2.5;
    if (rightLeg.current) rightLeg.current.rotation.x = -intensity * 1.5;

    // Body Bounce (User Request: bounce with bass)
    if (bodyGroup.current) {
      // Reduced multiplier from 0.5 to 0.02 to fit scene scale
      bodyGroup.current.position.y = Math.sin(clock.elapsedTime * 20 + bass * 0.1) * bass * 0.005;
    }
  });

  return (
    <group position={position} onPointerDown={onPointerDown}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="cyan" opacity={0.5} transparent side={THREE.DoubleSide} />
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </mesh>
      )}
      <group ref={bodyGroup}>
        <VoxelPart voxels={DRUMMER_BODY} />
        <VoxelPart voxels={DRUMMER_LEG_L} />
        <group ref={rightLeg}><VoxelPart voxels={DRUMMER_LEG_R} /></group>
        <group position={[-0.3, 0.4, 0]} ref={leftArm}><VoxelPart voxels={DRUMMER_ARM_L} position={[0.3, -0.4, 0]} /></group>
        <group position={[0.3, 0.4, 0]} ref={rightArm}><VoxelPart voxels={DRUMMER_ARM_R} position={[-0.3, -0.4, 0]} /></group>
      </group>
      <VoxelPart voxels={INSTRUMENT_DRUMS} />
    </group>
  );
}

function Guitarist({ analyser, position, onPointerDown, isSelected }: any) {
  const rightArm = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    let mid = 0;
    let high = 0;

    if (analyser) {
      const bands = getFrequencyBands(analyser, dataArray);
      mid = bands.mid;
      high = bands.high;
    } else {
      mid = (Math.sin(clock.elapsedTime * 8) + 1) * 40;
    }

    const intensity = mid * 0.01;
    const shake = high * 0.01;

    if (rightArm.current) {
      // Strumming
      rightArm.current.rotation.z = Math.sin(clock.elapsedTime * 15) * 0.8 * intensity + (shake * 0.2);
      rightArm.current.rotation.x = 0.3;
    }
    if (body.current) {
      // Sway to Mid/High
      body.current.rotation.z = Math.sin(clock.elapsedTime * 4) * 0.2 * intensity;
      body.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.1 * shake;
    }
  });

  return (
    <group position={position} rotation={[0, -0.3, 0]} onPointerDown={onPointerDown}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="cyan" opacity={0.5} transparent side={THREE.DoubleSide} />
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </mesh>
      )}
      <group ref={body}>
        <VoxelPart voxels={GUITARIST_BODY} />
        <VoxelPart voxels={INSTRUMENT_GUITAR} />
        <group position={[0.2, 0.4, 0.1]} ref={rightArm}><VoxelPart voxels={GUITARIST_ARM_R} position={[-0.2, -0.4, -0.1]} /></group>
      </group>
    </group>
  );
}

function Bassist({ analyser, position, onPointerDown, isSelected }: any) {
  const rightArm = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    let bass = 0;
    let mid = 0;

    if (analyser) {
      const bands = getFrequencyBands(analyser, dataArray);
      bass = bands.bass;
      mid = bands.mid;
    } else {
      bass = (Math.sin(clock.elapsedTime * 4) + 1) * 40;
    }

    const intensity = bass * 0.01;
    const strum = mid * 0.005;

    if (rightArm.current) rightArm.current.rotation.z = Math.sin(clock.elapsedTime * 8) * 0.3 * intensity + strum;
    if (body.current) body.current.rotation.x = Math.sin(clock.elapsedTime * 8) * 0.1 * intensity;
  });

  return (
    <group position={position} rotation={[0, 0.3, 0]} onPointerDown={onPointerDown}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="cyan" opacity={0.5} transparent side={THREE.DoubleSide} />
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </mesh>
      )}
      <group ref={body}>
        <VoxelPart voxels={BASSIST_BODY} />
        <VoxelPart voxels={INSTRUMENT_BASS} />
        <group position={[0.2, 0.4, 0.1]} ref={rightArm}><VoxelPart voxels={BASSIST_ARM_R} position={[-0.2, -0.4, -0.1]} /></group>
      </group>
    </group>
  );
}

function Pianist({ analyser, position, onPointerDown, isSelected }: any) {
  const leftHand = useRef<THREE.Group>(null!);
  const rightHand = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    let mid = 0;
    let high = 0;

    if (analyser) {
      const bands = getFrequencyBands(analyser, dataArray);
      mid = bands.mid;
      high = bands.high;
    } else {
      mid = 50;
      high = 30;
    }

    const act = (mid + high) * 0.005;

    if (leftHand.current) leftHand.current.position.y = Math.sin(t * 10) * 0.05 * act;
    if (rightHand.current) rightHand.current.position.y = Math.cos(t * 12) * 0.05 * act;
  });

  return (
    <group position={position} rotation={[0, 0.5, 0]} onPointerDown={onPointerDown}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="cyan" opacity={0.5} transparent side={THREE.DoubleSide} />
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </mesh>
      )}
      <VoxelPart voxels={PIANIST_BODY} />
      <VoxelPart voxels={INSTRUMENT_PIANO} />
      <group ref={leftHand}><VoxelPart voxels={PIANIST_ARM_L} /></group>
      <group ref={rightHand}><VoxelPart voxels={PIANIST_ARM_R} /></group>
    </group>
  );
}

function Vocalist({ analyser, position, onPointerDown, isSelected }: any) {
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    let val = 0;
    if (analyser) {
      const bands = getFrequencyBands(analyser, dataArray);
      val = (bands.mid + bands.high) * 0.005; // Average intensity scaled down
    } else {
      val = (Math.sin(clock.elapsedTime * 2) + 1) * 0.5;
    }

    if (body.current) {
      body.current.rotation.y = Math.sin(clock.elapsedTime) * 0.4; // Wider sway
      body.current.rotation.x = Math.sin(clock.elapsedTime * 4) * 0.1 * val; // Faster bob
      body.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 5)) * 0.1 * val; // Jumping effect
    }
    if (leftArm.current) leftArm.current.rotation.z = Math.sin(clock.elapsedTime * 5) * 0.8 * val; // Energetic arms
    if (rightArm.current) rightArm.current.rotation.z = -Math.sin(clock.elapsedTime * 5) * 0.8 * val;
  });

  return (
    <group position={position} ref={body} onPointerDown={onPointerDown}>
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="cyan" opacity={0.5} transparent side={THREE.DoubleSide} />
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </mesh>
      )}
      <VoxelPart voxels={VOCALIST_BODY} />
      <VoxelPart voxels={INSTRUMENT_MIC_STAND} />
      <group position={[-0.2, 0.4, 0]} ref={leftArm}><VoxelPart voxels={VOCALIST_ARM_L} position={[0.2, -0.4, 0]} /></group>
      <group position={[0.2, 0.4, 0]} ref={rightArm}><VoxelPart voxels={VOCALIST_ARM_R} position={[-0.2, -0.4, 0]} /></group>
    </group>
  );
}

// --- Main Scene ---
interface BandSceneProps {
  analyser?: AnalyserNode;
  positions: { [key: string]: [number, number, number] };
  onPositionChange: (id: string, newPos: [number, number, number]) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  zoom: number;
  angle: number;
  focus: [number, number]; // New prop
  theme: string;
  showVisualizer?: boolean;
  visualizerColor?: string;
}

function VoxelBackdrop({ theme }: { theme: string }) {
  // Simple blocky representations for themes
  const color = useMemo(() => {
    switch (theme) {
      case 'Sea': return '#4488ff';
      case 'Mountain': return '#558855';
      case 'City': return '#444455';
      case 'Nightclub': return '#220033';
      case 'Roadside': return '#666666';
      case 'River': return '#44aa88';
      default: return '#111';
    }
  }, [theme]);

  if (theme === 'Nightclub') {
    return (
      <group position={[0, 0, -10]}>
        {/* Neon blocks */}
        {[...Array(20)].map((_, i) => (
          <mesh key={i} position={[(Math.random() - 0.5) * 30, (Math.random()) * 10, (Math.random()) * 5 - 5]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={Math.random() > 0.5 ? "#ff00ff" : "#00ffff"} emissive={Math.random() > 0.5 ? "#ff00ff" : "#00ffff"} emissiveIntensity={2} />
          </mesh>
        ))}
      </group>
    )
  }

  if (theme === 'City') {
    return (
      <group position={[0, -2, -15]}>
        {[...Array(15)].map((_, i) => (
          <mesh key={i} position={[(i - 7) * 3, 2 + Math.random() * 5, 0]}>
            <boxGeometry args={[2, 10 + Math.random() * 10, 2]} />
            <meshStandardMaterial color="#333" roughness={0.5} />
          </mesh>
        ))}
      </group>
    )
  }

  if (theme === 'Sea') {
    return (
      <group position={[0, -2, -20]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[50, 4, 10]} />
          <meshStandardMaterial color="#0055aa" />
        </mesh>
        {/* Sun */}
        <mesh position={[0, 10, -10]}>
          <boxGeometry args={[4, 4, 1]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" />
        </mesh>
      </group>
    )
  }

  if (theme === 'Mountain') {
    return (
      <group position={[0, -2, -15]}>
        <mesh position={[-10, 5, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[10, 15, 4]} />
          <meshStandardMaterial color="#446644" flatShading />
        </mesh>
        <mesh position={[10, 5, -5]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[12, 18, 4]} />
          <meshStandardMaterial color="#557755" flatShading />
        </mesh>
      </group>
    )
  }

  return null;
}

export default function BandScene({ analyser, positions, onPositionChange, onSelect, selectedId, zoom, angle, focus, theme, showVisualizer, visualizerColor }: BandSceneProps) {

  // Internal drag state just for the active drag operation
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handlePointerDown = (e: any, id: string) => {
    e.stopPropagation();
    setDraggedId(id);
    onSelect(id);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    setDraggedId(null);
    document.body.style.cursor = 'auto';
  };

  const handlePlaneMove = (e: any) => {
    if (!draggedId) return;
    const newPos = e.point;
    onPositionChange(draggedId, [newPos.x, 0, newPos.z]);
  };

  // Theme Config
  const themeConfig = useMemo(() => {
    switch (theme) {
      case 'Sea': return { bg: '#88ccff', fog: ['#88ccff', 5, 40], preset: 'sunset' as const };
      case 'Mountain': return { bg: '#cceeff', fog: ['#cceeff', 10, 50], preset: 'park' as const };
      case 'City': return { bg: '#111122', fog: ['#111122', 5, 30], preset: 'city' as const };
      case 'Nightclub': return { bg: '#000000', fog: ['#000000', 2, 20], preset: 'night' as const };
      case 'River': return { bg: '#aaddcc', fog: ['#aaddcc', 5, 40], preset: 'forest' as const };
      case 'Roadside': return { bg: '#333333', fog: ['#333333', 5, 30], preset: 'apartment' as const };
      default: return { bg: '#050505', fog: ['#050505', 5, 25], preset: 'city' as const };
    }
  }, [theme]);

  // Removed useFrame here

  return (
    <Canvas camera={{ position: [0, 2, zoom], fov: 45 }} shadows onPointerUp={handlePointerUp}>
      <CameraController zoom={zoom} angle={angle} focus={focus} />
      <ambientLight intensity={theme === 'Nightclub' ? 0.2 : 1.5} />
      <Environment preset={themeConfig.preset} />
      <VoxelBackdrop theme={theme} />
      <SceneEffects theme={theme} />
      <FloatingNotes analyser={analyser} />

      {showVisualizer && <AudioReactiveBlob analyser={analyser} color={visualizerColor} />}

      {/* Spotlights */}
      <spotLight position={[0, 10, 5]} intensity={200} castShadow color="#ffd700" angle={0.5} />
      <spotLight position={[-4, 5, 2]} intensity={100} color="#ff4444" angle={0.4} />
      <spotLight position={[4, 5, 2]} intensity={100} color="#4444ff" angle={0.4} />

      {/* Invisible Drag Plane */}
      {draggedId && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
          visible={false}
          onPointerMove={handlePlaneMove}
          onPointerUp={handlePointerUp}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color="red" wireframe />
        </mesh>
      )}

      {/* Stage Group */}
      <group position={[0, -1, 0]}>

        <Drummer
          analyser={analyser}
          position={positions.drummer}
          onPointerDown={(e: any) => handlePointerDown(e, 'drummer')}
          isSelected={selectedId === 'drummer'}
        />
        <Pianist
          analyser={analyser}
          position={positions.pianist}
          onPointerDown={(e: any) => handlePointerDown(e, 'pianist')}
          isSelected={selectedId === 'pianist'}
        />
        <Bassist
          analyser={analyser}
          position={positions.bassist}
          onPointerDown={(e: any) => handlePointerDown(e, 'bassist')}
          isSelected={selectedId === 'bassist'}
        />
        <Vocalist
          analyser={analyser}
          position={positions.vocalist}
          onPointerDown={(e: any) => handlePointerDown(e, 'vocalist')}
          isSelected={selectedId === 'vocalist'}
        />
        <Guitarist
          analyser={analyser}
          position={positions.guitarist}
          onPointerDown={(e: any) => handlePointerDown(e, 'guitarist')}
          isSelected={selectedId === 'guitarist'}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
          onPointerDown={(e) => {
            // Only deselect if we are strictly clicking the floor
            onSelect(null);
          }}
        >
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={50}
            roughness={0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color={theme === 'Nightclub' ? '#000' : '#222'}
            metalness={0.6}
            mirror={0.7}
          />
        </mesh>
      </group>

      <color attach="background" args={[themeConfig.bg]} />
      <fog attach="fog" args={themeConfig.fog as [string, number, number]} />
    </Canvas>
  );
}
