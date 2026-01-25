import * as server from "@minecraft/server";
import { world, system } from "@minecraft/server";
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

components.set("cit:rotation", {
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

components.set("cit:multiblock", {
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

  onPlayerBreak(event, componentData) {
    multiblock.multiblock.onPlayerBreak(event, componentData);
  },
});

components.set("cit:legacy_multiblock", {
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

components.set("cit:bed_sleep", {
  onPlayerInteract(event) {
    const { block, player } = event;
    if (!player) return;

    const dimension = player.dimension;
    const location = block.location;
    const timeOfDay = world.getTimeOfDay();

    try {
      player.setSpawnPoint({
        dimension: dimension,
        x: location.x,
        y: location.y,
        z: location.z,
      });

      player.sendMessage([{ text: "\xA77" }, { translate: "tile.bed.respawnSet" }, { text: "\xA7r" }]);
    } catch (e) {}

    const isNight = timeOfDay >= 12542 && timeOfDay <= 23459;

    if (!isNight) {
      player.sendMessage([{ text: "\xA77" }, { translate: "tile.bed.noSleep" }, { text: "\xA7r" }]);
      return;
    }

    try {
      const originalPlayerRotation = player.getRotation();

      const blockPart = block.permutation.getState("cit:multiblock_index");
      const direction = block.permutation.getState("minecraft:cardinal_direction");

      let rideLocation;

      if (blockPart === 1) {
        let offset;
        switch (direction) {
          case "north":
            offset = { x: 0.5, y: 0.4, z: 1.5 };
            break;
          case "south":
            offset = { x: 0.5, y: 0.4, z: -0.5 };
            break;
          case "east":
            offset = { x: -0.5, y: 0.4, z: 0.5 };
            break;
          case "west":
            offset = { x: 1.5, y: 0.4, z: 0.5 };
            break;
          default:
            offset = { x: 0.5, y: 0.4, z: 0.5 };
        }
        rideLocation = {
          x: location.x + offset.x,
          y: location.y + offset.y,
          z: location.z + offset.z,
        };
      } else {
        rideLocation = {
          x: location.x + 0.5,
          y: location.y + 0.4,
          z: location.z + 0.5,
        };
      }

      const bedEntity = dimension.spawnEntity("cit:bed_entity", rideLocation);

      const rideable = bedEntity.getComponent("rideable");
      if (rideable) {
        rideable.addRider(player);
      }

      const rotationMapping = { north: 0, west: -90, south: 180, east: 90 };
      const rotation = rotationMapping[direction] || 0;
      bedEntity.runCommand(`tp @s ~~~ ${rotation} 0`);

      const rideable2 = bedEntity.getComponent("rideable");
      const riders = rideable2.getRiders();

      if (riders.length > 0) {
        startSleepSequence(riders[0], bedEntity, originalPlayerRotation);
      }

      function startSleepSequence(playerEntity, rideEntity, savedRotation) {
        try {
          if (typeof playerEntity.runCommandAsync === "function") {
            playerEntity
              .runCommandAsync(
                "execute at @e[type=cit:bed_entity,c=1] run camera @s set minecraft:free pos ^^0.625^-1 rot -33.75 ~"
              )
              .then(() => {
                playerEntity.runCommand(
                  "execute at @e[type=cit:bed_entity,c=1] run camera @s set minecraft:free ease 5 in_out_quad pos ^^0.625^-1.5 rot 33.75 ~"
                );
              });
          } else {
            const result1 = playerEntity.runCommand(
              "execute at @e[type=cit:bed_entity,c=1] run camera @s set minecraft:free pos ^^0.625^-1 rot -33.75 ~"
            );

            system.runTimeout(() => {
              const result2 = playerEntity.runCommand(
                "execute at @e[type=cit:bed_entity,c=1] run camera @s set minecraft:free ease 5 in_out_quad pos ^^0.625^-1.5 rot 33.75 ~"
              );
            }, 1);
          }
        } catch (e) {}

        skipNightSequence(playerEntity, rideEntity, savedRotation);
      }

      function skipNightSequence(playerEntity, rideEntity, savedRotation) {
        playerEntity.playAnimation("animation.cit.player.sleep");

        playerEntity.runCommand("inputpermission set @s camera disabled");
        playerEntity.runCommand("inputpermission set @s movement disabled");

        try {
          playerEntity.onScreenDisplay.setHudVisibility(0, [0, 1, 2, 4, 5, 6, 8, 12]);
        } catch (e) {}

        playerEntity.onScreenDisplay.setActionBar({ translate: "sleep.skipping_night" });

        try {
          playerEntity.camera.fade({
            fadeColor: { red: 0, green: 0, blue: 0 },
            fadeTime: {
              fadeInTime: 4,
              holdTime: 1,
              fadeOutTime: 2,
            },
          });
        } catch (e) {}

        system.runTimeout(() => {
          try {
            const currentTime = world.getTimeOfDay();
            const newTime = world.getAbsoluteTime() + (25000 - currentTime);
            world.setAbsoluteTime(newTime);
            world.setTimeOfDay(1000);
            playerEntity.runCommand("weather clear 18000");

            try {
              playerEntity.camera.clear();
            } catch (e) {}

            try {
              const bedLocation = block.location;
              const blockPart = block.permutation.getState("cit:multiblock_index") || 0;
              const direction = block.permutation.getState("cit:rotation") || "north";

              let wakeUpX = bedLocation.x + 0.5;
              let wakeUpY = bedLocation.y;
              let wakeUpZ = bedLocation.z + 0.5;

              switch (direction) {
                case "north":
                  wakeUpX += blockPart === 0 ? 1.5 : 1.5;
                  break;
                case "south":
                  wakeUpX += blockPart === 0 ? -0.5 : -0.5;
                  break;
                case "east":
                  wakeUpZ += blockPart === 0 ? 1.5 : 1.5;
                  break;
                case "west":
                  wakeUpZ += blockPart === 0 ? -0.5 : -0.5;
                  break;
              }

              playerEntity.teleport(
                { x: wakeUpX, y: wakeUpY, z: wakeUpZ },
                { dimension: playerEntity.dimension, rotation: savedRotation }
              );
            } catch (e) {}

            if (rideEntity && rideEntity.isValid) {
              rideEntity.runCommand("ride @s evict_riders");
            }

            playerEntity.runCommand("inputpermission set @s movement enabled");
            playerEntity.runCommand("inputpermission set @s camera enabled");

            try {
              playerEntity.onScreenDisplay.setHudVisibility(1, [0, 1, 2, 4, 5, 6, 8, 12]);
            } catch (e) {}
          } catch (e) {}
        }, 100);
      }
    } catch (e) {}
  },
});

components.set("cit:bed_bounce", {});

const MINECRAFT_PHYSICS = {
  GRAVITY: 0.08,
  DRAG: 0.02,
  TERMINAL_VELOCITY: 3.92,
  BED_BOUNCE_RATIO: 0.66,
};

const BOUNCE_CONFIG = {
  MIN_IMPACT_SPEED: 0.05,
  COOLDOWN_TICKS: 1,
  IMPULSE_FACTOR: 1.0,
  FALL_DAMAGE_PROTECTION_DURATION: 1,
  FALL_DAMAGE_PROTECTION_LEVEL: 255,
  STILL_THRESHOLD: 0.01,
  STILL_DURATION_TICKS: 10,
};

const playerLastVelocity = new Map();

const playerBounceSession = new Map();

function calculateBedBounceVelocity(impactSpeed) {
  if (impactSpeed < BOUNCE_CONFIG.MIN_IMPACT_SPEED) {
    return 0;
  }
  return impactSpeed * MINECRAFT_PHYSICS.BED_BOUNCE_RATIO;
}

system.runInterval(() => {
  try {
    const players = world.getAllPlayers();

    for (const player of players) {
      try {
        const location = player.location;
        let velocity = player.getVelocity();

        const blockBelow = player.dimension.getBlock({
          x: Math.floor(location.x),
          y: Math.floor(location.y - 0.1),
          z: Math.floor(location.z),
        });

        if (!blockBelow) continue;

        const isCustomBed = blockBelow.hasTag("cit:bed");
        const isVanillaBed = blockBelow.typeId === "minecraft:bed";
        const bedType = isCustomBed ? "自定义床" : isVanillaBed ? "原版床" : null;

        if (isCustomBed || isVanillaBed) {
          if (!player.bedBounceState) {
            player.bedBounceState = {
              lastBounceTick: -999,
              hasBounced: false,
            };
          }

          if (!playerBounceSession.has(player.id)) {
            playerBounceSession.set(player.id, {
              isActive: false,
              stillTicks: 0,
              bounceData: [],
            });
          }

          const session = playerBounceSession.get(player.id);
          const lastVelocity = playerLastVelocity.get(player.id) || { y: 0 };
          const currentTick = system.currentTick;
          const timeSinceLastBounce = currentTick - player.bedBounceState.lastBounceTick;

          const wasFalling = lastVelocity.y < -0.02;
          const isDecelerating = velocity.y > lastVelocity.y;
          const cooldownPassed = timeSinceLastBounce >= BOUNCE_CONFIG.COOLDOWN_TICKS;
          const notBouncedYet = !player.bedBounceState.hasBounced;

          const shouldBounce = wasFalling && isDecelerating && cooldownPassed && notBouncedYet;

          if (shouldBounce) {
            const impactSpeed = Math.abs(lastVelocity.y);

            if (impactSpeed >= BOUNCE_CONFIG.MIN_IMPACT_SPEED) {
              const bounceSpeed = calculateBedBounceVelocity(impactSpeed);
              const currentVerticalSpeed = velocity.y;
              const velocityChange = bounceSpeed - currentVerticalSpeed;

              if (isCustomBed && velocityChange > 0) {
                try {
                  player.clearVelocity();
                  player.applyImpulse({
                    x: velocity.x,
                    y: bounceSpeed,
                    z: velocity.z,
                  });

                  system.run(() => {
                    try {
                      const checkVelocity = player.getVelocity();
                      const delta = bounceSpeed - checkVelocity.y;
                      if (delta > 0.001) {
                        player.clearVelocity();
                        player.applyImpulse({
                          x: checkVelocity.x,
                          y: bounceSpeed,
                          z: checkVelocity.z,
                        });
                      }
                    } catch (err) {
                      const impulseMagnitude = (bounceSpeed - player.getVelocity().y) * BOUNCE_CONFIG.IMPULSE_FACTOR;
                      if (impulseMagnitude > 0) {
                        player.applyImpulse({ x: 0, y: impulseMagnitude, z: 0 });
                      }
                    }
                  });
                } catch (e) {
                  const impulseMagnitude = velocityChange * BOUNCE_CONFIG.IMPULSE_FACTOR;
                  player.applyImpulse({ x: 0, y: impulseMagnitude, z: 0 });
                }

                const pitch = 1.2 + Math.random() * 0.2;
                player.dimension.playSound("fall.cloth", location, {
                  volume: 0.5,
                  pitch,
                });

                player.runCommand(
                  `effect @s resistance ${BOUNCE_CONFIG.FALL_DAMAGE_PROTECTION_DURATION} ${BOUNCE_CONFIG.FALL_DAMAGE_PROTECTION_LEVEL} true`
                );
              }

              player.bedBounceState.hasBounced = true;
              player.bedBounceState.lastBounceTick = currentTick;

              session.isActive = true;
              session.stillTicks = 0;

              const actualBounceSpeed = isVanillaBed ? velocity.y : bounceSpeed;
              const bounceRatio = (actualBounceSpeed / impactSpeed) * 100;
              session.bounceData.push({
                impactSpeed: lastVelocity.y,
                bounceSpeed: actualBounceSpeed,
                bounceRatio: bounceRatio,
                velocityChange: velocityChange,
                timeSinceLastBounce: timeSinceLastBounce,
              });

              console.log(
                `[${bedType}] 玩家: ${player.name} | ` +
                  `冲击速度: ${lastVelocity.y.toFixed(8)} m/tick | ` +
                  `反弹速度: ${actualBounceSpeed.toFixed(8)} m/tick | ` +
                  `反弹比例: ${bounceRatio.toFixed(5)}% | ` +
                  `速度变化: ${velocityChange.toFixed(4)} m/tick | ` +
                  `重力常数: ${MINECRAFT_PHYSICS.GRAVITY} | ` +
                  `空气阻力: ${MINECRAFT_PHYSICS.DRAG} | ` +
                  `冷却间隔: ${timeSinceLastBounce} ticks`
              );
            }
          }

          if (velocity.y >= 0.05 && player.bedBounceState.hasBounced) {
            player.bedBounceState.hasBounced = false;
          }

          const isStill = Math.abs(velocity.y) < BOUNCE_CONFIG.STILL_THRESHOLD;

          if (session.isActive) {
            if (isStill) {
              session.stillTicks++;

              if (session.stillTicks >= BOUNCE_CONFIG.STILL_DURATION_TICKS) {
                console.log(
                  `[${bedType}] 玩家: ${player.name} | ` +
                    `弹跳已停止 | ` +
                    `总弹跳次数: ${session.bounceData.length} | ` +
                    `静止速度: ${velocity.y.toFixed(4)} m/tick`
                );

                session.isActive = false;
                session.stillTicks = 0;
                session.bounceData = [];
              }
            } else {
              session.stillTicks = 0;
            }
          }
        } else {
          if (player.bedBounceState) {
            player.bedBounceState = {
              lastBounceTick: -999,
              hasBounced: false,
            };
          }

          if (playerBounceSession.has(player.id)) {
            playerBounceSession.delete(player.id);
          }
        }

        const latestVelocity = player.getVelocity();
        playerLastVelocity.set(player.id, { y: latestVelocity.y });
      } catch (e) {}
    }
  } catch (e) {}
}, 1);

export default components;
