import * as mc from "@minecraft/server";
import {
  item3dList,
  blockItem3dNameMap,
  getSpawnLocation,
  calculateTargetLocation,
  restoreItemStack,
  cacheItemStack,
} from "./custom_function";
import {
  getVariantByName,
  shouldDisableGravity,
  getHitboxSize,
  getHitboxEvent,
  getEntityId,
  getNextVariantEntity,
  getVariantCount,
  getSpawnVariant,
} from "./item_config";
const components = new Map();
// 记录正在执行 bounce 衰减的实体 ID，防止重复开启衰减链
const bouncingEntities = new Set();
const transitionVariantEntities = new Set([
  "cit:brick_0",
  "cit:brick_0_01",
  "cit:nether_brick_0",
  "cit:nether_brick_0_01",
]);
// switch_out 动画时长 0.2s × 20 = 4 ticks
const transitionSwitchOutTicks = 4;
const transitionSpawnGuardTicks = 2;
/** 触发弹跳动画并开始衰减 */
function startBounce(entity) {
  try {
    const current = entity.getProperty("cit:bounce") || 0;
    entity.setProperty("cit:bounce", Math.min(current + 0.5, 1.0));
    if (!bouncingEntities.has(entity.id)) {
      bouncingEntities.add(entity.id);
      decayBounce(entity);
    }
  } catch (e) {}
}
/** 每 tick 衰减 cit:bounce，直到归零 */
function decayBounce(entity) {
  mc.system.runTimeout(() => {
    if (!entity.isValid) {
      bouncingEntities.delete(entity.id);
      return;
    }
    let val;
    try {
      val = entity.getProperty("cit:bounce");
    } catch {
      bouncingEntities.delete(entity.id);
      return;
    }
    const next = Math.max(0, val - 0.05);
    try {
      entity.setProperty("cit:bounce", next);
    } catch {}
    if (next <= 0) {
      bouncingEntities.delete(entity.id);
    } else {
      decayBounce(entity);
    }
  }, 1);
}
function usesVariantTransition(currentTypeId, nextTypeId) {
  return transitionVariantEntities.has(currentTypeId) && transitionVariantEntities.has(nextTypeId);
}
function switchVariantWithTransition(hitEntity, nextTypeId, ownerName) {
  const loc = hitEntity.location;
  const rot = hitEntity.getRotation();
  const dim = hitEntity.dimension;
  const isWallType = hitEntity.typeId.endsWith("_wall");
  const isWall = isWallType ? hitEntity.getProperty("cit:is_wall") : undefined;
  const wallFace = isWallType ? hitEntity.getProperty("cit:wall_face") : undefined;
  const wallRotation = isWallType ? hitEntity.getProperty("cit:wall_rotation") : undefined;
  const itemData = hitEntity.getDynamicProperty("cit:item_data");
  const customName = hitEntity.getDynamicProperty("cit:custom_name");
  const nextOwnerName = ownerName ?? hitEntity.getDynamicProperty("cit:owner");
  try {
    hitEntity.addTag("cit:switching");
  } catch {}
  try {
    hitEntity.setProperty("cit:transition_state", 2);
  } catch {}
  mc.system.runTimeout(() => {
    if (!hitEntity.isValid) {
      return;
    }
    try {
      const newEntity = dim.spawnEntity(nextTypeId, loc, {
        initialRotation: rot.y,
        spawnEvent: "cit:on_spawn",
      });
      newEntity.addTag("cit");
      newEntity.addTag("cit:switching");
      if (isWallType) {
        newEntity.setProperty("cit:is_wall", isWall);
        newEntity.setProperty("cit:wall_face", wallFace);
        newEntity.setProperty("cit:wall_rotation", wallRotation);
      }
      if (itemData) newEntity.setDynamicProperty("cit:item_data", itemData);
      if (customName) newEntity.setDynamicProperty("cit:custom_name", customName);
      if (nextOwnerName) newEntity.setDynamicProperty("cit:owner", nextOwnerName);
      try {
        newEntity.setProperty("cit:transition_state", 0);
      } catch {}
      hitEntity.remove();
      mc.system.runTimeout(() => {
        if (!newEntity.isValid) {
          return;
        }
        try {
          newEntity.removeTag("cit:switching");
        } catch {}
      }, transitionSpawnGuardTicks);
    } catch (e) {
      try {
        hitEntity.setProperty("cit:transition_state", 0);
      } catch {}
      try {
        hitEntity.removeTag("cit:switching");
      } catch {}
      console.error("[CIT] 切换变体失败: " + e);
    }
  }, transitionSwitchOutTicks);
}
function getStackedFloorEntities(baseEntity) {
  const baseLocation = baseEntity.location;
  return baseEntity.dimension
    .getEntities({
      tags: ["cit"],
      location: baseLocation,
      maxDistance: 2,
    })
    .filter((entity) => entity.isValid && entity.id !== baseEntity.id)
    .filter((entity) => !entity.hasTag("cit:magnet") && !entity.typeId.endsWith("_wall"))
    .filter((entity) => {
      const location = entity.location;
      return (
        Math.abs(location.x - baseLocation.x) <= 0.2 &&
        Math.abs(location.z - baseLocation.z) <= 0.2 &&
        location.y >= baseLocation.y &&
        location.y - baseLocation.y <= 2
      );
    })
    .sort((a, b) => a.location.y - b.location.y);
}
function hopFloorStack(baseEntity, rotationYDelta = 0) {
  const stackEntities = [baseEntity, ...getStackedFloorEntities(baseEntity)];
  for (let index = 0; index < stackEntities.length; index++) {
    const entity = stackEntities[index];
    if (!entity.isValid) {
      continue;
    }
    try {
      const location = entity.location;
      const rotation = entity.getRotation();
      entity.teleport(
        {
          x: location.x,
          y: location.y + (index === 0 ? 0.1 : 0.08),
          z: location.z,
        },
        {
          dimension: entity.dimension,
          rotation: {
            x: rotation.x,
            y: rotation.y + (index === 0 ? rotationYDelta : 0),
          },
        }
      );
    } catch (e) {}
  }
}
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
    let isCeil = false;
    // Items with "_top" suffix are always ground/ceiling items, never wall-mounted
    const isTopItem = itemName && itemName.toLowerCase().includes("_top");
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
    if (face === mc.Direction.Down) {
      isCeil = true;
    }
    try {
      mc.system.run(() => {
        // Get entity ID (supports entity override for wall items)
        const entityId = getEntityId(itemStack.typeId, itemName, wallProperties.is_wall, isCeil);
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
          // 直接命名生成指定变体（如 Bowl_4a → cit:bowl_4 + cit:variant=1）
          const sv = getSpawnVariant(itemStack.typeId, itemName, wallProperties.is_wall);
          if (sv !== null) spawnedEntity.setProperty("cit:variant", sv);
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
          typeId: itemStack.typeId,
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
    if (damagingEntity.typeId !== "minecraft:player") {
      return;
    }
    if (!hitEntity.isValid || !hitEntity.hasTag("cit")) {
      return;
    }
    if (hitEntity.hasTag("cit:magnet")) {
      return;
    }
    if (hitEntity.hasTag("cit:switching")) {
      return;
    }
    // 实体被持有中：仅响应持有者操作
    const heldOwner = hitEntity.getDynamicProperty("cit:owner");
    if (heldOwner) {
      if (heldOwner !== damagingEntity.name) return;
      if (damagingEntity.isSneaking) {
        // 下蹲+左键：直接归还背包
        const itemStack = restoreItemStack(hitEntity);
        const player = damagingEntity;
        mc.system.run(() => {
          if (!hitEntity.isValid) {
            player.removeTag("cit");
            return;
          }
          try {
            const inventory = player.getComponent(mc.EntityComponentTypes.Inventory);
            const leftover = inventory?.container?.addItem(itemStack);
            if (leftover) player.dimension.spawnItem(leftover, player.location);
            else player.playSound("random.pop", { pitch: 2.0, volume: 0.5 });
          } catch (e) {
            player.dimension.spawnItem(itemStack, player.location);
          }
          hitEntity.remove();
          player.removeTag("cit");
        });
        return;
      }
      // 左键：切换变体
      const variantCount = getVariantCount(hitEntity.typeId);
      if (variantCount > 1) {
        // 属性切换（渲染控制器方案）：直接修改 cit:variant，无需重生成实体
        const cur = hitEntity.getProperty("cit:variant") ?? 0;
        hitEntity.setProperty("cit:variant", (cur + 1) % variantCount);
      } else {
        const nextTypeId = getNextVariantEntity(hitEntity.typeId);
        if (nextTypeId) {
          if (usesVariantTransition(hitEntity.typeId, nextTypeId)) {
            switchVariantWithTransition(hitEntity, nextTypeId, heldOwner);
          } else {
            const loc = hitEntity.location;
            const rot = hitEntity.getRotation();
            const dim = hitEntity.dimension;
            const isWallType = hitEntity.typeId.endsWith("_wall");
            const isWall = isWallType ? hitEntity.getProperty("cit:is_wall") : undefined;
            const wallFace = isWallType ? hitEntity.getProperty("cit:wall_face") : undefined;
            const wallRotation = isWallType ? hitEntity.getProperty("cit:wall_rotation") : undefined;
            const itemData = hitEntity.getDynamicProperty("cit:item_data");
            const customName = hitEntity.getDynamicProperty("cit:custom_name");
            const ownerName = heldOwner;
            hitEntity.remove();
            mc.system.run(() => {
              try {
                const newEntity = dim.spawnEntity(nextTypeId, loc, {
                  initialRotation: rot.y,
                  spawnEvent: "cit:on_spawn",
                });
                newEntity.addTag("cit");
                if (isWallType) {
                  newEntity.setProperty("cit:is_wall", isWall);
                  newEntity.setProperty("cit:wall_face", wallFace);
                  newEntity.setProperty("cit:wall_rotation", wallRotation);
                }
                if (itemData) newEntity.setDynamicProperty("cit:item_data", itemData);
                if (customName) newEntity.setDynamicProperty("cit:custom_name", customName);
                newEntity.setDynamicProperty("cit:owner", ownerName);
              } catch (e) {
                console.error("[CIT] 持有中切换变体失败: " + e);
              }
            });
          }
        }
      }
      return;
    }
    // 下蹲左键：收回物品（已放置实体）
    if (damagingEntity.isSneaking) {
      hitEntity.addTag("cit:magnet");
      hitEntity.setDynamicProperty("cit:absorber", damagingEntity.name);
      hitEntity.setDynamicProperty("cit:absorb_time", 0);
      hitEntity.applyImpulse({ x: 0, y: 0.3, z: 0 });
      hitEntity.setDynamicProperty("cit:owner", undefined);
      damagingEntity.removeTag("cit");
      return;
    }
    // 直接左键：弹跳，有变体则同时切换
    const isWallType = hitEntity.typeId.endsWith("_wall");

    // egg_4：铲子左键播动画，空手/其他左键切换变体模型
    if (hitEntity.typeId === "cit:egg_4") {
      const inv = damagingEntity.getComponent("inventory");
      const heldItem = inv?.container?.getItem(damagingEntity.selectedSlotIndex);
      const isShovel = heldItem?.getTags?.()?.includes("minecraft:is_shovel");

      if (isShovel) {
        if (hitEntity.getProperty("cit:transition_state") !== 2) {
          hitEntity.setProperty("cit:transition_state", 2);
          mc.system.runTimeout(() => {
            if (hitEntity.isValid) {
              hitEntity.setProperty("cit:transition_state", 1);
            }
          }, 49);
        }
        if (!isWallType) {
          mc.system.run(() => {
            if (!hitEntity.isValid) return;
            hopFloorStack(hitEntity);
          });
        }
        return;
      }
      // 非铲子：不 return，走下面的 variantCount 切换逻辑
    }

    const variantCount2 = getVariantCount(hitEntity.typeId);
    if (variantCount2 > 1) {
      // 属性切换（渲染控制器方案）：setProperty + 弹跳动画，无需重生成实体
      const cur = hitEntity.getProperty("cit:variant") ?? 0;
      hitEntity.setProperty("cit:variant", (cur + 1) % variantCount2);
      startBounce(hitEntity);
    } else {
      const nextTypeId = getNextVariantEntity(hitEntity.typeId);
      if (nextTypeId) {
        if (usesVariantTransition(hitEntity.typeId, nextTypeId)) {
          switchVariantWithTransition(hitEntity, nextTypeId);
        } else {
          const loc = hitEntity.location;
          const rot = hitEntity.getRotation();
          const dim = hitEntity.dimension;
          const isWall = isWallType ? hitEntity.getProperty("cit:is_wall") : undefined;
          const wallFace = isWallType ? hitEntity.getProperty("cit:wall_face") : undefined;
          const wallRotation = isWallType ? hitEntity.getProperty("cit:wall_rotation") : undefined;
          const itemData = hitEntity.getDynamicProperty("cit:item_data");
          const customName = hitEntity.getDynamicProperty("cit:custom_name");
          hitEntity.remove();
          mc.system.run(() => {
            try {
              const newEntity = dim.spawnEntity(nextTypeId, loc, {
                initialRotation: rot.y,
                spawnEvent: "cit:on_spawn",
              });
              newEntity.addTag("cit");
              if (isWallType) {
                newEntity.setProperty("cit:is_wall", isWall);
                newEntity.setProperty("cit:wall_face", wallFace);
                newEntity.setProperty("cit:wall_rotation", wallRotation);
              }
              if (itemData) newEntity.setDynamicProperty("cit:item_data", itemData);
              if (customName) newEntity.setDynamicProperty("cit:custom_name", customName);
              mc.system.run(() => {
                if (!newEntity.isValid) return;
                startBounce(newEntity);
              });
            } catch (e) {
              console.error("[CIT] 切换变体失败: " + e);
            }
          });
        }
      } else {
        // 无变体：仅弹跳
        const isTopType = hitEntity.typeId.endsWith("_top");
        if (isWallType || isTopType) {
          startBounce(hitEntity);
        } else {
          mc.system.run(() => {
            if (!hitEntity.isValid) return;
            hopFloorStack(hitEntity);
          });
        }
      }
    }
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
      // 用 typeId 判断是否为 wall 实体，避免在无该属性的 floor 实体上崩溃
      const isWallEntity = target.typeId.endsWith("_wall");
      const isTopEntity = target.typeId.endsWith("_top");
      // _wall / _top 实体走纯动画旋转（cit:wall_rotation），floor 实体走 teleport 旋转+跳动
      const rotationMode = (isWallEntity || isTopEntity) ? "wall_10" : "floor";
      mc.system.run(() => {
        if (!target.isValid) return;
        if (rotationMode === "wall_10") {
          // _wall 实体：沿墙面旋转 10°，通过 cit:wall_rotation 属性驱动动画
          const currentRotation = target.getProperty("cit:wall_rotation");
          target.setProperty("cit:wall_rotation", (currentRotation + 10) % 360);
        } else {
          // floor 实体：teleport 旋转 + 小跳跃（无 wall 属性访问）
          hopFloorStack(target, 10);
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
        // If close enough, collect（0.4秒内贴近玩家直接回收防抽搐）
        if ((ticks <= 8 && distSq < 1.0) || (ticks > 5 && (distSq < 0.25 || (distSq < 2.25 && ticks > 10)))) {
          try {
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
          } catch (e) {
            // 恢复失败，仍移除实体防止无限抽搐
          }
          entity.remove();
          continue;
        }
        // Apply attraction force
        const speed = 0.6 + ticks * ticks * 0.005;
        const dist = Math.sqrt(distSq) || 0.001;
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
        // Handle entity override: apple_wall -> apple, bowl_4_wall -> bowl
        itemTypeId = itemTypeId.replace("_wall", "").replace("_top", "");
        itemTypeId = itemTypeId.replace(/_\d+[a-zA-Z]*$/, "");
        const itemName = entity.getDynamicProperty("cit:custom_name");
        const { targetLocation, properties } = calculateTargetLocation(
          player,
          viewBlock,
          itemTypeId,
          itemName !== null && itemName !== void 0 ? itemName : null
        );
        // 仅 _wall 实体拥有 wall 属性，floor 实体不读写，避免崩溃
        const isWallEntity = entity.typeId.endsWith("_wall");
        if (properties !== null) {
          if (isWallEntity) {
            for (const [key, value] of Object.entries(properties)) {
              entity.setProperty(key, value);
            }
          }
        } else if (isWallEntity) {
          // In air: reset wall state
          entity.setProperty("cit:is_wall", false);
          entity.setProperty("cit:wall_rotation", 0);
        }
        // Teleport entity to target location
        if (isWallEntity) {
          const isWall = entity.getProperty("cit:is_wall");
          if (isWall) {
            // Wall-mounted items use specific rotation
            const wallFace = entity.getProperty("cit:wall_face");
            entity.teleport(targetLocation, {
              dimension,
              rotation: { x: 0, y: wallFace },
            });
          } else {
            entity.teleport(targetLocation, { dimension });
          }
        } else {
          // Floor/ceiling items: simple teleport, no wall logic
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
