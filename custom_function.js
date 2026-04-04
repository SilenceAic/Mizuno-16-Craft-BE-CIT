import * as mc from "@minecraft/server";
import { getPlacementConfig } from "./item_config";
/**
 * List of items that can be placed as 3D entities
 */
export const item3dList = new Set([
    "minecraft:amethyst_shard",
    "minecraft:apple",
    "minecraft:arrow",
    "minecraft:baked_potato",
    "minecraft:beef",
    "minecraft:beetroot",
    "minecraft:beetroot_seeds",
    "minecraft:black_dye",
    "minecraft:blaze_powder",
    "minecraft:blaze_rod",
    "minecraft:blue_dye",
    "minecraft:blue_egg",
    "minecraft:bone",
    "minecraft:bone_meal",
    "minecraft:book",
    "minecraft:book_and_quill",
    "minecraft:bow",
    "minecraft:bowl",
    "minecraft:bread",
    "minecraft:brick",
    "minecraft:brown_dye",
    "minecraft:brown_egg",
    "minecraft:bucket",
    "minecraft:carrot",
    "minecraft:chainmail_boots",
    "minecraft:chainmail_chestplate",
    "minecraft:chainmail_helmet",
    "minecraft:chainmail_leggings",
    "minecraft:charcoal",
    "minecraft:chicken",
    "minecraft:clay_ball",
    "minecraft:coal",
    "minecraft:cocoa_beans",
    "minecraft:cod",
    "minecraft:compass",
    "minecraft:cooked_beef",
    "minecraft:cooked_chicken",
    "minecraft:cooked_cod",
    "minecraft:cooked_mutton",
    "minecraft:cooked_porkchop",
    "minecraft:cooked_rabbit",
    "minecraft:cooked_salmon",
    "minecraft:copper_axe",
    "minecraft:copper_boots",
    "minecraft:copper_chestplate",
    "minecraft:copper_helmet",
    "minecraft:copper_hoe",
    "minecraft:copper_ingot",
    "minecraft:copper_leggings",
    "minecraft:copper_pickaxe",
    "minecraft:copper_shovel",
    "minecraft:copper_sword",
    "minecraft:crossbow",
    "minecraft:cyan_dye",
    "minecraft:diamond",
    "minecraft:diamond_axe",
    "minecraft:diamond_boots",
    "minecraft:diamond_chestplate",
    "minecraft:diamond_helmet",
    "minecraft:diamond_hoe",
    "minecraft:diamond_leggings",
    "minecraft:diamond_pickaxe",
    "minecraft:diamond_shovel",
    "minecraft:diamond_sword",
    "minecraft:egg",
    "minecraft:emerald",
    "minecraft:enchanted_book",
    "minecraft:enchanted_golden_apple",
    "minecraft:ender_eye",
    "minecraft:ender_pearl",
    "minecraft:experience_bottle",
    "minecraft:feather",
    "minecraft:fermented_spider_eye",
    "minecraft:fishing_rod",
    "minecraft:flint",
    "minecraft:flint_and_steel",
    "minecraft:ghast_tear",
    "minecraft:glass_bottle",
    "minecraft:glistering_melon_slice",
    "minecraft:glow_berries",
    "minecraft:glowstone_dust",
    "minecraft:gold_ingot",
    "minecraft:gold_nugget",
    "minecraft:golden_apple",
    "minecraft:golden_axe",
    "minecraft:golden_boots",
    "minecraft:golden_carrot",
    "minecraft:golden_chestplate",
    "minecraft:golden_helmet",
    "minecraft:golden_hoe",
    "minecraft:golden_leggings",
    "minecraft:golden_pickaxe",
    "minecraft:golden_shovel",
    "minecraft:golden_sword",
    "minecraft:gunpowder",
    "minecraft:honey_bottle",
    "minecraft:iron_axe",
    "minecraft:iron_boots",
    "minecraft:iron_chestplate",
    "minecraft:iron_helmet",
    "minecraft:iron_hoe",
    "minecraft:iron_ingot",
    "minecraft:iron_leggings",
    "minecraft:iron_nugget",
    "minecraft:iron_pickaxe",
    "minecraft:iron_shovel",
    "minecraft:iron_sword",
    "minecraft:kelp",
    "minecraft:lapis_lazuli",
    "minecraft:lead",
    "minecraft:leather",
    "minecraft:leather_boots",
    "minecraft:leather_chestplate",
    "minecraft:leather_helmet",
    "minecraft:leather_leggings",
    "minecraft:mace",
    "minecraft:melon_seeds",
    "minecraft:melon_slice",
    "minecraft:mushroom_stew",
    "minecraft:mutton",
    "minecraft:nether_brick",
    "minecraft:nether_wart",
    "minecraft:netherite_axe",
    "minecraft:netherite_boots",
    "minecraft:netherite_chestplate",
    "minecraft:netherite_helmet",
    "minecraft:netherite_hoe",
    "minecraft:netherite_ingot",
    "minecraft:netherite_leggings",
    "minecraft:netherite_pickaxe",
    "minecraft:netherite_scrap",
    "minecraft:netherite_shovel",
    "minecraft:netherite_sword",
    "minecraft:paper",
    "minecraft:pitcher_pod",
    "minecraft:poisonous_potato",
    "minecraft:porkchop",
    "minecraft:potato",
    "minecraft:pumpkin_pie",
    "minecraft:pumpkin_seeds",
    "minecraft:quartz",
    "minecraft:rabbit",
    "minecraft:rabbit_hide",
    "minecraft:rabbit_stew",
    "minecraft:raw_copper",
    "minecraft:raw_gold",
    "minecraft:raw_iron",
    "minecraft:redstone",
    "minecraft:rotten_flesh",
    "minecraft:salmon",
    "minecraft:shears",
    "minecraft:slime_ball",
    "minecraft:snowball",
    "minecraft:spider_eye",
    "minecraft:spyglass",
    "minecraft:stick",
    "minecraft:stone_axe",
    "minecraft:stone_hoe",
    "minecraft:stone_pickaxe",
    "minecraft:stone_shovel",
    "minecraft:stone_sword",
    "minecraft:string",
    "minecraft:sweet_berries",
    "minecraft:torchflower_seeds",
    "minecraft:totem_of_undying",
    "minecraft:trident",
    "minecraft:tropical_fish",
    "minecraft:turtle_helmet",
    "minecraft:wheat",
    "minecraft:wheat_seeds",
    "minecraft:wooden_axe",
    "minecraft:wooden_hoe",
    "minecraft:wooden_pickaxe",
    "minecraft:wooden_shovel",
    "minecraft:wooden_sword",
    "minecraft:wooden_pickaxe",
    "minecraft:written_book",
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
    }
    catch (e) {
        // Silently handle errors
    }
}
/**
 * 从实体恢复物品堆栈（包括自定义名称）
 * @param entity - 要恢复的实体
 * @returns 恢复后的物品堆栈
 */
export function restoreItemStack(entity) {
    let itemId = entity.typeId.replace("item3d:", "minecraft:");
    // Handle entity suffix overrides (e.g. item3d:apple_wall -> minecraft:apple)
    itemId = itemId.replace("_wall", "").replace("_top", "");
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
        }
        catch (e) {
            // Silently handle errors
        }
    }
    // 降级方案1：从动态属性恢复
    const savedItemData = entity.getDynamicProperty("item3d:item_data");
    if (savedItemData) {
        try {
            const itemData = JSON.parse(savedItemData);
            const itemStack = new mc.ItemStack(itemId, 1);
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
                            }
                            catch (e) {
                                // Failed to add this enchantment, continue with others
                            }
                        }
                    }
                }
                catch (e) {
                    // Item not enchantable or error restoring enchantments
                }
            }
            return itemStack;
        }
        catch (e) {
            // Silently handle errors
        }
    }
    // 降级方案2：使用旧的恢复方式
    const itemStack = new mc.ItemStack(itemId, 1);
    const customName = entity.getDynamicProperty("item3d:custom_name");
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
            if (typeFamily.hasTypeFamily("item3d:four_variants"))
                return 4;
            if (typeFamily.hasTypeFamily("item3d:three_variants"))
                return 3;
            if (typeFamily.hasTypeFamily("item3d:two_variants"))
                return 2;
        }
    }
    catch (error) {
        console.error(`[Item3D] Error checking type_family: ${error}`);
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
                y: blockLoc.y + faceLocation.y,
                z: blockLoc.z - config.wall,
            };
        case mc.Direction.South:
            return {
                x: blockLoc.x + faceLocation.x,
                y: blockLoc.y + faceLocation.y,
                z: blockLoc.z + 1 + config.wall,
            };
        case mc.Direction.West:
            return {
                x: blockLoc.x - config.wall,
                y: blockLoc.y + faceLocation.y,
                z: blockLoc.z + faceLocation.z,
            };
        case mc.Direction.East:
            return {
                x: blockLoc.x + 1 + config.wall,
                y: blockLoc.y + faceLocation.y,
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
                properties = { "item3d:is_wall": false, "item3d:wall_rotation": 0 };
                break;
            case mc.Direction.Down:
                targetLocation = {
                    x: block.location.x + faceLocation.x,
                    y: block.location.y + config.ceiling,
                    z: block.location.z + faceLocation.z,
                };
                properties = { "item3d:is_wall": false, "item3d:wall_rotation": 0 };
                break;
            case mc.Direction.North:
                targetLocation = {
                    x: block.location.x + faceLocation.x,
                    y: block.location.y + faceLocation.y,
                    z: block.location.z - config.wall,
                };
                properties = { "item3d:is_wall": true, "item3d:wall_face": 180 };
                break;
            case mc.Direction.South:
                targetLocation = {
                    x: block.location.x + faceLocation.x,
                    y: block.location.y + faceLocation.y,
                    z: block.location.z + 1 + config.wall,
                };
                properties = { "item3d:is_wall": true, "item3d:wall_face": 0 };
                break;
            case mc.Direction.West:
                targetLocation = {
                    x: block.location.x - config.wall,
                    y: block.location.y + faceLocation.y,
                    z: block.location.z + faceLocation.z,
                };
                properties = { "item3d:is_wall": true, "item3d:wall_face": 90 };
                break;
            case mc.Direction.East:
                targetLocation = {
                    x: block.location.x + 1 + config.wall,
                    y: block.location.y + faceLocation.y,
                    z: block.location.z + faceLocation.z,
                };
                properties = { "item3d:is_wall": true, "item3d:wall_face": 270 };
                break;
            default:
                targetLocation = {
                    x: block.location.x + 0.5,
                    y: block.location.y + config.ground,
                    z: block.location.z + 0.5,
                };
                properties = { "item3d:is_wall": false, "item3d:wall_rotation": 0 };
        }
        return { targetLocation, properties };
    }
    else {
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
            properties: { "item3d:is_wall": false, "item3d:wall_rotation": 0 },
        };
    }
}
//# sourceMappingURL=custom_function.js.map