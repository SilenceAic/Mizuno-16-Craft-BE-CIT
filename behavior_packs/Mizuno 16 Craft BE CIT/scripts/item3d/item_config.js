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
  // ==================== 鸡蛋配置 ====================
  "minecraft:egg": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_0: {
      entityId: "cit:egg_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_1: {
      entityId: "cit:egg_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    鸡蛋_1: {
      entityId: "cit:egg_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_2: {
      entityId: "cit:egg_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_3: {
      entityId: "cit:egg_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_4: {
      entityId: "cit:egg_4",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_4a: {
      entityId: "cit:egg_4",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_5: {
      entityId: "cit:egg_5",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Egg_5a: {
      entityId: "cit:egg_5",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 萤石粉配置 ====================
  "minecraft:glowstone_dust": {
    _default: {
      entityId: "cit:glowstone_dust_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 可可豆配置 ====================
  "minecraft:cocoa_beans": {
    _default: {
      entityId: "cit:cocoa_beans_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  }, // ==================== 骨头配置 ====================
  "minecraft:bone": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bone_0: {
      entityId: "cit:bone_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bone_1: {
      entityId: "cit:bone_1",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bone_1a: {
      entityId: "cit:bone_1a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bone_2: {
      entityId: "cit:bone_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 南瓜种子配置 ====================
  "minecraft:pumpkin_seeds": {
    _default: {
      entityId: "cit:pumpkin_seeds_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 西瓜种子配置 ====================
  "minecraft:melon_seeds": {
    _default: {
      entityId: "cit:melon_seeds_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 地狱疣配置 ====================
  "minecraft:nether_wart": {
    _default: {
      entityId: "cit:nether_wart_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Nether Wart_0": {
      entityId: "cit:nether_wart_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Nether Wart_1": {
      entityId: "cit:nether_wart_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 书与笔配置 ====================
  "minecraft:writable_book": {
    _default: {
      entityId: "cit:book_and_quill_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Book and Quill_0": {
      entityId: "cit:book_and_quill_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Book and Quill_1": {
      entityId: "cit:book_and_quill_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Book and Quill_2": {
      entityId: "cit:book_and_quill_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Book and Quill_3": {
      entityId: "cit:book_and_quill_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Book and Quill_4": {
      entityId: "cit:book_and_quill_4",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 下界砖块配置 ====================
  "minecraft:netherbrick": {
    _default: {
      entityId: "cit:nether_brick_0",
      variantEntities: ["cit:nether_brick_0", "cit:nether_brick_0_01"],
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  //==================== 兔子皮配置 ====================
  "minecraft:rabbit_hide": {
    _default: {
      entityId: "cit:rabbit_hide_0",
      wallEntityId: "cit:rabbit_hide_0_wall",
      variantCount: 2,
      wallVariantCount: 2,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_0a": {
      entityId: "cit:rabbit_hide_0a",
      wallEntityId: "cit:rabbit_hide_0a_wall",
      variantCount: 2,
      wallVariantCount: 2,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_1": {
      entityId: "cit:rabbit_hide_1",
      wallEntityId: null,
      variantCount: 6,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_1a": {
      entityId: "cit:rabbit_hide_1a",
      wallEntityId: null,
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_1b": {
      entityId: "cit:rabbit_hide_1b",
      wallEntityId: null,
      spawnVariant: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_1c": {
      entityId: "cit:rabbit_hide_1c",
      wallEntityId: null,
      spawnVariant: 3,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_1d": {
      entityId: "cit:rabbit_hide_1d",
      wallEntityId: null,
      spawnVariant: 4,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Rabbit Hide_1e": {
      entityId: "cit:rabbit_hide_1e",
      wallEntityId: null,
      spawnVariant: 5,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 甜菜种子配置 ====================
  "minecraft:beetroot_seeds": {
    _default: {
      entityId: "cit:beetroot_seeds_0",
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
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_3: {
      entityId: "cit:bowl_3",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_4: {
      entityId: "cit:bowl_4",
      wallEntityId: "cit:bowl_4_wall",
      variantCount: 3,
      wallVariantCount: 3,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_4a: {
      entityId: "cit:bowl_4",
      wallEntityId: "cit:bowl_4_wall",
      spawnVariant: 1,
      wallSpawnVariant: 1,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_4b: {
      entityId: "cit:bowl_4",
      wallEntityId: "cit:bowl_4_wall",
      spawnVariant: 2,
      wallSpawnVariant: 2,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bowl_5: {
      entityId: "cit:bowl_5",
      variantCount: 4,
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
      variantCount: 2,
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
  // ==================== 雪球配置 ====================
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
  //==================== 皮革配置 ====================
  "minecraft:leather": {
    _default: {
      entityId: "cit:leather_0",
      wallEntityId: "cit:leather_0_wall",
      variantCount: 2,
      wallVariantCount: 2,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    leather_0a: {
      entityId: "cit:leather_0a",
      wallEntityId: "cit:leather_0a_wall",
      variantCount: 2,
      wallVariantCount: 2,
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Leather_1: {
      entityId: "cit:leather_1",
      wallEntityId: null,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Leather_2_wall: {
      entityId: "cit:leather_2_wall",
      wallEntityId: "cit:leather_2_wall",
      placement: {
        wall: 0.5,
        wallY: -0.5,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 牛奶桶配置 ====================
  "minecraft:milk_bucket": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_1": {
      entityId: "cit:milk_bucket_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_2": {
      entityId: "cit:milk_bucket_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_3": {
      entityId: "cit:milk_bucket_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_4": {
      entityId: "cit:milk_bucket_4",
      variantCount: 3,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_4a": {
      entityId: "cit:milk_bucket_4a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_4b": {
      entityId: "cit:milk_bucket_4b",
      spawnVariant: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_5": {
      entityId: "cit:milk_bucket_5",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_6": {
      entityId: "cit:milk_bucket_6",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Milk Bucket_7": {
      entityId: "cit:milk_bucket_7",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 河豚桶配置 ====================
  "minecraft:pufferfish_bucket": {
    _default: {
      entityId: "cit:bucket_of_pufferfish_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 鲑鱼桶配置 ====================
  "minecraft:salmon_bucket": {
    _default: {
      entityId: "cit:bucket_of_salmon_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 鳕鱼桶配置 ====================
  "minecraft:cod_bucket": {
    _default: {
      entityId: "cit:bucket_of_cod_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 热带鱼桶配置 ====================
  "minecraft:tropical_fish_bucket": {
    _default: {
      entityId: "cit:bucket_of_tropical_fish_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Tropical Fish Bucket_1": {
      entityId: "cit:bucket_of_tropical_fish_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 砖块配置 ====================
  "minecraft:brick": {
    _default: {
      entityId: "cit:brick_0",
      variantEntities: ["cit:brick_0", "cit:brick_0_01"],
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 纸配置 ====================
  "minecraft:paper": {
    _default: {
      entityId: "cit:paper_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Paper_0: {
      entityId: "cit:paper_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Paper_1: {
      entityId: "cit:paper_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Paper_2: {
      entityId: "cit:paper_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Paper_3: {
      entityId: "cit:paper_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Paper_4: {
      entityId: "cit:paper_4",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Paper_5: {
      entityId: "cit:paper_5",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 书配置 ====================
  "minecraft:book": {
    _default: {
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_0: {
      entityId: "cit:book_0",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_0a: {
      entityId: "cit:book_0a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_1: {
      entityId: "cit:book_1",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_1a: {
      entityId: "cit:book_1a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_2: {
      entityId: "cit:book_2",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_2a: {
      entityId: "cit:book_2a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_3: {
      entityId: "cit:book_3",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_3a: {
      entityId: "cit:book_3a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_4: {
      entityId: "cit:book_4",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_4a: {
      entityId: "cit:book_4a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_5: {
      entityId: "cit:book_5",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_5a: {
      entityId: "cit:book_5a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_6: {
      entityId: "cit:book_6",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_6a: {
      entityId: "cit:book_6a",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_7: {
      entityId: "cit:book_7",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_8: {
      entityId: "cit:book_8",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_9: {
      entityId: "cit:book_9",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_10: {
      entityId: "cit:book_10",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_11: {
      entityId: "cit:book_11",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_12: {
      entityId: "cit:book_12",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Book_13: {
      entityId: "cit:book_13",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 附魔书配置 ====================
  "minecraft:enchanted_book": {
    _default: {
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Enchanted Book_0": {
      entityId: "cit:enchanted_book_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 苹果配置 ====================
  "minecraft:apple": {
    // 默认配置（所有未特殊配置的苹果使用）
    _default: {
      wallEntityId: "cit:apple_0_wall",
      ceilEntityId: "cit:apple_0_top",
      noGravity: false, // 受重力影响
      hitbox: null, // 默认点击区域 (0.06 × 0.06)
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 7又1/8个方块
      },
    },
    Apple_0: {
      entityId: "cit:apple_0",
      wallEntityId: "cit:apple_0_wall",
      ceilEntityId: "cit:apple_0_top",
      noGravity: false,
      hitbox: null,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -0.4453125,
      },
    },
    Apple_0_wall: {
      wallEntityId: "cit:apple_0_wall",
      ceilEntityId: "cit:apple_0_top",
      noGravity: true,
      hitbox: null, // 默认点击区域
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 7又1/8个方块
      },
    },
    Apple_0_top: {
      wallEntityId: "cit:apple_0_wall",
      ceilEntityId: "cit:apple_0_top",
      noGravity: true,
      hitbox: null, // 顶部点击区域 (1 × 1)
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 (scale=2 时苹果顶部贴天花)
      },
    },
    Apple_1: {
      entityId: "cit:apple_1",
      wallEntityId: null,
      ceilEntityId: null,
      noGravity: false,
      hitbox: null,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -0.4453125,
      },
    },
    Apple_1_top: {
      entityId: "cit:apple_1_top",
      wallEntityId: null,
      ceilEntityId: "cit:apple_1_top",
      noGravity: true,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -1.765625,
      },
    },
  },
  // ==================== 蘑菇煲配置 ====================
  "minecraft:mushroom_stew": {
    _default: {
      entityId: "cit:mushroom_stew_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 面包配置 ====================
  "minecraft:bread": {
    _default: {
      wallEntityId: null,
      ceilEntityId: null,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_0: {
      entityId: "cit:bread_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_1: {
      entityId: "cit:bread_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_2: {
      entityId: "cit:bread_2",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_3: {
      entityId: "cit:bread_3",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_4: {
      entityId: "cit:bread_4",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_5: {
      entityId: "cit:bread_5",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_6: {
      entityId: "cit:bread_6",
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    Bread_6a: {
      entityId: "cit:bread_6",
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 生猪排配置 ====================
  "minecraft:porkchop": {
    _default: {
      wallEntityId: null,
      ceilEntityId: null,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
    "Raw Porkchop_0": {
      entityId: "cit:raw_porkchop_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Raw Porkchop_1": {
      entityId: "cit:raw_porkchop_1",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Raw Porkchop_2_top": {
      entityId: "cit:raw_porkchop_2_top",
      wallEntityId: null,
      ceilEntityId: "cit:raw_porkchop_2_top",
      noGravity: true,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
    "Raw Porkchop_3_top": {
      entityId: "cit:raw_porkchop_3_top",
      wallEntityId: null,
      ceilEntityId: "cit:raw_porkchop_3_top",
      noGravity: true,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
    "Raw Porkchop_4": {
      entityId: "cit:raw_porkchop_4",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 熟猪排配置 ====================
  "minecraft:cooked_porkchop": {
    _default: {
      wallEntityId: null,
      ceilEntityId: null,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
    "Cooked Porkchop_0": {
      entityId: "cit:cooked_porkchop_0",
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -0.01,
      },
    },
  },
  // ==================== 金苹果配置 ====================
  "minecraft:golden_apple": {
    // 默认配置（所有未特殊配置的金苹果使用）
    _default: {
      wallEntityId: "cit:golden_apple_0_wall",
      ceilEntityId: "cit:golden_apple_0_top",
      noGravity: false, // 受重力影响
      hitbox: null, // 默认点击区域 (0.06 × 0.06)
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 7又1/8个方块
      },
    },
    "Golden Apple_0": {
      entityId: "cit:golden_apple_0",
      wallEntityId: "cit:golden_apple_0_wall",
      ceilEntityId: "cit:golden_apple_0_top",
      noGravity: false,
      hitbox: null,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -0.4453125,
      },
    },
    "Golden Apple_0_wall": {
      wallEntityId: "cit:golden_apple_0_wall",
      ceilEntityId: "cit:golden_apple_0_top",
      noGravity: true,
      hitbox: null, // 默认点击区域
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 7又1/8个方块
      },
    },
    "Golden Apple_0_top": {
      wallEntityId: "cit:golden_apple_0_wall",
      ceilEntityId: "cit:golden_apple_0_top",
      noGravity: true,
      hitbox: null, // 顶部点击区域 (1 × 1)
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 (scale=2 时金苹果顶部贴天花)
      },
    },
    "Golden Apple_1": {
      entityId: "cit:golden_apple_1",
      wallEntityId: null,
      ceilEntityId: null,
      noGravity: false,
      hitbox: null,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -0.4453125,
      },
    },
    "Golden Apple_1_top": {
      entityId: "cit:golden_apple_1_top",
      wallEntityId: null,
      ceilEntityId: "cit:golden_apple_1_top",
      noGravity: true,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -1.765625,
      },
    },
  },
  // ==================== 附魔金苹果配置 ====================
  "minecraft:enchanted_golden_apple": {
    // 默认配置（所有未特殊配置的附魔金苹果使用）
    _default: {
      wallEntityId: "cit:enchanted_golden_apple_0_wall",
      ceilEntityId: "cit:enchanted_golden_apple_0_top",
      noGravity: false, // 受重力影响
      hitbox: null, // 默认点击区域 (0.06 × 0.06)
      placement: {
        wall: 0.21875, // 墙面距离
        ground: 1.0, // 地面高度
        ceiling: -0.4453125, // 天花板高度 7又1/8个方块
      },
    },
    "Enchanted Golden Apple_0": {
      entityId: "cit:enchanted_golden_apple_0",
      wallEntityId: "cit:enchanted_golden_apple_0_wall",
      ceilEntityId: "cit:enchanted_golden_apple_0_top",
      noGravity: false,
      hitbox: null,
      placement: {
        wall: 0.21875,
        ground: 1.0,
        ceiling: -0.4453125,
      },
    },
  },
  // ==================== 鳕鱼配置 ====================
  "minecraft:cod": {
    _default: {
      entityId: "cit:raw_cod_0",
      wallEntityId: "cit:raw_cod_0",
      ceilEntityId: null,
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875,
        ceiling: -0.01,
      },
    },
    "Raw Cod_0": {
      entityId: "cit:raw_cod_0",
      wallEntityId: "cit:raw_cod_0",
      ceilEntityId: null,
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875, //1÷128*127=0.9921875
        ceiling: -0.01,
      },
    },
    "Raw Cod_1": {
      entityId: "cit:raw_cod_1",
      wallEntityId: null,
      ceilEntityId: "cit:raw_cod_1",
      noGravity: true,
      variantCount: 2,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
    "Raw Cod_1a": {
      entityId: "cit:raw_cod_1a",
      wallEntityId: null,
      ceilEntityId: "cit:raw_cod_1a",
      noGravity: true,
      spawnVariant: 1,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
  },
  // ==================== 鲑鱼配置 ====================
  "minecraft:salmon": {
    _default: {
      entityId: "cit:raw_salmon_0",
      wallEntityId: "cit:raw_salmon_0",
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875, //1÷128*127=0.9921875
        ceiling: -0.01,
      },
    },
    "Raw Salmon_0": {
      entityId: "cit:raw_salmon_0",
      wallEntityId: "cit:raw_salmon_0",
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875, //1÷128*127=0.9921875
        ceiling: -0.01,
      },
    },
    "Raw Salmon_1": {
      entityId: "cit:raw_salmon_1",
      wallEntityId: null,
      ceilEntityId: null,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
    "Raw Salmon_2": {
      entityId: "cit:raw_salmon_2",
      wallEntityId: null,
      ceilEntityId: "cit:raw_salmon_2",
      noGravity: true,
      placement: {
        wall: 0.3,
        ground: 1.0,
        ceiling: -1.5703125,
      },
    },
  },
  // ==================== 热带鱼配置 ====================
  "minecraft:tropical_fish": {
    _default: {
      entityId: "cit:tropical_fish_0",
      wallEntityId: "cit:tropical_fish_0",
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875, //1÷128*127=0.9921875
        ceiling: -0.01,
      },
    },
    "Tropical Fish_0": {
      entityId: "cit:tropical_fish_0",
      wallEntityId: "cit:tropical_fish_0",
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875, //1÷128*127=0.9921875
        ceiling: -0.01,
      },
    },
    "Tropical Fish_1": {
      entityId: "cit:tropical_fish_1",
      wallEntityId: "cit:tropical_fish_1",
      noGravity: true,
      placement: {
        wall: 0,
        ground: 0.9921875, //1÷128*127=0.9921875
        ceiling: -0.01,
      },
    },
  },
  // ==================== 河豚配置 ====================
  "minecraft:pufferfish": {
    _default: {
      entityId: "cit:pufferfish_0",
      wallEntityId: "cit:pufferfish_0",
      noGravity: true,
      placement: {
        wall: 0.3,
        ground: 1.01,
        ceiling: -0.01,
      },
    },
    Pufferfish_0: {
      entityId: "cit:pufferfish_0",
      wallEntityId: "cit:pufferfish_0",
      noGravity: true,
      placement: {
        wall: 0.3,
        ground: 1.01,
        ceiling: -0.01,
      },
    },
    Pufferfish_1: {
      entityId: "cit:pufferfish_1",
      ceilEntityId: "cit:pufferfish_1",
      noGravity: true,
      placement: {
        wall: 0.3,
        ground: 1.01,
        ceiling: -0.01,
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
export function getEntityId(itemTypeId, itemName, isWall = false, isCeil = false) {
  const config = getItemConfig(itemTypeId, itemName);
  const baseEntityId = itemTypeId.replace("minecraft:", "cit:");
  // 天花板放置且有 ceilEntityId 配置时使用独立 top 实体
  if (isCeil && (config === null || config === void 0 ? void 0 : config.ceilEntityId)) {
    return config.ceilEntityId;
  }
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
/**
 * 获取实体的属性变体总数（仅限用 variantCount 声明的实体）
 * @param entityTypeId - 实体 typeId（如 "cit:bowl_2"）
 * @returns 变体数量，不存在则返回 0
 */
export function getVariantCount(entityTypeId) {
  for (const itemConfigs of Object.values(itemConfig)) {
    for (const subConfig of Object.values(itemConfigs)) {
      if (subConfig?.entityId === entityTypeId && subConfig?.variantCount) {
        return subConfig.variantCount;
      }
      if (subConfig?.wallEntityId === entityTypeId && subConfig?.wallVariantCount) {
        return subConfig.wallVariantCount;
      }
    }
  }
  return 0;
}
/**
 * 获取生成时应设置的初始 variant 值（用于直接命名生成指定变体）
 * @param itemTypeId - 物品 typeId
 * @param itemName - 物品自定义名称
 * @param isWall - 是否墙面放置
 * @returns variant 值，不需要则返回 null
 */
export function getSpawnVariant(itemTypeId, itemName, isWall = false) {
  const config = getItemConfig(itemTypeId, itemName);
  if (!config) return null;
  if (isWall) return config.wallSpawnVariant ?? null;
  return config.spawnVariant ?? null;
}
console.warn("[CIT] item_config.js 已加载");
