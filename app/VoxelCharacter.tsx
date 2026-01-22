"use client";

import { useMemo } from "react";
import * as THREE from "three";


export type VoxelData = {
    x: number;
    y: number;
    z: number;
    color: string;
}[];

export function VoxelPart({
    voxels,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1,
}: {
    voxels: VoxelData;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
}) {
    const instances = useMemo(() => {
        return voxels.map((v, i) => (
            <mesh
                key={i}
                position={[v.x * 0.1, v.y * 0.1, v.z * 0.1]}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.095, 0.095, 0.095]} />
                <meshStandardMaterial color={v.color} roughness={0.3} metalness={0.1} />
            </mesh>
        ));
    }, [voxels]);

    return (
        <group
            position={new THREE.Vector3(...position)}
            rotation={new THREE.Euler(...rotation)}
            scale={scale}
        >
            {instances}
        </group>
    );
}

// Keep VoxelCharacter as a wrapper for backward compatibility if needed, 
// or just for simple usage where we don't need parts.
export function VoxelCharacter({
    voxels,
    position = [0, 0, 0],
    scale = 1,
}: {
    voxels: VoxelData;
    position?: [number, number, number];
    scale?: number;
}) {
    return <VoxelPart voxels={voxels} position={position} scale={scale} />;
}
