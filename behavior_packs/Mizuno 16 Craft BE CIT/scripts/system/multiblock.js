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
    const { block, permutationToPlace, dimension, player } = event;
    const params = componentData?.params || componentData || {};

    console.warn(`[Multiblock] 开始处理 ${permutationToPlace.type.id}`);

    if (!this.validateParams(params)) {
      console.warn(`[Multiblock] 参数验证失败`);
      return;
    }

    const { size, index, rotate = true, downward = false } = params;
    const states = permutationToPlace.getAllStates();
    let direction = this.toDirection(states["minecraft:cardinal_direction"]);

    console.warn(
      `[Multiblock] size: ${size}, blockFace: ${states["minecraft:block_face"]}, direction: ${direction}, downward: ${downward}`
    );

    // 处理down面放置的情况
    const blockFace = states["minecraft:block_face"];
    if (!direction && rotate) {
      if (blockFace === "down") {
        // down面放置时使用默认方向（North）
        direction = Direction.North;
        console.warn(`[Multiblock] down面放置，使用North方向`);
      } else {
        // 其他面没有方向信息时返回
        console.warn(`[Multiblock] 非down面且无方向信息，退出`);
        return;
      }
    }

    const placementBlocks = this.getPlacementBlocks(dimension, block.location, size, direction, downward);
    console.warn(`[Multiblock] Found ${placementBlocks.length} placement blocks`);

    if (!this.isPlaceable(placementBlocks)) {
      console.warn(`[Multiblock] 无法放置，原因：`);
      for (let i = 0; i < placementBlocks.length; i++) {
        const block = placementBlocks[i];
        if (block && !REPLACEABLE_BLOCKS.includes(block.typeId)) {
          console.warn(`[Multiblock] 位置${i}: ${block.typeId} 不可替换`);
        }
      }
      event.cancel = true;
      return;
    }

    console.warn(`[Multiblock] 方块可以放置，开始生成`);

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

      // 减少玩家手中的物品数量
      if (player) {
        try {
          const container = player.getComponent("inventory")?.container;
          const item = container?.getItem(player.selectedSlotIndex);
          if (container && item) {
            if (item.amount > 1) {
              item.amount -= 1;
              container.setItem(player.selectedSlotIndex, item);
            } else {
              container.setItem(player.selectedSlotIndex);
            }
            console.warn(`[Multiblock] 已消耗物品，剩余数量: ${item.amount > 1 ? item.amount - 1 : 0}`);
          }
        } catch (e) {
          console.error(`[Multiblock] 减少物品失败:`, e);
        }
      }
    });
  }

  onPlayerBreak(event, componentData) {
    const { block, brokenBlockPermutation, dimension } = event;
    const params = componentData?.params || componentData || {};

    if (!this.validateParams(params)) return;

    const { size, index, rotate = true, downward = false } = params;
    let direction = this.toDirection(brokenBlockPermutation.getState("minecraft:cardinal_direction"));

    // 处理down面破坏的情况
    const blockFace = brokenBlockPermutation.getState("minecraft:block_face");
    if (!direction && rotate) {
      if (blockFace === "down") {
        // down面破坏时使用默认方向（North）
        direction = Direction.North;
      } else {
        // 其他面没有方向信息时返回
        return;
      }
    }

    const baseBlock = this.getBaseBlock(block, brokenBlockPermutation, params, direction);
    if (!baseBlock) return;

    const destroyBlocks = this.getDestroyBlocks(dimension, baseBlock.location, size, direction, downward);
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
    // downward参数是可选的，默认为false（向上生成）
    if (params.downward !== undefined && typeof params.downward !== "boolean") return false;
    return true;
  }

  getPlacementBlocks(dimension, location, size, direction, downward = false) {
    const [width, height, depth] = size;
    const totalBlocks = width * height * depth;
    const blocks = new Array(totalBlocks);

    const baseX = location.x;
    const baseY = location.y;
    const baseZ = location.z;

    let index = 0;
    for (let y = 0; y < height; y++) {
      // 根据downward参数决定Y坐标计算方向
      const offsetY = downward ? baseY - y : baseY + y;
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

    const { size, downward = false } = params;
    const [width, height, depth] = size;
    const offsets = [];
    let currentIndex = 0;

    for (let y = 0; y < height; y++) {
      for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
          let offset;

          // 根据downward参数调整y偏移量计算
          const yOffset = downward ? -y : y;

          switch (direction) {
            case Direction.South:
              offset = { x: -x, y: yOffset, z: z };
              break;
            case Direction.West:
              offset = { x: -z, y: yOffset, z: -x };
              break;
            case Direction.North:
              offset = { x: x, y: yOffset, z: -z };
              break;
            case Direction.East:
              offset = { x: z, y: yOffset, z: x };
              break;
            default:
              offset = { x: x, y: yOffset, z: z };
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

  getDestroyBlocks(dimension, baseLocation, size, direction, downward = false) {
    return this.getPlacementBlocks(dimension, baseLocation, size, direction, downward);
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
