"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Drummer() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 3) * 0.3;
  });

  return (
    <mesh ref={ref} position={[-1.2, 0, 0]}>
      <boxGeometry args={[0.6, 0.8, 0.4]} />
      <meshStandardMaterial color="#ffccaa" />
    </mesh>
  );
}

function Guitarist() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.2;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[0.5, 0.9, 0.4]} />
      <meshStandardMaterial color="#aaccee" />
    </mesh>
  );
}

function Vocalist() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    ref.current.position.y = Math.sin(clock.elapsedTime * 1.5) * 0.05;
  });

  return (
    <mesh ref={ref} position={[1.2, 0, 0]}>
      <boxGeometry args={[0.5, 1, 0.4]} />
      <meshStandardMaterial color="#ccffaa" />
    </mesh>
  );
}

export default function BandScene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <spotLight position={[5, 5, 5]} intensity={1.2} />

      <Drummer />
      <Guitarist />
      <Vocalist />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </Canvas>
  );
}
