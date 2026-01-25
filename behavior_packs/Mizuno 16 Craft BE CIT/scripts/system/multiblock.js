
import { Direction, system } from "@minecraft/server";

console.warn("=================================");
console.warn("[Multiblock] Module loaded - VERSION 2.0.0-DEBUG");
console.warn("=================================");


const REPLACEABLE_BLOCKS = [
  "minecraft:air",
  "minecraft:water",
  "minecraft:flowing_water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:snow_layer",
  "minecraft:tall_grass",
  "minecraft:short_grass",
  "minecraft:fern",
];


export class MultiblockComponent {
  constructor() {
    this.componentId = "cit:multiblock";
  }

  
  beforeOnPlayerPlace(event, componentData, onSetPermutation = null) {
    const { block, permutationToPlace, dimension } = event;
    const params = componentData?.params || componentData || {};

    if (!this.validateParams(params)) return;

    const { size, index, rotate = true } = params;
    const states = permutationToPlace.getAllStates();
    const direction = this.toDirection(states["minecraft:cardinal_direction"]);

    if (!direction && rotate) return;

    
    const placementBlocks = this.getPlacementBlocks(dimension, block.location, size, direction);

    
    if (!this.isPlaceable(placementBlocks)) {
      event.cancel = true;
      return;
    }

    
    event.cancel = true;

    const totalBlocks = size[0] * size[1] * size[2];
    const stateKeys = Object.keys(states);
    const stateCount = stateKeys.length;

    
    system.run(() => {
      for (let i = 0; i < totalBlocks; i++) {
        const targetBlock = placementBlocks[i];
        if (!targetBlock) continue;

        try {
          states[index] = i;
          let newPermutation = permutationToPlace;

          for (let j = 0; j < stateCount; j++) {
            const key = stateKeys[j];
            try {
              newPermutation = newPermutation.withState(key, states[key]);
            } catch (e) {}
          }

          if (onSetPermutation) {
            newPermutation = onSetPermutation(newPermutation, i, event);
          }

          
          targetBlock.setPermutation(newPermutation);
        } catch (e) {
          console.error(`Failed to set block at index ${i}:`, e);
        }
      }

      
      dimension.playSound(totalBlocks >= 8 ? "dig.stone" : "dig.wood", block.location);
    });
  }

  
  onPlayerBreak(event, componentData) {
    const { block, brokenBlockPermutation, dimension } = event;
    const params = componentData?.params || componentData || {};

    if (!this.validateParams(params)) return;

    const { size, index, rotate = true } = params;
    const direction = this.toDirection(brokenBlockPermutation.getState("minecraft:cardinal_direction"));

    if (!direction && rotate) return;

    const baseBlock = this.getBaseBlock(block, brokenBlockPermutation, params, direction);
    if (!baseBlock) return;

    const destroyBlocks = this.getDestroyBlocks(dimension, baseBlock.location, size, direction);
    if (!destroyBlocks || destroyBlocks.length !== size[0] * size[1] * size[2]) return;

    
    const blockType = brokenBlockPermutation.type.id;
    const blockX = block.location.x;
    const blockY = block.location.y;
    const blockZ = block.location.z;

    system.run(() => {
      for (let i = 0; i < destroyBlocks.length; i++) {
        const destroyBlock = destroyBlocks[i];
        if (!destroyBlock) continue;

        const loc = destroyBlock.location;
        if (loc.x === blockX && loc.y === blockY && loc.z === blockZ) continue;

        if (destroyBlock.typeId === blockType) {
          destroyBlock.setType("minecraft:air");
        }
      }
    });
  }

  
  validateParams(params) {
    if (typeof params !== "object" || params === null) return false;
    if (!params.size || !Array.isArray(params.size) || params.size.length !== 3) return false;
    if (!params.index || typeof params.index !== "string") return false;
    return true;
  }

  
  getPlacementBlocks(dimension, location, size, direction) {
    const [width, height, depth] = size;
    const totalBlocks = width * height * depth;
    const blocks = new Array(totalBlocks);

    const baseX = location.x;
    const baseY = location.y;
    const baseZ = location.z;

    let index = 0;
    for (let y = 0; y < height; y++) {
      const offsetY = baseY + y;
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
          let blockX, blockZ;

          switch (direction) {
            case Direction.South:
              blockX = baseX - x;
              blockZ = baseZ + z;
              break;
            case Direction.West:
              blockX = baseX - z;
              blockZ = baseZ - x;
              break;
            case Direction.North:
              blockX = baseX + x;
              blockZ = baseZ - z;
              break;
            case Direction.East:
              blockX = baseX + z;
              blockZ = baseZ + x;
              break;
            default:
              blockX = baseX + x;
              blockZ = baseZ + z;
          }

          blocks[index++] = dimension.getBlock({ x: blockX, y: offsetY, z: blockZ });
        }
      }
    }

    return blocks;
  }

  
  getBaseBlock(block, permutation, params, direction) {
    const index = permutation.getState(params.index);
    if (index === undefined || index === 0) return block;

    const { size } = params;
    const [width, height, depth] = size;
    const offsets = [];
    let currentIndex = 0;

    for (let y = 0; y < height; y++) {
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
          let offset;

          switch (direction) {
            case Direction.South:
              offset = { x: -x, y: y, z: z };
              break;
            case Direction.West:
              offset = { x: -z, y: y, z: -x };
              break;
            case Direction.North:
              offset = { x: x, y: y, z: -z };
              break;
            case Direction.East:
              offset = { x: z, y: y, z: x };
              break;
            default:
              offset = { x: x, y: y, z: z };
          }

          if (currentIndex === index) {
            const baseLocation = {
              x: block.location.x - offset.x,
              y: block.location.y - offset.y,
              z: block.location.z - offset.z,
            };
            return block.dimension.getBlock(baseLocation);
          }

          offsets.push(offset);
          currentIndex++;
        }
      }
    }

    return null;
  }

  
  getDestroyBlocks(dimension, baseLocation, size, direction) {
    return this.getPlacementBlocks(dimension, baseLocation, size, direction);
  }

  
  isPlaceable(blocks) {
    for (const block of blocks) {
      if (!block || !REPLACEABLE_BLOCKS.includes(block.typeId)) {
        return false;
      }
    }
    return true;
  }

  
  toDirection(cardinalDirection) {
    if (typeof cardinalDirection !== "string") return undefined;

    switch (cardinalDirection) {
      case "north":
        return Direction.North;
      case "east":
        return Direction.East;
      case "south":
        return Direction.South;
      case "west":
        return Direction.West;
      default:
        return undefined;
    }
  }
}


export const multiblock = new MultiblockComponent();
