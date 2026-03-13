// src/world/TileBuilder.js
// Tile + static group construction (WORLD helper).
//
// Responsibilities:
// - Create static groups for tile characters (g/d/L/R/[ ])
// - Create collectable/danger groups (leaf/fire)
// - Create boar group placeholder BEFORE Tiles() so 'b' spawns into it
// - Spawn everything from the level.tilemap via new Tiles(...)
// - Apply collider/sensor settings for leaf + fire
//
// Non-goals:
// - Does NOT control camera, parallax, or HUD
// - Does NOT implement boar AI (BoarSystem does)

import { buildBoarGroup } from "./BoarSystem.js";

export function buildTilesAndGroups(level) {
  // ---------------------------------------------------------------------------
  // 1) Validate the data contract from levels.json
  // ---------------------------------------------------------------------------

  const tilemap = level.levelData?.tilemap;
  if (!Array.isArray(tilemap) || tilemap.length === 0) {
    throw new Error(`[TileBuilder] level.levelData.tilemap is missing or empty.`);
  }

  const tiles = level.levelData?.tiles;
  if (!tiles || typeof tiles !== "object") {
    throw new Error(`[TileBuilder] levels.json is missing level.tiles { tileW, tileH, frameW, frameH }.`);
  }

  const tileW = Number(tiles.tileW);
  const tileH = Number(tiles.tileH);

  if (!Number.isFinite(tileW) || tileW <= 0) {
    throw new Error(`[TileBuilder] Invalid tiles.tileW in levels.json: ${tiles.tileW}`);
  }
  if (!Number.isFinite(tileH) || tileH <= 0) {
    throw new Error(`[TileBuilder] Invalid tiles.tileH in levels.json: ${tiles.tileH}`);
  }

  // Save for anyone who wants them later (debug/UI/etc.)
  level._tileW = tileW;
  level._tileH = tileH;

  // ---------------------------------------------------------------------------
  // 2) Build groups (IMPORTANT: set w/h on groups BEFORE new Tiles(...))
  // ---------------------------------------------------------------------------

  // --- boar group (spawn from 'b') ---
  // Must exist BEFORE Tiles() runs so 'b' characters spawn into this group.
  buildBoarGroup(level);

  // --- leaf group (spawn from 'x') ---
  level.leaf = new Group();
  level.leaf.physics = "static";
  level.leaf.spriteSheet = level.assets.leafImg;
  level.leaf.addAnis({ idle: { w: 32, h: 32, row: 0, frames: 5 } });
  level.leaf.w = 10;
  level.leaf.h = 6;
  level.leaf.anis.offset.x = 2;
  level.leaf.anis.offset.y = -4;
  level.leaf.tile = "x";

  // --- fire group (spawn from 'f') ---
  level.fire = new Group();
  level.fire.physics = "static";
  level.fire.spriteSheet = level.assets.fireImg;
  level.fire.addAnis({ burn: { w: 32, h: 32, row: 0, frames: 16 } });
  level.fire.w = 18;
  level.fire.h = 16;
  level.fire.tile = "f";

  // --- ground tile (g) ---
  level.ground = new Group();
  level.ground.physics = "static";
  level.ground.spriteSheet = level.assets.tileImg;
  level.ground.anis.w = 32;
  level.ground.anis.h = 32;
  level.ground.w = tileW;
  level.ground.h = tileH;
  level.ground.tile = "g";

  // --- deep ground tile (d) ---
  level.groundDeep = new Group();
  level.groundDeep.physics = "static";
  level.groundDeep.spriteSheet = level.assets.tileImg;
  level.groundDeep.anis.w = 32;
  level.groundDeep.anis.h = 32;
  level.groundDeep.w = tileW;
  level.groundDeep.h = tileH;
  level.groundDeep.tile = "d";

  // --- platform left cap (L) ---
  level.platformsL = new Group();
  level.platformsL.physics = "static";
  level.platformsL.spriteSheet = level.assets.tileImg;
  level.platformsL.anis.w = 32;
  level.platformsL.anis.h = 32;
  level.platformsL.w = tileW;
  level.platformsL.h = tileH;
  level.platformsL.tile = "L";

  // --- platform right cap (R) ---
  level.platformsR = new Group();
  level.platformsR.physics = "static";
  level.platformsR.spriteSheet = level.assets.tileImg;
  level.platformsR.anis.w = 32;
  level.platformsR.anis.h = 32;
  level.platformsR.w = tileW;
  level.platformsR.h = tileH;
  level.platformsR.tile = "R";

  // --- wall left ([) ---
  level.wallsL = new Group();
  level.wallsL.physics = "static";
  level.wallsL.spriteSheet = level.assets.tileImg;
  level.wallsL.anis.w = 32;
  level.wallsL.anis.h = 32;
  level.wallsL.w = tileW;
  level.wallsL.h = tileH;
  level.wallsL.tile = "[";

  // --- wall right (]) ---
  level.wallsR = new Group();
  level.wallsR.physics = "static";
  level.wallsR.spriteSheet = level.assets.tileImg;
  level.wallsR.anis.w = 32;
  level.wallsR.anis.h = 32;
  level.wallsR.w = tileW;
  level.wallsR.h = tileH;
  level.wallsR.tile = "]";

  // ---------------------------------------------------------------------------
  // 3) Spawn everything from the tilemap
  // ---------------------------------------------------------------------------

  new Tiles(tilemap, 0, 0, tileW, tileH);

  // Set frames for tileset
  for (const s of level.ground) s.frame = 0;
  for (const s of level.groundDeep) s.frame = 0;
  for (const s of level.platformsL) s.frame = 0;
  for (const s of level.platformsR) s.frame = 0;
  for (const s of level.wallsL) s.frame = 0;
  for (const s of level.wallsR) s.frame = 0;

  // ---------------------------------------------------------------------------
  // 4) Post-spawn adjustments
  // ---------------------------------------------------------------------------

  // fire overlap-only
  for (const s of level.fire) {
    s.collider = "static";
    s.sensor = true;
  }

  // leaves overlap-only (boars pass through)
  for (const s of level.leaf) s.removeColliders();
}