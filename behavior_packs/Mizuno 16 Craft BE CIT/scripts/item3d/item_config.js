/**
 * Item 3D Configuration - 统一配置文件
 *
 * 整合了所有物品相关的配置：
 * - 模型变体 (model)
 * - 无重力 (noGravity)
 * - 点击检测区域 (hitbox)
 * - 放置偏移 (placement)
 *
 * 配置格式：
 * {
 *   "minecraft:物品ID": {
 *     "物品名称": {
 *       entityOverride: "实体后缀",  // 可选，实体替换
 *       model: 变体编号,
 *       noGravity: true/false,
 *       hitbox: "wall"/"top"/null,
 *       placement: { wall, ground, ceiling }
 *     }
 *   }
 * }
 */
export const itemConfig = {
  // ==================== 苹果配置 ====================
  "minecraft:apple": {
    // 默认配置（所有未特殊配置的苹果使用）
    _default: {
      model: 0, // 普通苹果模型
      noGravity: false, // 受重力影响
      hitbox: null, // 默认点击区域 (0.06 × 0.06)
      placement: {
        wall: 0.120834, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.01, // 天花板高度
      },
    },
    apple_0_wall: {
      entityOverride: "wall", // 使用 item3d:apple_wall 实体
      noGravity: true,
      hitbox: null, // 默认点击区域
      placement: {
        wall: 0.120834, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.01, // 天花板高度
      },
    },
    apple_0_top: {
      model: 0, // 普通苹果模型
      noGravity: true,
      hitbox: "top", // 顶部点击区域 (1 × 1)
      placement: {
        wall: 0.120834, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.01, // 天花板高度
      },
    },
    // 金苹果
    apple_1: {
      model: 1, // 金苹果模型
      noGravity: false,
    },
    // 附魔金苹果
    apple_1_top: {
      model: 2, // 附魔金苹果模型
      noGravity: true,
      hitbox: "top", // 顶部点击区域 (1 × 1)
      placement: {
        wall: 0.120834, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.01, // 天花板高度
      },
    },
  },
};
// ==================== 辅助函数 ====================
/**
 * 获取物品的完整配置
 * @param itemTypeId - 物品类型ID (如 "minecraft:apple")
 * @param itemName - 物品自定义名称
 * @returns 配置对象
 */
export function getItemConfig(itemTypeId, itemName) {
  const itemConfigs = itemConfig[itemTypeId];
  if (!itemConfigs) {
    return null;
  }
  // 获取默认配置
  const defaultConfig = itemConfigs["_default"] || {};
  // 如果没有名称，返回默认配置
  if (!itemName) {
    return defaultConfig;
  }
  // 获取特定名称的配置
  const nameConfig = itemConfigs[itemName];
  if (!nameConfig) {
    return defaultConfig;
  }
  // 合并配置（特定配置覆盖默认配置）
  return Object.assign(Object.assign(Object.assign({}, defaultConfig), nameConfig), {
    placement: Object.assign(Object.assign({}, defaultConfig.placement), nameConfig.placement || {}),
  });
}
/**
 * 获取模型变体编号
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 * @returns 变体编号
 */
export function getVariantByName(itemTypeId, itemName) {
  var _a;
  const config = getItemConfig(itemTypeId, itemName);
  return (_a = config === null || config === void 0 ? void 0 : config.model) !== null && _a !== void 0 ? _a : null;
}
/**
 * 检查物品是否应该禁用重力
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 * @returns 是否禁用重力
 */
export function shouldDisableGravity(itemTypeId, itemName) {
  const config = getItemConfig(itemTypeId, itemName);
  return (config === null || config === void 0 ? void 0 : config.noGravity) === true;
}
/**
 * 获取点击检测区域大小
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 * @returns "wall", "top" 或 null
 */
export function getHitboxSize(itemTypeId, itemName) {
  const config = getItemConfig(itemTypeId, itemName);
  return (config === null || config === void 0 ? void 0 : config.hitbox) || null;
}
/**
 * 获取点击检测区域事件名称
 * @param hitboxSize - 点击区域大小
 * @returns 事件名称
 */
export function getHitboxEvent(hitboxSize) {
  switch (hitboxSize) {
    case "wall":
      return "item3d:set_hitbox_wall";
    case "top":
      return "item3d:set_hitbox_top";
    default:
      return null;
  }
}
/**
 * 获取实体ID（支持实体覆盖）
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 * @returns 实体ID
 */
export function getEntityId(itemTypeId, itemName) {
  const config = getItemConfig(itemTypeId, itemName);
  const baseEntityId = itemTypeId.replace("minecraft:", "item3d:");
  if (!(config === null || config === void 0 ? void 0 : config.entityOverride)) {
    return baseEntityId;
  }
  return `${baseEntityId}_${config.entityOverride}`;
}
/**
 * 获取放置配置
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 * @returns 包含 wall, ground, ceiling 的配置
 */
export function getPlacementConfig(itemTypeId, itemName) {
  const config = getItemConfig(itemTypeId, itemName);
  // 默认放置配置
  const defaultPlacement = {
    wall: 0.3,
    ground: 1.01,
    ceiling: -0.01,
  };
  return (config === null || config === void 0 ? void 0 : config.placement) || defaultPlacement;
}
/**
 * 检查某个物品是否支持名称变体
 * @param itemTypeId - 物品类型ID
 * @returns 是否支持名称变体
 */
export function hasVariantConfig(itemTypeId) {
  return itemTypeId in itemConfig;
}
/**
 * 获取某个物品的所有配置名称
 * @param itemTypeId - 物品类型ID
 * @returns 配置名称数组（不包括 _default）
 */
export function getConfiguredNames(itemTypeId) {
  const itemConfigs = itemConfig[itemTypeId];
  if (!itemConfigs) {
    return [];
  }
  return Object.keys(itemConfigs).filter((name) => name !== "_default");
}
console.warn("[Item3D] item_config.js 已加载");
