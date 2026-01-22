"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Environment } from "@react-three/drei";
import { VoxelPart } from "./VoxelCharacter";
import {
  DRUMMER_BODY, DRUMMER_ARM_L, DRUMMER_ARM_R, DRUMMER_LEG_L, DRUMMER_LEG_R, INSTRUMENT_DRUMS,
  GUITARIST_BODY, GUITARIST_ARM_R, INSTRUMENT_GUITAR,
  BASSIST_BODY, BASSIST_ARM_R, INSTRUMENT_BASS,
  PIANIST_BODY, PIANIST_ARM_L, PIANIST_ARM_R, INSTRUMENT_PIANO,
  VOCALIST_BODY, VOCALIST_ARM_L, VOCALIST_ARM_R, INSTRUMENT_MIC_STAND
} from "./models";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

// --- Camera Controller ---
function CameraController({ zoom }: { zoom: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Smoothly interpolate camera position based on zoom level
    // Base position is Z=6, Y=2. Zoom modifies Z.
    const targetZ = zoom;
    const targetY = 2 + (zoom - 6) * 0.2; // Adjust height slightly with zoom

    camera.position.lerp(new THREE.Vector3(0, targetY, targetZ), 0.1);
    camera.lookAt(0, 0, -2); // Look at center of stage
  });
  return null;
}

// --- Character Components ---
function Drummer({ analyser, position, onPointerDown, isSelected }: any) {
  const leftArm = useRef<THREE.Group>(null!);
  const rightArm = useRef<THREE.Group>(null!);
  const rightLeg = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    let intensity = 0;
    let kick = 0;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      intensity = dataArray.slice(10, 20).reduce((a, b) => a + b, 0) / 10 / 255;
      kick = dataArray.slice(0, 5).reduce((a, b) => a + b, 0) / 5 / 255;
    } else {
      const t = clock.elapsedTime * 4;
      intensity = (Math.sin(t) + 1) / 2;
      kick = (Math.cos(t) + 1) / 2;
    }
    if (leftArm.current) leftArm.current.rotation.x = -intensity * 1.5;
    if (rightArm.current) rightArm.current.rotation.x = -intensity * 1.5;
    if (rightLeg.current) rightLeg.current.rotation.x = -kick * 0.5;
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
      <VoxelPart voxels={DRUMMER_BODY} />
      <VoxelPart voxels={DRUMMER_LEG_L} />
      <group ref={rightLeg}><VoxelPart voxels={DRUMMER_LEG_R} /></group>
      <group position={[-0.3, 0.4, 0]} ref={leftArm}><VoxelPart voxels={DRUMMER_ARM_L} position={[0.3, -0.4, 0]} /></group>
      <group position={[0.3, 0.4, 0]} ref={rightArm}><VoxelPart voxels={DRUMMER_ARM_R} position={[-0.3, -0.4, 0]} /></group>
      <VoxelPart voxels={INSTRUMENT_DRUMS} />
    </group>
  );
}

function Guitarist({ analyser, position, onPointerDown, isSelected }: any) {
  const rightArm = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const dataArray = useMemo(() => new Uint8Array(128), []);

  useFrame(({ clock }) => {
    let intensity = 0;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      intensity = dataArray.slice(30, 50).reduce((a, b) => a + b, 0) / 20 / 255;
    } else {
      intensity = (Math.sin(clock.elapsedTime * 8) + 1) / 2;
    }
    if (rightArm.current) {
      rightArm.current.rotation.z = Math.sin(clock.elapsedTime * 15) * 0.5 * intensity;
      rightArm.current.rotation.x = 0.2;
    }
    if (body.current) body.current.rotation.z = Math.sin(clock.elapsedTime * 4) * 0.1;
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
    let intensity = 0;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      intensity = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
    } else {
      intensity = (Math.sin(clock.elapsedTime * 4) + 1) / 2;
    }
    if (rightArm.current) rightArm.current.rotation.z = Math.sin(clock.elapsedTime * 8) * 0.3 * intensity;
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
    let act = 0;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      act = dataArray[40] / 255;
    } else {
      act = 0.5;
    }
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
      analyser.getByteFrequencyData(dataArray);
      val = dataArray.slice(20, 100).reduce((a, b) => a + b, 0) / 80 / 255;
    } else {
      val = (Math.sin(clock.elapsedTime * 2) + 1) / 2;
    }

    if (body.current) {
      body.current.rotation.y = Math.sin(clock.elapsedTime) * 0.2;
      body.current.rotation.x = Math.sin(clock.elapsedTime * 2) * 0.05 * val;
    }
    if (leftArm.current) leftArm.current.rotation.z = Math.sin(clock.elapsedTime * 3) * 0.5 * val;
    if (rightArm.current) rightArm.current.rotation.z = -Math.sin(clock.elapsedTime * 3) * 0.5 * val;
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
}

export default function BandScene({ analyser, positions, onPositionChange, onSelect, selectedId, zoom }: BandSceneProps) {

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

  return (
    <Canvas camera={{ position: [0, 2, zoom], fov: 45 }} shadows onPointerUp={handlePointerUp}>
      <CameraController zoom={zoom} />
      <ambientLight intensity={1.5} />
      <Environment preset="city" />

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

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
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
            color="#151515"
            metalness={0.6}
            mirror={0.7}
          />
        </mesh>
      </group>

      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 5, 25]} />
    </Canvas>
  );
}
