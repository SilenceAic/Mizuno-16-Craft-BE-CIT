import * as mc from "@minecraft/server";
import { getPlacementConfig } from "./item_config";
/**
 * List of items that can be placed as 3D entities
 */
export const item3dList = new Set([
  "minecraft:stick",
  "minecraft:iron_ingot",
  "minecraft:gold_ingot",
  "minecraft:bowl",
  "minecraft:gunpowder",
  "minecraft:wheat_seeds",
  "minecraft:wheat",
  "minecraft:bucket",
  "minecraft:water_bucket",
  "minecraft:lava_bucket",
  "minecraft:snowball",
  "minecraft:leather",
  "minecraft:milk_bucket",
  "minecraft:pufferfish_bucket",
  "minecraft:salmon_bucket",
  "minecraft:cod_bucket",
  "minecraft:tropical_fish_bucket",
  "minecraft:brick",
  "minecraft:paper",
  "minecraft:book",
  "minecraft:enchanted_book",
  "minecraft:egg",
  "minecraft:glowstone_dust",
  "minecraft:cocoa_beans",
  "minecraft:bone",
  "minecraft:pumpkin_seeds",
  "minecraft:melon_seeds",
  "minecraft:nether_wart",
  "minecraft:writable_book",
  "minecraft:netherbrick",
  "minecraft:rabbit_hide",
  "minecraft:beetroot_seeds",
  "minecraft:apple",
  "minecraft:enchanted_golden_apple",
  "minecraft:mushroom_stew",
  "minecraft:bread",
  "minecraft:porkchop",
  "minecraft:cooked_porkchop",
  "minecraft:golden_apple",
  "minecraft:cod",
  "minecraft:salmon",
  "minecraft:tropical_fish",
  "minecraft:pufferfish",
  "minecraft:cooked_cod",
  "minecraft:cooked_salmon",
  "minecraft:cake",
  "minecraft:cookie",
  "minecraft:melon_slice",
  "minecraft:beef",
  "minecraft:cooked_beef",
  "minecraft:chicken",
  "minecraft:cooked_chicken",
  "minecraft:carrot",
  "minecraft:potato",
  "minecraft:baked_potato",
  "minecraft:pumpkin_pie",
  "minecraft:rabbit",
  "minecraft:cooked_rabbit",
  "minecraft:rabbit_stew",
  "minecraft:mutton",
  "minecraft:cooked_mutton",
  "minecraft:beetroot",
  "minecraft:beetroot_soup",
  "minecraft:sweet_berries",
  "minecraft:glow_berries",
  "minecraft:honey_bottle",
  "minecraft:wooden_axe",
  "minecraft:stone_axe",
]);
/**
 * 需要被拦截放置、转向 item3d 系统的方块类型物品及其名称要求
 * key: 物品 typeId，value: 需要匹配的 nameTag（null 表示无名称要求，任意名称均触发）
 * 这些物品通过 playerInteractWithBlock 触发（非 itemUse）
 */
export const blockItem3dNameMap = new Map([
  ["minecraft:heavy_weighted_pressure_plate", ["HWPP_0"]],
  ["minecraft:light_weighted_pressure_plate", ["LWPP_0"]],
  ["minecraft:redstone", ["Redstone Dust_0"]],
]);
// 物品缓存 - 存储原始物品的克隆，用于完美恢复
// 键：实体的唯一ID，值：原始ItemStack的克隆
const itemStackCache = new Map();
/**
 * 保存物品堆栈到缓存（用于完美恢复堆叠性）
 * @param entity - 要保存的实体
 * @param originalItem - 原始物品堆栈
 */
export function cacheItemStack(entity, originalItem) {
  try {
    // 使用 clone() 方法创建原始物品的完整副本
    const clonedItem = originalItem.clone();
    itemStackCache.set(entity.id, clonedItem);
  } catch (e) {
    // Silently handle errors
  }
}
/**
 * 从实体恢复物品堆栈（包括自定义名称）
 * @param entity - 要恢复的实体
 * @returns 恢复后的物品堆栈
 */
export function restoreItemStack(entity) {
  let itemId = entity.typeId.replace("cit:", "minecraft:");
  // Handle entity suffix overrides (e.g. cit:apple_wall -> minecraft:apple, cit:stick_0 -> minecraft:stick)
  itemId = itemId.replace("_wall", "").replace("_top", "");
  itemId = itemId.replace(/_\d+$/, "");
  // 优先方案：从缓存中恢复原始物品的克隆
  if (itemStackCache.has(entity.id)) {
    try {
      const cachedItem = itemStackCache.get(entity.id);
      itemStackCache.delete(entity.id); // 使用后删除缓存
      // 再次克隆以避免引用问题
      const restoredItem = cachedItem.clone();
      // 强制设置数量为1（因为每个3D实体只代表1个物品）
      restoredItem.amount = 1;
      return restoredItem;
    } catch (e) {
      // Silently handle errors
    }
  }
  // 降级方案1：从动态属性恢复
  const savedItemData = entity.getDynamicProperty("cit:item_data");
  if (savedItemData) {
    try {
      const itemData = JSON.parse(savedItemData);
      const itemStack = new mc.ItemStack(itemData.typeId || itemId, 1);
      // 恢复名称
      if (itemData.nameTag) {
        itemStack.nameTag = itemData.nameTag;
      }
      // 恢复 lore
      if (itemData.lore && itemData.lore.length > 0) {
        itemStack.setLore(itemData.lore);
      }
      // 恢复附魔
      if (itemData.enchantments && itemData.enchantments.length > 0) {
        try {
          const enchantableComp = itemStack.getComponent(mc.ItemComponentTypes.Enchantable);
          if (enchantableComp) {
            for (const enchData of itemData.enchantments) {
              try {
                const enchType = mc.EnchantmentTypes.get(enchData.id);
                if (enchType) {
                  enchantableComp.addEnchantment({
                    type: enchType,
                    level: enchData.level,
                  });
                }
              } catch (e) {
                // Failed to add this enchantment, continue with others
              }
            }
          }
        } catch (e) {
          // Item not enchantable or error restoring enchantments
        }
      }
      return itemStack;
    } catch (e) {
      // Silently handle errors
    }
  }
  // 降级方案2：使用旧的恢复方式
  const itemStack = new mc.ItemStack(itemId, 1);
  const customName = entity.getDynamicProperty("cit:custom_name");
  if (customName) {
    itemStack.nameTag = customName;
  }
  return itemStack;
}
/**
 * Get maximum variants for an entity based on type_family
 */
export function getMaxVariants(entity) {
  try {
    const typeFamily = entity.getComponent(mc.EntityComponentTypes.TypeFamily);
    if (typeFamily) {
      if (typeFamily.hasTypeFamily("cit:four_variants")) return 4;
      if (typeFamily.hasTypeFamily("cit:three_variants")) return 3;
      if (typeFamily.hasTypeFamily("cit:two_variants")) return 2;
    }
  } catch (error) {
    console.error(`[CIT] Error checking type_family: ${error}`);
  }
  return 1; // Default: no variant switching
}
/**
 * Calculate spawn location based on view block and face
 * @param viewBlock - 视图方块信息
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 */
export function getSpawnLocation(viewBlock, itemTypeId, itemName = null) {
  const { block, faceLocation, face } = viewBlock;
  const blockLoc = block.location;
  const config = getPlacementConfig(itemTypeId, itemName);
  switch (face) {
    case mc.Direction.Up:
      return {
        x: blockLoc.x + faceLocation.x,
        y: blockLoc.y + config.ground,
        z: blockLoc.z + faceLocation.z,
      };
    case mc.Direction.Down:
      return {
        x: blockLoc.x + faceLocation.x,
        y: blockLoc.y + config.ceiling,
        z: blockLoc.z + faceLocation.z,
      };
    case mc.Direction.North:
      return {
        x: blockLoc.x + faceLocation.x,
        y: blockLoc.y + faceLocation.y + (config.wallY || 0),
        z: blockLoc.z - config.wall,
      };
    case mc.Direction.South:
      return {
        x: blockLoc.x + faceLocation.x,
        y: blockLoc.y + faceLocation.y + (config.wallY || 0),
        z: blockLoc.z + 1 + config.wall,
      };
    case mc.Direction.West:
      return {
        x: blockLoc.x - config.wall,
        y: blockLoc.y + faceLocation.y + (config.wallY || 0),
        z: blockLoc.z + faceLocation.z,
      };
    case mc.Direction.East:
      return {
        x: blockLoc.x + 1 + config.wall,
        y: blockLoc.y + faceLocation.y + (config.wallY || 0),
        z: blockLoc.z + faceLocation.z,
      };
    default:
      return {
        x: blockLoc.x + 0.5,
        y: blockLoc.y + config.ground,
        z: blockLoc.z + 0.5,
      };
  }
}
/**
 * Calculate held item position based on view block or player rotation
 * @param player - 玩家对象
 * @param viewBlock - 视图方块信息
 * @param itemTypeId - 物品类型ID
 * @param itemName - 物品自定义名称
 */
export function calculateTargetLocation(player, viewBlock, itemTypeId, itemName = null) {
  if (viewBlock) {
    const { block, faceLocation, face } = viewBlock;
    const config = getPlacementConfig(itemTypeId, itemName);
    let targetLocation;
    let properties = {};
    switch (face) {
      case mc.Direction.Up:
        targetLocation = {
          x: block.location.x + faceLocation.x,
          y: block.location.y + config.ground,
          z: block.location.z + faceLocation.z,
        };
        properties = { "cit:is_wall": false, "cit:wall_rotation": 0 };
        break;
      case mc.Direction.Down:
        targetLocation = {
          x: block.location.x + faceLocation.x,
          y: block.location.y + config.ceiling,
          z: block.location.z + faceLocation.z,
        };
        properties = { "cit:is_wall": false, "cit:wall_rotation": 0 };
        break;
      case mc.Direction.North:
        targetLocation = {
          x: block.location.x + faceLocation.x,
          y: block.location.y + faceLocation.y + (config.wallY || 0),
          z: block.location.z - config.wall,
        };
        properties = { "cit:is_wall": true, "cit:wall_face": 180 };
        break;
      case mc.Direction.South:
        targetLocation = {
          x: block.location.x + faceLocation.x,
          y: block.location.y + faceLocation.y + (config.wallY || 0),
          z: block.location.z + 1 + config.wall,
        };
        properties = { "cit:is_wall": true, "cit:wall_face": 0 };
        break;
      case mc.Direction.West:
        targetLocation = {
          x: block.location.x - config.wall,
          y: block.location.y + faceLocation.y + (config.wallY || 0),
          z: block.location.z + faceLocation.z,
        };
        properties = { "cit:is_wall": true, "cit:wall_face": 90 };
        break;
      case mc.Direction.East:
        targetLocation = {
          x: block.location.x + 1 + config.wall,
          y: block.location.y + faceLocation.y + (config.wallY || 0),
          z: block.location.z + faceLocation.z,
        };
        properties = { "cit:is_wall": true, "cit:wall_face": 270 };
        break;
      default:
        targetLocation = {
          x: block.location.x + 0.5,
          y: block.location.y + config.ground,
          z: block.location.z + 0.5,
        };
        properties = { "cit:is_wall": false, "cit:wall_rotation": 0 };
    }
    return { targetLocation, properties };
  } else {
    // When not looking at a block (moving in air)
    const rotation = player.getRotation();
    const yRad = ((rotation.y + 90) * Math.PI) / 180;
    const xRad = (rotation.x * Math.PI) / 180;
    const directionVector = {
      x: Math.cos(xRad) * Math.cos(yRad),
      y: Math.sin(-xRad),
      z: Math.cos(xRad) * Math.sin(yRad),
    };
    const headLocation = player.getHeadLocation();
    const targetLocation = {
      x: headLocation.x + directionVector.x,
      y: headLocation.y + directionVector.y,
      z: headLocation.z + directionVector.z,
    };
    return {
      targetLocation,
      properties: { "cit:is_wall": false, "cit:wall_rotation": 0 },
    };
  }
}
console.warn("[CIT] custom_function.js 已加载");
