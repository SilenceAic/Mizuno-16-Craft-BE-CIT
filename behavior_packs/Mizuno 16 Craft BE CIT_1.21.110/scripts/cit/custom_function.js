import * as server from "@minecraft/server";
import * as create from "../system/create";
import * as multiblock from "../system/multiblock";

/**
 * 计算玩家精确的旋转角度值
 * @param {number} playerYRotation - 玩家的 Y 轴旋转角度
 * @returns {number} 转换后的旋转角度值，范围在 0 到 15 之间
 */
export function getPreciseRotation(playerYRotation) {
  if (playerYRotation < 0) playerYRotation += 360;
  const rotation = Math.round(playerYRotation / 22.5);
  return rotation !== 16 ? rotation : 0;
}
/**
 * 获取方块的最大状态数
 * @param {server.Block} block - 要检查的方块对象
 * @returns {number} 方块的最大状态数
 */
export function getMaxStates(block) {
  if (block.hasTag("cit:six_states")) return 6;
  if (block.hasTag("cit:five_states")) return 5;
  if (block.hasTag("cit:four_states")) return 4;
  if (block.hasTag("cit:three_states")) return 3;
  return 2;
}

/**
 * 获取当前状态的下一个状态
 * @param {number} currentState - 当前的状态值
 * @param {number} maxStates - 最大状态数
 * @returns {number} 下一个状态值
 */
export function getNextState(currentState, maxStates) {
  return (currentState + 1) % maxStates;
}

/**
 * 获取方块的最大开关数
 * @param {server.Block} block - 要检查的方块对象
 * @returns {number} 方块的最大开关数
 */
export function getMaxSwitch(block) {
  if (block.hasTag("cit:three_switch")) return 3;
  if (block.hasTag("cit:two_switch")) return 2;
  return 2;
}

/**
 * 获取当前开关的下一个状态
 * @param {number} currentSwitch - 当前的开关值
 * @param {number} maxSwitch - 最大开关数
 * @returns {number} 下一个开关值
 */
export function getNextSwitch(currentSwitch, maxSwitch) {
  return (currentSwitch + 1) % maxSwitch;
}

/**
 * 将字符串方向转换为 Direction 枚举
 * @param {string} cardinalDirection - 方向字符串
 * @returns {server.Direction|undefined} 方向枚举
 */
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

/**
 * 获取多方块的尺寸
 * @param {server.Block} baseBlock - 基础方块
 * @returns {[number, number, number]|null} [宽, 高, 深]
 */
export function getMultiblockSize(baseBlock) {
  if (baseBlock.hasTag("cit:two_height")) {
    return [1, 2, 1];
  }
  return [1, 2, 1];
}

/**
 * 查找多方块的基础方块
 * @param {server.Block} block - 当前方块
 * @returns {server.Block|null} 基础方块
 */
export function findMultiblockBase(block) {
  const permutation = block.permutation;
  const currentIndex = permutation.getState("cit:multiblock_index");
  if (currentIndex === 0) return block;

  const size = getMultiblockSize(block);
  if (!size) return null;

  const direction = toDirection(permutation.getState("minecraft:cardinal_direction"));

  // 直接使用内联参数，避免对象创建
  const baseBlock = multiblock.multiblock.getBaseBlock(
    block,
    permutation,
    { size, index: "cit:multiblock_index" },
    direction
  );

  // 快速验证：只检查 index，类型已由 getBaseBlock 保证
  if (baseBlock && baseBlock.permutation.getState("cit:multiblock_index") === 0) {
    return baseBlock;
  }

  return null;
}

/**
 * 更新多方块结构的所有方块的动态状态
 * @param {server.Block} block - 被交互的方块
 * @param {number} newState - 新的动态状态
 */
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

  // 优化：缓存数组长度和类型
  const blockType = block.typeId;
  const blocksCount = allBlocks.length;

  for (let i = 0; i < blocksCount; i++) {
    const targetBlock = allBlocks[i];
    if (targetBlock?.typeId === blockType) {
      create.TrySetPermutation(targetBlock, "cit:dynamic_state", newState);
    }
  }
}
