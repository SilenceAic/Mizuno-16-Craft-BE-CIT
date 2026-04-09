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
  // ==================== 重质测重压力板配置 ====================
  "minecraft:heavy_weighted_pressure_plate": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 轻质测重压力板配置 ====================
  "minecraft:light_weighted_pressure_plate": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 红石粉配置 ====================
  "minecraft:redstone": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 铁粒配置 ====================
  "minecraft:iron_ingot": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 金粒配置 ====================
  "minecraft:gold_ingot": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 木棍配置 ====================
  "minecraft:stick": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 碗配置 =====================
  // 物品不命名或命名为其他 → cit:bowl_0；命名为 Bowl_1 → cit:bowl_1
  "minecraft:bowl": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_1: {
      entityId: "cit:bowl_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_2: {
      entityId: "cit:bowl_2",
      variantEntities: ["cit:bowl_2", "cit:bowl_2a"],
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_3: {
      entityId: "cit:bowl_3",
      variantEntities: ["cit:bowl_3", "cit:bowl_3a"],
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_4: {
      entityId: "cit:bowl_4",
      wallEntityId: "cit:bowl_4_wall",
      variantEntities: ["cit:bowl_4", "cit:bowl_4a", "cit:bowl_4b"],
      wallVariantEntities: ["cit:bowl_4_wall", "cit:bowl_4a_wall", "cit:bowl_4b_wall"],
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_4a: {
      entityId: "cit:bowl_4a",
      wallEntityId: "cit:bowl_4a_wall",
      variantEntities: ["cit:bowl_4", "cit:bowl_4a", "cit:bowl_4b"],
      wallVariantEntities: ["cit:bowl_4_wall", "cit:bowl_4a_wall", "cit:bowl_4b_wall"],
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_4b: {
      entityId: "cit:bowl_4b",
      wallEntityId: "cit:bowl_4b_wall",
      variantEntities: ["cit:bowl_4", "cit:bowl_4a", "cit:bowl_4b"],
      wallVariantEntities: ["cit:bowl_4_wall", "cit:bowl_4a_wall", "cit:bowl_4b_wall"],
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_5: {
      entityId: "cit:bowl_5",
      variantEntities: ["cit:bowl_5", "cit:bowl_5a", "cit:bowl_5b", "cit:bowl_5c"],
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_6: {
      entityId: "cit:bowl_6",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 火药配置 ====================
  "minecraft:gunpowder": {
    _default: {
      entityId: "cit:gunpowder_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 小麦种子配置 ====================
  "minecraft:wheat_seeds": {
    _default: {
      entityId: "cit:wheat_seeds_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 小麦配置 ====================
  "minecraft:wheat": {
    _default: {
      entityId: "cit:wheat_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Wheat_1: {
      entityId: "cit:wheat_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 桶配置 ====================
  "minecraft:bucket": {
    _default: {
      entityId: "cit:bucket_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bucket_1: {
      entityId: "cit:bucket_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bucket_2: {
      entityId: "cit:bucket_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bucket_3: {
      entityId: "cit:bucket_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 水桶配置 ====================
  "minecraft:water_bucket": {
    _default: {
      entityId: "cit:water_bucket_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Water Bucket_1": {
      entityId: "cit:water_bucket_1",
      variantEntities: ["cit:water_bucket_1", "cit:water_bucket_1a"],
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Water Bucket_2": {
      entityId: "cit:water_bucket_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Water Bucket_3": {
      entityId: "cit:water_bucket_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Water Bucket_4": {
      entityId: "cit:water_bucket_4",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 熔岩桶配置 ====================
  "minecraft:lava_bucket": {
    _default: {
      entityId: "cit:lava_bucket_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  "minecraft:snowball": {
    _default: {
      entityId: "cit:snowball_0_wall",
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
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
      entityOverride: "wall", // 使用 cit:apple_wall 实体
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
      return "cit:set_hitbox_wall";
    case "top":
      return "cit:set_hitbox_top";
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
export function getEntityId(itemTypeId, itemName, isWall = false) {
  const config = getItemConfig(itemTypeId, itemName);
  const baseEntityId = itemTypeId.replace("minecraft:", "cit:");
  // 墙面放置且有 wallEntityId 配置时使用独立 wall 实体
  if (isWall && (config === null || config === void 0 ? void 0 : config.wallEntityId)) {
    return config.wallEntityId;
  }
  if (config === null || config === void 0 ? void 0 : config.entityId) {
    return config.entityId;
  }
  if (config === null || config === void 0 ? void 0 : config.entityOverride) {
    return `${baseEntityId}_${config.entityOverride}`;
  }
  // 默认追加 _0 后缀
  return `${baseEntityId}_0`;
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
/**
 * 获取下一个变体实体 ID（下蹲左键循环切换）
 * @param currentEntityTypeId - 当前实体 typeId（如 "cit:bowl_0"）
 * @returns 下一个实体 typeId，若无变体则返回 null
 */
export function getNextVariantEntity(currentEntityTypeId) {
  for (const itemConfigs of Object.values(itemConfig)) {
    for (const subConfig of Object.values(itemConfigs)) {
      // 检查地面变体链
      let variants = subConfig?.variantEntities;
      if (variants) {
        const idx = variants.indexOf(currentEntityTypeId);
        if (idx !== -1) return variants[(idx + 1) % variants.length];
      }
      // 检查墙面变体链
      variants = subConfig?.wallVariantEntities;
      if (variants) {
        const idx = variants.indexOf(currentEntityTypeId);
        if (idx !== -1) return variants[(idx + 1) % variants.length];
      }
    }
  }
  return null;
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
console.warn("[CIT] item_config.js 已加载");
