import { VoxelData } from "./VoxelCharacter";

const SKIN = "#ffccaa";
const SHIRT_W = "#FFFFFF";
const SUIT_B = "#111111";
const JEANS = "#334466";
const DRESS_RED = "#990000";

// Helper
function block(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, color: string): VoxelData {
    const v: VoxelData = [];
    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            for (let z = z1; z <= z2; z++) {
                v.push({ x, y, z, color });
            }
        }
    }
    return v;
}

// --- DRUMMER (Panda) ---
export const DRUMMER_BODY: VoxelData = [
    // Head 
    ...block(-2, 4, -2, 2, 7, 2, "#FFFFFF"),
    ...block(-3, 6, 0, -2, 7, 1, "#111"),
    ...block(2, 6, 0, 3, 7, 1, "#111"),
    ...block(-1, 5, 2, -1, 5, 2, "#111"),
    ...block(1, 5, 2, 1, 5, 2, "#111"),
    ...block(0, 4, 3, 0, 4, 3, "#111"),

    // Body (Sitting)
    ...block(-2, 1, -1, 2, 3, 1, "#111"),
    ...block(-1, 1, 2, 1, 3, 2, "#FFFFFF"),
];

export const DRUMMER_ARM_L: VoxelData = [
    ...block(-3, 3, 0, -3, 3, 2, "#111"), // Arm
    ...block(-3, 3, 3, -3, 5, 4, "#D4AF37"), // Stick
];

export const DRUMMER_ARM_R: VoxelData = [
    ...block(3, 3, 0, 3, 3, 2, "#111"), // Arm
    ...block(3, 3, 3, 3, 5, 4, "#D4AF37"), // Stick
];

export const DRUMMER_LEG_L: VoxelData = [
    ...block(-2, 0, 0, -1, 0, 2, "#111"), // Leg
    ...block(-2, 0, 3, -1, 0, 3, "#333"), // Foot/Shoe
];

export const DRUMMER_LEG_R: VoxelData = [
    ...block(1, 0, 0, 2, 0, 2, "#111"), // Leg
    ...block(1, 0, 3, 2, 0, 3, "#333"), // Foot/Shoe
];

export const INSTRUMENT_DRUMS: VoxelData = [
    ...block(-3, 1, 3, -2, 2, 4, "#CCCCCC"), // Snare L
    ...block(2, 1, 3, 3, 2, 4, "#CCCCCC"),   // Snare R
    ...block(-1, 0, 4, 1, 2, 5, "#DDDDDD"),  // Bass Drum
    ...block(-4, 0, 5, -3, 3, 6, "#B8860B"), // Cymbal Stand
    ...block(-5, 3, 4, -3, 3, 7, "#FFD700"), // Cymbal
];


// --- GUITARIST ---
export const GUITARIST_BODY: VoxelData = [
    // Head
    ...block(-1, 5, -1, 1, 7, 1, SKIN),
    ...block(-1, 7, -1, 1, 8, 1, "#FFD700"),
    ...block(-1, 6, 2, 1, 6, 2, "#111"), // Glasses

    // Body
    ...block(-1, 2, -1, 1, 4, 1, "#333"),
    ...block(-1, 0, -1, -1, 1, 0, "#55F"),
    ...block(1, 0, -1, 1, 1, 0, "#55F"),

    // Left Arm (Fretting)
    ...block(-2, 3, 1, -2, 4, 2, "#333"),
    ...block(-1, 3, 2, 0, 3, 3, SKIN),
];

export const GUITARIST_ARM_R: VoxelData = [
    ...block(2, 3, 0, 2, 4, 1, "#333"),
    ...block(2, 2, 1, 2, 3, 2, "#333"),
    ...block(1, 2, 2, 1, 2, 2, SKIN),
];

export const INSTRUMENT_GUITAR: VoxelData = [
    ...block(-2, 1, 3, 1, 3, 3, "#FF0000"),
    ...block(-1, 3, 3, 0, 6, 3, "#333"),
    ...block(-1, 6, 3, 0, 7, 3, "#FF0000"),
];


// --- BASSIST ---
export const BASSIST_BODY: VoxelData = [
    // Head (Hat?)
    ...block(-1, 5, -1, 1, 7, 1, SKIN),
    ...block(-1, 7, -1, 1, 8, 1, "#444"), // Hat/Hair

    // Body (Vest)
    ...block(-1, 2, -1, 1, 4, 1, "#553311"),
    ...block(-1, 0, -1, -1, 1, 0, JEANS),
    ...block(1, 0, -1, 1, 1, 0, JEANS),

    // Left Arm (Fretting High)
    ...block(-2, 3, 1, -2, 4, 2, SKIN),
    ...block(-3, 4, 2, -1, 4, 3, SKIN),
];

export const BASSIST_ARM_R: VoxelData = [
    ...block(2, 3, 0, 2, 4, 1, SKIN),
    ...block(2, 2, 1, 2, 3, 2, SKIN),
    ...block(1, 2, 2, 1, 2, 2, SKIN),
];

export const INSTRUMENT_BASS: VoxelData = [
    ...block(-2, 1, 3, 1, 3, 3, "#222"), // Dark Body
    ...block(-2, 3, 3, -1, 7, 3, "#553311"), // Long Neck
    ...block(-2, 7, 3, -1, 8, 3, "#222"), // Headstock
];


// --- PIANIST ---
export const PIANIST_BODY: VoxelData = [
    ...block(-1, 5, -1, 1, 7, 1, SKIN),
    ...block(-1, 7, -1, 1, 8, 1, "#553311"),

    ...block(-1, 2, -1, 1, 4, 1, SUIT_B),
    ...block(-1, 0, -1, 1, 1, 1, SUIT_B),
];

export const PIANIST_ARM_L: VoxelData = [
    ...block(-2, 3, 0, -2, 3, 2, SUIT_B),
    ...block(-2, 3, 3, -2, 3, 3, SKIN),
];

export const PIANIST_ARM_R: VoxelData = [
    ...block(2, 3, 0, 2, 3, 2, SUIT_B),
    ...block(2, 3, 3, 2, 3, 3, SKIN),
];

export const INSTRUMENT_PIANO: VoxelData = [
    ...block(-4, 2, 3, 4, 2, 6, "#111"),
    ...block(-4, 2, 3, 4, 3, 3, "#FFF"),
    ...block(-4, 0, 3, -3, 2, 3, "#111"),
    ...block(3, 0, 3, 4, 2, 3, "#111"),
    ...block(0, 0, 5, 1, 2, 5, "#111"),
    ...block(-4, 3, 4, 4, 3, 8, "#111"),
    ...block(-3, 4, 4, 3, 6, 8, "#111"),
];


// --- VOCALIST ---
export const VOCALIST_BODY: VoxelData = [
    // Head -> Elegant Lady
    ...block(-1, 5, -1, 1, 7, 1, SKIN),
    ...block(-2, 5, -2, 2, 8, -1, "#8B4513"), // Long Hair
    ...block(-2, 4, -1, -2, 8, 1, "#8B4513"),
    ...block(2, 4, -1, 2, 8, 1, "#8B4513"),

    // Body (Red Dress)
    ...block(-1, 2, -1, 1, 4, 1, DRESS_RED),
    ...block(-2, 0, -2, 2, 2, 2, DRESS_RED), // Skirt
];

export const VOCALIST_ARM_L: VoxelData = [
    ...block(-2, 3, 0, -2, 4, 1, DRESS_RED),
    ...block(-2, 2, 1, -2, 3, 2, SKIN), // Holding Mic stand?
];

export const VOCALIST_ARM_R: VoxelData = [
    ...block(2, 3, 0, 2, 4, 1, DRESS_RED), // Shoulder
    ...block(2, 3, 1, 3, 4, 2, SKIN), // Hand raised?
];

export const INSTRUMENT_MIC_STAND: VoxelData = [
    ...block(0, 0, 3, 0, 5, 3, "#888"), // Stand
    ...block(-1, 0, 2, 1, 0, 4, "#111"), // Base
    ...block(0, 5, 3, 0, 5, 4, "#333"), // Mic
];
