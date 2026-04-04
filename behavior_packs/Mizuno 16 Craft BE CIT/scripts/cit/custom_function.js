import * as server from "@minecraft/server";
import * as create from "../system/create";
import * as multiblock from "../system/multiblock";

/**
 * 在指定位置生成粒子
 * @param {object} dimension - 维度对象
 * @param {object} location - 方块位置 { x, y, z }
 * @param {object} params - 粒子参数
 * @param {string} params.particle - 粒子类型 ID (如 "minecraft:campfire_smoke_particle")
 * @param {object} [params.offset] - 相对于方块中心的偏移 { x, y, z }，默认 { x: 0.5, y: 0.5, z: 0.5 }
 * @param {string} [params.molang] - MoLang 变量字符串 (可选)
 */
export function spawnParticle(dimension, location, params) {
  if (!params?.particle) return;

  const offset = params.offset || { x: 0.5, y: 0.5, z: 0.5 };
  const particleLocation = {
    x: location.x + offset.x,
    y: location.y + offset.y,
    z: location.z + offset.z,
  };

  try {
    if (params.molang) {
      const molangVariables = new server.MolangVariableMap();
      // 解析 molang 参数，格式: "variable.name=value,variable.name2=value2"
      const variables = params.molang.split(",");
      for (const variable of variables) {
        const [name, value] = variable.trim().split("=");
        if (name && value !== undefined) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            molangVariables.setFloat(name.trim(), numValue);
          }
        }
      }
      dimension.spawnParticle(params.particle, particleLocation, molangVariables);
    } else {
      dimension.spawnParticle(params.particle, particleLocation);
    }
  } catch (e) {
    console.error(`[Particle] 生成粒子失败: ${e}`);
  }
}

/**
 * 从 params 中提取所有粒子配置
 * 支持 particle, particle2, particle3... 格式
 * @param {object} params - 原始参数
 * @returns {Array} 粒子配置数组
 */
export function extractParticleConfigs(params) {
  const configs = [];

  // 提取主粒子配置
  if (params.particle) {
    configs.push({
      particle: params.particle,
      offset: params.offset,
      molang: params.molang,
      count: params.count,
      random: params.random,
      randomRange: params.randomRange,
      rotateWithBlock: params.rotateWithBlock,
    });
  }

  // 提取额外粒子配置 (particle2, particle3, ...)
  for (let i = 2; i <= 10; i++) {
    const particleKey = `particle${i}`;
    if (params[particleKey]) {
      configs.push({
        particle: params[particleKey],
        offset: params[`offset${i}`] || params.offset,
        molang: params[`molang${i}`] || params.molang,
        count: params[`count${i}`] !== undefined ? params[`count${i}`] : params.count,
        random: params[`random${i}`] !== undefined ? params[`random${i}`] : params.random,
        randomRange: params[`randomRange${i}`] || params.randomRange,
        rotateWithBlock:
          params[`rotateWithBlock${i}`] !== undefined ? params[`rotateWithBlock${i}`] : params.rotateWithBlock,
      });
    }
  }

  return configs;
}

/**
 * 持续生成粒子（用于方块 tick 事件）
 * @param {object} block - 方块对象
 * @param {object} params - 粒子参数
 * @param {string} params.particle - 粒子类型 ID
 * @param {object} [params.offset] - 相对于方块中心的偏移
 * @param {string} [params.molang] - MoLang 变量字符串
 * @param {number} [params.count] - 每次生成的粒子数量，默认 1
 * @param {boolean} [params.random] - 是否在方块范围内随机位置，默认 false
 * @param {object} [params.randomRange] - 随机范围 { x, y, z }，默认 { x: 1, y: 1, z: 1 }
 */
export function spawnParticleOnTick(block, params) {
  if (!params?.particle) return;

  const dimension = block.dimension;
  const location = block.location;
  const count = params.count || 1;
  const random = params.random || false;
  const randomRange = params.randomRange || { x: 1, y: 1, z: 1 };
  const offset = params.offset || { x: 0.5, y: 0.5, z: 0.5 };

  for (let i = 0; i < count; i++) {
    let particleOffset = { ...offset };

    if (random) {
      particleOffset.x += (Math.random() - 0.5) * randomRange.x;
      particleOffset.y += (Math.random() - 0.5) * randomRange.y;
      particleOffset.z += (Math.random() - 0.5) * randomRange.z;
    }

    spawnParticle(dimension, location, {
      ...params,
      offset: particleOffset,
    });
  }
}

/**
 * 根据方向调整偏移量
 * @param {object} offset - 原始偏移 { x, y, z }
 * @param {string} direction - 方向 ("north", "south", "east", "west")
 * @returns {object} 调整后的偏移
 */
export function rotateOffsetByDirection(offset, direction) {
  const { x, y, z } = offset;

  switch (direction) {
    case "south":
      return { x: 1 - x, y, z: 1 - z };
    case "east":
      return { x: 1 - z, y, z: x };
    case "west":
      return { x: z, y, z: 1 - x };
    case "north":
    default:
      return { x, y, z };
  }
}

export function getPreciseRotation(playerYRotation) {
  if (playerYRotation < 0) playerYRotation += 360;
  const rotation = Math.round(playerYRotation / 22.5);
  return rotation !== 16 ? rotation : 0;
}

export function getMaxStates(block) {
  if (block.hasTag("cit:six_states")) return 6;
  if (block.hasTag("cit:five_states")) return 5;
  if (block.hasTag("cit:four_states")) return 4;
  if (block.hasTag("cit:three_states")) return 3;
  return 2;
}

export function getNextState(currentState, maxStates) {
  return (currentState + 1) % maxStates;
}

export function getMaxSwitch(block) {
  if (block.hasTag("cit:three_switch")) return 3;
  if (block.hasTag("cit:two_switch")) return 2;
  return 2;
}

export function getNextSwitch(currentSwitch, maxSwitch) {
  return (currentSwitch + 1) % maxSwitch;
}

export function toDirection(cardinalDirection) {
  if (typeof cardinalDirection !== "string") return undefined;

  switch (cardinalDirection) {
    case "north":
      return server.Direction.North;
    case "east":
      return server.Direction.East;
    case "south":
      return server.Direction.South;
    case "west":
      return server.Direction.West;
    default:
      return undefined;
  }
}

export function getMultiblockSize(baseBlock) {
  if (baseBlock.hasTag("cit:two_wide")) return [2, 1, 1];
  return [1, 2, 1];
}

export function findMultiblockBase(block) {
  const permutation = block.permutation;
  const currentIndex = permutation.getState("cit:multiblock_index");
  if (currentIndex === 0) return block;

  const size = getMultiblockSize(block);
  if (!size) return null;

  const direction = toDirection(permutation.getState("minecraft:cardinal_direction"));

  const baseBlock = multiblock.multiblock.getBaseBlock(
    block,
    permutation,
    { size, index: "cit:multiblock_index" },
    direction
  );

  if (baseBlock && baseBlock.permutation.getState("cit:multiblock_index") === 0) {
    return baseBlock;
  }

  return null;
}

export function updateMultiblockSwitchState(block, newState) {
  const currentIndex = block.permutation.getState("cit:multiblock_index");
  const baseBlock = currentIndex !== 0 ? findMultiblockBase(block) : block;

  if (!baseBlock) return;

  const size = getMultiblockSize(baseBlock);
  if (!size) return;

  const allBlocks = multiblock.multiblock.getPlacementBlocks(
    block.dimension,
    baseBlock.location,
    size,
    toDirection(baseBlock.permutation.getState("minecraft:cardinal_direction"))
  );

  const blockType = block.typeId;
  const blocksCount = allBlocks.length;

  for (let i = 0; i < blocksCount; i++) {
    const targetBlock = allBlocks[i];
    if (targetBlock?.typeId === blockType) {
      create.TrySetPermutation(targetBlock, "cit:switch", newState);
    }
  }
}

export function updateMultiblockDynamicState(block, newState) {
  const currentIndex = block.permutation.getState("cit:multiblock_index");
  const baseBlock = currentIndex !== 0 ? findMultiblockBase(block) : block;

  if (!baseBlock) return;

  const size = getMultiblockSize(baseBlock);
  if (!size) return;

  const allBlocks = multiblock.multiblock.getPlacementBlocks(
    block.dimension,
    baseBlock.location,
    size,
    toDirection(baseBlock.permutation.getState("minecraft:cardinal_direction"))
  );

  const blockType = block.typeId;
  const blocksCount = allBlocks.length;

  for (let i = 0; i < blocksCount; i++) {
    const targetBlock = allBlocks[i];
    if (targetBlock?.typeId === blockType) {
      create.TrySetPermutation(targetBlock, "cit:dynamic_state", newState);
    }
  }
}
