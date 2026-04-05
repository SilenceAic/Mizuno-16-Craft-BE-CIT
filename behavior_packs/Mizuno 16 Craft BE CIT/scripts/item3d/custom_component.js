import * as mc from "@minecraft/server";
import {
  item3dList,
  blockItem3dNameMap,
  getSpawnLocation,
  calculateTargetLocation,
  restoreItemStack,
  cacheItemStack,
} from "./custom_function";
import { getVariantByName, shouldDisableGravity, getHitboxSize, getHitboxEvent, getEntityId } from "./item_config";
const components = new Map();
components.set("cit:core", {
  onItemUse(event) {
    const { itemStack, source } = event;
    // 检查普通 3D 物品列表或方块类型物品列表
    if (!itemStack || !source.isSneaking) return;
    const isBlockItem = !item3dList.has(itemStack.typeId) && blockItem3dNameMap.has(itemStack.typeId);
    if (!item3dList.has(itemStack.typeId) && !isBlockItem) return;
    if (isBlockItem) {
      const requiredNames = blockItem3dNameMap.get(itemStack.typeId);
      if (requiredNames !== null && requiredNames !== undefined && !requiredNames.includes(itemStack.nameTag)) return;
    }
    // Prevent placing if player already holds an item3d entity
    if (source.hasTag("cit")) {
      return;
    }
    // Get the block the player is looking at
    const viewBlock = source.getBlockFromViewDirection({
      maxDistance: 5,
      includeLiquidBlocks: false,
      includePassableBlocks: false,
    });
    if (!viewBlock || viewBlock.block.isAir || viewBlock.block.isLiquid) {
      return;
    }
    // Calculate spawn position and rotation
    const rotation = source.getRotation();
    const yRotation = (rotation.y + 180) % 360;
    const itemName = itemStack.nameTag;
    const spawnLocation = getSpawnLocation(viewBlock, itemStack.typeId, itemName);
    // Get wall properties based on placement face
    const face = viewBlock.face;
    let wallProperties = { is_wall: false, wall_face: 0 };
    // Items with "_top" suffix are always ground/ceiling items, never wall-mounted
    const isTopItem = itemName && itemName.toLowerCase().includes("_top");
    if (!isTopItem) {
      switch (face) {
        case mc.Direction.North:
          wallProperties = { is_wall: true, wall_face: 180 };
          break;
        case mc.Direction.South:
          wallProperties = { is_wall: true, wall_face: 0 };
          break;
        case mc.Direction.West:
          wallProperties = { is_wall: true, wall_face: 90 };
          break;
        case mc.Direction.East:
          wallProperties = { is_wall: true, wall_face: 270 };
          break;
      }
    }
    try {
      mc.system.run(() => {
        // Get entity ID (supports entity override for wall items)
        const entityId = getEntityId(itemStack.typeId, itemName);
        // Spawn entity with initial rotation to avoid visible rotation animation
        const spawnedEntity = source.dimension.spawnEntity(entityId, spawnLocation, {
          initialRotation: yRotation,
          spawnEvent: "cit:on_spawn",
        });
        spawnedEntity.addTag("cit");
        // Set wall/top properties immediately after spawn
        try {
          spawnedEntity.setProperty("cit:is_wall", wallProperties.is_wall);
          spawnedEntity.setProperty("cit:wall_face", wallProperties.wall_face);
          spawnedEntity.setProperty("cit:wall_rotation", 0);
          spawnedEntity.setProperty("cit:is_top", !!isTopItem);
        } catch (e) {
          // Silently handle errors
        }
        // Cache the original item for perfect restoration
        cacheItemStack(spawnedEntity, itemStack);
        // Save item data to entity for later retrieval (fallback for cache failure)
        const itemLore = itemStack.getLore();
        // Get enchantments if item is enchantable
        let enchantments = [];
        try {
          const enchantableComp = itemStack.getComponent(mc.ItemComponentTypes.Enchantable);
          if (enchantableComp) {
            const enchs = enchantableComp.getEnchantments();
            enchantments = enchs.map((e) => ({
              id: e.type.id,
              level: e.level,
            }));
          }
        } catch (e) {
          // Item not enchantable or error getting enchantments
        }
        const itemData = {
          nameTag: itemName,
          lore: itemLore,
          enchantments: enchantments,
        };
        try {
          spawnedEntity.setDynamicProperty("cit:item_data", JSON.stringify(itemData));
          if (itemName) {
            spawnedEntity.setDynamicProperty("cit:custom_name", itemName);
          }
        } catch (e) {
          // Silently handle errors
        }
        // Check for custom name and set variant accordingly (for items with variant support)
        if (itemName) {
          const variant = getVariantByName(itemStack.typeId, itemName);
          if (variant !== null) {
            try {
              spawnedEntity.setProperty("cit:variant", variant);
            } catch (variantError) {
              // Silently handle errors
            }
          }
          // Check if this item should have gravity disabled
          if (shouldDisableGravity(itemStack.typeId, itemName)) {
            try {
              spawnedEntity.triggerEvent("cit:set_no_gravity");
              spawnedEntity.addTag("cit:no_gravity");
            } catch (e) {
              // Entity might not support this event
            }
          }
          // Check if this item should have custom hitbox size
          const hitboxSize = getHitboxSize(itemStack.typeId, itemName);
          if (hitboxSize) {
            const hitboxEvent = getHitboxEvent(hitboxSize);
            if (hitboxEvent) {
              try {
                spawnedEntity.triggerEvent(hitboxEvent);
              } catch (e) {
                // Entity might not support this event
              }
            }
          }
        }
        // Remove one item from player inventory
        source.runCommand(`clear @s ${itemStack.typeId} 0 1`);
      });
      event.cancel = true;
    } catch (error) {
      source.sendMessage("§cCannot place this item: " + error);
    }
  },
  onPlayerInteractWithBlock(event) {
    const { block, itemStack, player } = event;
    if (!itemStack || !player.isSneaking || block.isAir || block.isLiquid) return;
    // 普通 3D 物品：取消方块交互（生成由 onItemUse 负责）
    if (item3dList.has(itemStack.typeId)) {
      event.cancel = true;
      return;
    }
    // 方块类型物品：校验名称后取消放置（生成由 onItemUse 负责）
    if (blockItem3dNameMap.has(itemStack.typeId)) {
      const requiredNames = blockItem3dNameMap.get(itemStack.typeId);
      if (requiredNames !== null && requiredNames !== undefined && !requiredNames.includes(itemStack.nameTag)) return;
      event.cancel = true;
    }
  },
  onEntityHitEntity(event) {
    const { damagingEntity, hitEntity } = event;
    // Check if player hit a 3D item entity
    if (damagingEntity.typeId !== "minecraft:player") {
      return;
    }
    // Validate entity before accessing properties
    if (!hitEntity.isValid || !hitEntity.hasTag("cit")) {
      return;
    }
    // Prevent duplicate triggers for magnet
    if (hitEntity.hasTag("cit:magnet")) {
      return;
    }
    // Mark entity for absorption
    hitEntity.addTag("cit:magnet");
    hitEntity.setDynamicProperty("cit:absorber", damagingEntity.name);
    hitEntity.setDynamicProperty("cit:absorb_time", 0);
    // Initial upward pop
    hitEntity.applyImpulse({ x: 0, y: 0.3, z: 0 });
    // Remove ownership if any
    hitEntity.setDynamicProperty("cit:owner", undefined);
    damagingEntity.removeTag("cit");
  },
  onPlayerInteractWithEntity(event) {
    const { player, itemStack, target } = event;
    // Only process if player has empty hand and target is a 3D item
    if (itemStack) {
      return;
    }
    // Validate entity before accessing properties
    if (!target.isValid || !target.hasTag("cit")) {
      return;
    }
    // Normal interaction: Rotate the entity
    if (!player.isSneaking) {
      const itemName = target.getDynamicProperty("cit:custom_name") || "";
      const normalizedName = itemName.toLowerCase();
      const isWallEntity = target.getProperty("cit:is_wall") === true;
      const isTopVariant = normalizedName.includes("_top");
      const hasWallSuffix = normalizedName.endsWith("_wall");
      const rotationMode = isWallEntity && !isTopVariant ? (hasWallSuffix ? "wall_fine" : "wall_cardinal") : "floor";
      mc.system.run(() => {
        if (!target.isValid) return;
        switch (rotationMode) {
          case "wall_fine": {
            const currentRotation = target.getProperty("cit:wall_rotation");
            const newRotation = (currentRotation + 22.5) % 360;
            target.setProperty("cit:wall_rotation", newRotation);
            break;
          }
          case "wall_cardinal": {
            const currentRotation = target.getProperty("cit:wall_rotation");
            let newRotation = currentRotation + 90;
            if (newRotation >= 360) {
              newRotation = 0;
            }
            target.setProperty("cit:wall_rotation", newRotation);
            break;
          }
          default: {
            // Check if this is a top/wall variant item
            if (isTopVariant || hasWallSuffix) {
              // Top/wall items on floor: use property rotation (10 degrees)
              const currentRotation = target.getProperty("cit:wall_rotation");
              const newRotation = (currentRotation + 10) % 360;
              target.setProperty("cit:wall_rotation", newRotation);
            } else {
              // Normal items: use teleport rotation with jump
              const rotation = target.getRotation();
              const location = target.location;
              target.teleport(
                { x: location.x, y: location.y + 0.1, z: location.z },
                {
                  dimension: target.dimension,
                  rotation: { x: rotation.x, y: rotation.y + 10 },
                }
              );
            }
            break;
          }
        }
      });
      return;
    }
    // Sneaking interaction: Ownership management
    const owner = target.getDynamicProperty("cit:owner");
    // If player is the owner
    if (owner === player.name) {
      mc.system.run(() => {
        // Re-validate entity in async context
        if (!target.isValid) {
          player.removeTag("cit");
          return;
        }
        // Release ownership
        target.setDynamicProperty("cit:owner", undefined);
        player.removeTag("cit");
      });
      event.cancel = true;
      return;
    }
    // If entity is already owned by someone else
    if (owner !== undefined) {
      event.cancel = true;
      return;
    }
    // If player already holds another item
    if (player.hasTag("cit")) {
      return;
    }
    // Claim ownership
    mc.system.run(() => {
      // Re-validate entity in async context
      if (!target.isValid) {
        return;
      }
      target.setDynamicProperty("cit:owner", player.name);
      player.addTag("cit");
    });
    event.cancel = true;
  },
});
// Magnet loop
mc.system.runInterval(() => {
  const players = mc.world.getAllPlayers();
  const activeDimensions = new Set(players.map((p) => p.dimension));
  for (const dim of activeDimensions) {
    const magnets = dim.getEntities({ tags: ["cit:magnet"] });
    for (const entity of magnets) {
      try {
        // Validate entity before processing
        if (!entity.isValid) {
          continue;
        }
        const absorberName = entity.getDynamicProperty("cit:absorber");
        const absorber = players.find((p) => p.name === absorberName);
        // If player left or entity timed out (> 5 seconds), drop normally
        let ticks = entity.getDynamicProperty("cit:absorb_time") || 0;
        ticks++;
        entity.setDynamicProperty("cit:absorb_time", ticks);
        if (!absorber || ticks > 100) {
          // Drop logic
          const itemStack = restoreItemStack(entity);
          entity.dimension.spawnItem(itemStack, entity.location);
          entity.remove();
          continue;
        }
        // Calculate vector to player
        const pLoc = absorber.location;
        // Aim for body center (y + 1)
        const targetY = pLoc.y + 1.0;
        const eLoc = entity.location;
        const dx = pLoc.x - eLoc.x;
        const dy = targetY - eLoc.y;
        const dz = pLoc.z - eLoc.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        // If close enough, collect（3 tick后1.5格内直接回收）
        if (ticks > 3 && distSq < 2.25) {
          const itemStack = restoreItemStack(entity);
          const inventory = absorber.getComponent(mc.EntityComponentTypes.Inventory);
          const container = inventory.container;
          try {
            const leftover = container.addItem(itemStack);
            if (leftover) {
              absorber.dimension.spawnItem(leftover, absorber.location);
            }
            // Play pickup sound
            absorber.playSound("random.pop", { pitch: 2.0, volume: 0.5 });
          } catch (e) {
            absorber.dimension.spawnItem(itemStack, absorber.location);
          }
          entity.remove();
          continue;
        }
        // Apply attraction force（限制速度防止过冲抽搐）
        const rawSpeed = 0.6 + ticks * ticks * 0.005;
        const dist = Math.sqrt(distSq) || 0.001;
        const speed = Math.min(rawSpeed, dist * 0.8);
        entity.clearVelocity();
        entity.applyImpulse({
          x: (dx / dist) * speed,
          y: (dy / dist) * speed,
          z: (dz / dist) * speed,
        });
      } catch (e) {
        // Entity might be dead or invalid
      }
    }
  }
}, 1);
// Held item loop
mc.system.runInterval(() => {
  const players = mc.world.getAllPlayers();
  for (const player of players) {
    // Skip players without the item3d tag (not holding any item)
    if (!player.hasTag("cit")) {
      continue;
    }
    const dimension = player.dimension;
    const playerName = player.name;
    const entities = dimension.getEntities({ tags: ["cit"] });
    for (const entity of entities) {
      // Skip entities not owned by this player
      const owner = entity.getDynamicProperty("cit:owner");
      if (owner !== playerName) {
        continue;
      }
      try {
        const viewBlock = player.getBlockFromViewDirection({
          maxDistance: 5,
          includeLiquidBlocks: false,
          includePassableBlocks: false,
        });
        // Get item type and name from entity
        let itemTypeId = entity.typeId.replace("cit:", "minecraft:");
        // Handle entity override: apple_wall -> apple
        itemTypeId = itemTypeId.replace("_wall", "").replace("_top", "");
        const itemName = entity.getDynamicProperty("cit:custom_name");
        const { targetLocation, properties } = calculateTargetLocation(
          player,
          viewBlock,
          itemTypeId,
          itemName !== null && itemName !== void 0 ? itemName : null
        );
        // Set properties (always set, even if null - for free movement)
        if (properties !== null) {
          for (const [key, value] of Object.entries(properties)) {
            entity.setProperty(key, value);
          }
        } else {
          // In air: set is_wall to false for free movement
          entity.setProperty("cit:is_wall", false);
          entity.setProperty("cit:wall_rotation", 0);
        }
        // Teleport entity to target location
        const isWall = entity.getProperty("cit:is_wall");
        if (isWall) {
          const typeFamilyComponent = entity.getComponent(mc.EntityComponentTypes.TypeFamily);
          if (
            !(typeFamilyComponent === null || typeFamilyComponent === void 0
              ? void 0
              : typeFamilyComponent.hasTypeFamily("is_wall"))
          ) {
            // Not a wall item, fallback to normal teleport
            entity.teleport(targetLocation, { dimension });
            continue;
          }
          // Wall-mounted items use specific rotation
          const wallFace = entity.getProperty("cit:wall_face");
          entity.teleport(targetLocation, {
            dimension,
            rotation: { x: 0, y: wallFace },
          });
        } else {
          // Floor/ceiling items maintain their current rotation
          entity.teleport(targetLocation, { dimension });
        }
      } catch (error) {
        // Silently handle errors
      }
    }
  }
}, 1);
console.warn("[CIT] custom_component.js 已加载");
export default components;
