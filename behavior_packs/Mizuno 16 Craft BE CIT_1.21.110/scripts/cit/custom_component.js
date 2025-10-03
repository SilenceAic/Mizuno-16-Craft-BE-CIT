import * as server from "@minecraft/server";
import * as maths from "../system/maths";
import * as create from "../system/create";
import * as multiblock from "../system/multiblock";
import {
  getPreciseRotation,
  getMaxStates,
  getNextState,
  getMaxSwitch,
  getNextSwitch,
  updateMultiblockDynamicState,
} from "./custom_function";

const components = new Map();
//初始化旋转状态组件
components.set("cit:rotation", {
  /**
   * 在玩家放置方块前触发的回调函数，用于根据玩家的旋转角度设置方块的旋转状态
   *
   * @param {server.BlockComponentPlayerPlaceBeforeEvent} event - 玩家放置方块事件对象
   */
  beforeOnPlayerPlace(event) {
    const { player } = event;
    if (!player) return;

    const blockFace = event.permutationToPlace.getState("minecraft:block_face");
    if (blockFace !== "up") return;

    const playerYRotation = player.getRotation().y;
    const rotation = getPreciseRotation(playerYRotation);
    event.permutationToPlace = event.permutationToPlace.withState("cit:rotation", rotation);
  },
});

components.set("cit:dynamic_state", {
  /**
   * 玩家与方块交互时触发的回调函数，用于处理动态状态的切换
   *
   * @param {server.BlockComponentPlayerInteractEvent} event - 玩家与方块交互事件对象
   */
  onPlayerInteract(event) {
    const { player, block } = event;
    if (!player || !player.isSneaking) return;

    const currentState = block.permutation.getState("cit:dynamic_state") || 0;
    if (typeof currentState !== "number") return;

    const maxStates = getMaxStates(block);
    const newState = getNextState(currentState, maxStates);

    const multiblockIndex = block.permutation.getState("cit:multiblock_index");
    if (multiblockIndex !== undefined) {
      updateMultiblockDynamicState(block, newState);
      return;
    }

    const variant = block.permutation.getState("cit:variant");
    if (variant === 1 || variant === 2) {
      const baseBlock = variant === 1 ? block : block.below();
      if (!baseBlock) return;

      const baseCurrentState = baseBlock.permutation.getState("cit:dynamic_state") || 0;
      if (typeof baseCurrentState !== "number") return;

      const baseMaxStates = getMaxStates(baseBlock);
      const baseNewState = getNextState(baseCurrentState, baseMaxStates);

      create.TrySetPermutation(baseBlock, "cit:dynamic_state", baseNewState);
      const topBlock = baseBlock.above();
      if (topBlock) create.TrySetPermutation(topBlock, "cit:dynamic_state", baseNewState);
      return;
    }

    create.TrySetPermutation(block, "cit:dynamic_state", newState);
  },
});

components.set("cit:switch", {
  /**
   * 玩家与方块交互时触发的回调函数，用于处理开关状态的切换
   *
   * @param {server.BlockComponentPlayerInteractEvent} event - 玩家与方块交互事件对象
   */
  onPlayerInteract(event) {
    const { player, block } = event;
    if (!player || player.isSneaking) return;

    const currentSwitch = block.permutation.getState("cit:switch") || 0;
    if (typeof currentSwitch !== "number") return;

    const maxSwitch = getMaxSwitch(block);
    const newSwitch = getNextSwitch(currentSwitch, maxSwitch);

    create.TrySetPermutation(block, "cit:switch", newSwitch);
  },
});
/**
 * 使用新的多方块系统（基于 Ce 类实现）
 *
 * 使用示例：
 * 在方块 JSON 中的 components 里添加：
 * "cit:multiblock": {
 *   "size": [2, 2, 1],  // [宽度, 高度, 深度]
 *   "index": "cit:multiblock_index",  // 索引状态名
 *   "rotate": true  // 是否支持旋转（可选，默认 true）
 * }
 *
 * 同时需要在 states 中定义：
 * "cit:multiblock_index": [0, 1, 2, 3]  // 根据 size 计算总方块数
 *
 * 如果 rotate: true，还需要 traits:
 * "traits": {
 *   "minecraft:placement_direction": {
 *     "enabled_states": ["minecraft:cardinal_direction"]
 *   }
 * }
 */
components.set("cit:multiblock", {
  /**
   * 在玩家放置方块前触发的回调函数，用于处理多方块结构的放置逻辑
   *
   * @param {server.BlockComponentPlayerPlaceBeforeEvent} event - 玩家放置方块事件对象
   * @param {Object} componentData - 组件数据，系统自动从 JSON 中的配置传入
   */
  beforeOnPlayerPlace(event, componentData) {
    const { player, permutationToPlace } = event;
    if (!player) return;

    const playerYRotation = player.getRotation().y;
    const rotation = getPreciseRotation(playerYRotation);

    const onSetPermutation = (permutation, _index, _event) => {
      let newPermutation = permutation;

      try {
        newPermutation = newPermutation.withState("cit:rotation", rotation);
      } catch (e) {}

      try {
        const dynamicState = permutationToPlace.getState("cit:dynamic_state") || 0;
        newPermutation = newPermutation.withState("cit:dynamic_state", dynamicState);
      } catch (e) {}

      try {
        const blockFace = permutationToPlace.getState("minecraft:block_face");
        if (blockFace) {
          newPermutation = newPermutation.withState("minecraft:block_face", blockFace);
        }
      } catch (e) {}

      return newPermutation;
    };

    multiblock.multiblock.beforeOnPlayerPlace(event, componentData, onSetPermutation);
  },

  /**
   * 在玩家破坏方块时触发的回调函数，用于处理多方块结构的破坏逻辑
   *
   * @param {server.BlockComponentPlayerBreakEvent} event - 玩家破坏方块事件对象
   * @param {Object} componentData - 组件数据，系统自动从 JSON 中的配置传入
   */
  onPlayerBreak(event, componentData) {
    multiblock.multiblock.onPlayerBreak(event, componentData);
  },
});

/**
 * 旧版双方块结构（保留用于兼容）
 * 如果你想使用新的多方块系统，建议迁移到上面的 cit:multiblock
 */
components.set("cit:legacy_multiblock", {
  /**
   * 在玩家放置方块前触发的回调函数，用于处理双方块结构的放置逻辑
   *
   * @param {server.BlockComponentPlayerPlaceBeforeEvent} event - 玩家放置方块事件对象
   */
  beforeOnPlayerPlace(event) {
    const { block, player, permutationToPlace, dimension } = event;
    if (!player) return;

    const aboveBlock = block.above();
    const belowBlock = block.below();
    if (!aboveBlock || !belowBlock) return;

    const playerYRotation = player.getRotation().y;
    const rotation = getPreciseRotation(playerYRotation);

    if (aboveBlock.isValid && aboveBlock.isAir) {
      server.system.run(() => {
        aboveBlock.setType(permutationToPlace.type.id);
        create.TrySetPermutation(aboveBlock, "cit:variant", 2);
        create.TrySetPermutation(aboveBlock, "cit:dynamic_state", 0);
        create.TrySetPermutation(aboveBlock, "cit:rotation", rotation);
        create.TrySetPermutation(
          aboveBlock,
          "minecraft:block_face",
          permutationToPlace.getState("minecraft:block_face")
        );
      });
      event.permutationToPlace = event.permutationToPlace
        .withState("cit:rotation", rotation)
        .withState("cit:variant", 1);
    } else if (belowBlock.isValid && belowBlock.isAir) {
      server.system.run(() => {
        belowBlock.setType(permutationToPlace.type.id);
        create.TrySetPermutation(belowBlock, "cit:variant", 1);
        create.TrySetPermutation(belowBlock, "cit:dynamic_state", 0);
        create.TrySetPermutation(belowBlock, "cit:rotation", rotation);
        create.TrySetPermutation(belowBlock, "minecraft:block_face", "up");
      });
      event.permutationToPlace = event.permutationToPlace
        .withState("cit:rotation", rotation)
        .withState("cit:variant", 2)
        .withState("minecraft:block_face", "up");
    } else {
      const space = maths.Vector.createCubeLattice(1);
      for (let index = 0; index < space.length; index++) {
        const vector = space[index];
        const anchor = vector.add(block);
        const target = dimension.getBlock(anchor);
        const targetAbove = target?.above();
        if (!target || !target.isAir || !targetAbove || !targetAbove.isAir) continue;

        server.system.run(() => {
          const container = player.getComponent("inventory")?.container;
          const item = container?.getItem(player.selectedSlotIndex);

          target.setType(permutationToPlace.type.id);
          targetAbove.setType(permutationToPlace.type.id);
          create.TrySetPermutation(targetAbove, "cit:variant", 2);
          create.TrySetPermutation(targetAbove, "cit:dynamic_state", 0);
          create.TrySetPermutation(targetAbove, "cit:rotation", rotation);
          create.TrySetPermutation(targetAbove, "minecraft:block_face", "up");
          create.TrySetPermutation(target, "cit:variant", 1);
          create.TrySetPermutation(target, "cit:dynamic_state", 0);
          create.TrySetPermutation(target, "cit:rotation", rotation);
          create.TrySetPermutation(target, "minecraft:block_face", "up");

          if (!container || !item) return;
          if (item.amount > 1) {
            item.amount -= 1;
            container.setItem(player.selectedSlotIndex, item);
          } else {
            container.setItem(player.selectedSlotIndex);
          }
        });
        break;
      }
      event.cancel = true;
    }
  },
});

components.set("cit:multidestory", {
  /**
   * 玩家破坏方块时触发的回调函数，用于处理旧版双方块结构中关联方块的清理
   *
   * @param {server.BlockComponentPlayerBreakEvent} event - 玩家破坏方块事件对象
   */
  onPlayerBreak(event) {
    const { block, brokenBlockPermutation } = event;
    const variant = brokenBlockPermutation.getState("cit:variant");

    if (variant === 1) {
      const aboveBlock = block.above();
      if (aboveBlock) aboveBlock.setType("minecraft:air");
    } else if (variant === 2) {
      const belowBlock = block.below();
      if (belowBlock) belowBlock.setType("minecraft:air");
    }
  },
});
//你好！你好！
export default components;
