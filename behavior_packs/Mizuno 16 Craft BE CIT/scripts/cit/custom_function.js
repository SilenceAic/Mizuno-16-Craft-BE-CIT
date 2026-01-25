import * as server from "@minecraft/server";
import * as create from "../system/create";
import * as multiblock from "../system/multiblock";


export function getPreciseRotation(playerYRotation) {
  if (playerYRotation < 0) playerYRotation += 360;
  const rotation = Math.round(playerYRotation / 22.5);
  return rotation !== 16 ? rotation : 0;
}

export function getMaxStates(block) {
  if (block.hasTag("cit:six_states")) return 6;
  if (block.hasTag("cit:five_states")) return 5;
  if (block.hasTag("cit:four_states")) return 4;
  if (block.hasTag("cit:three_states")) return 3;
  return 2;
}


export function getNextState(currentState, maxStates) {
  return (currentState + 1) % maxStates;
}


export function getMaxSwitch(block) {
  if (block.hasTag("cit:three_switch")) return 3;
  if (block.hasTag("cit:two_switch")) return 2;
  return 2;
}


export function getNextSwitch(currentSwitch, maxSwitch) {
  return (currentSwitch + 1) % maxSwitch;
}


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


export function getMultiblockSize(baseBlock) {
  if (baseBlock.hasTag("cit:two_height")) {
    return [1, 2, 1];
  }
  return [1, 2, 1];
}


export function findMultiblockBase(block) {
  const permutation = block.permutation;
  const currentIndex = permutation.getState("cit:multiblock_index");
  if (currentIndex === 0) return block;

  const size = getMultiblockSize(block);
  if (!size) return null;

  const direction = toDirection(permutation.getState("minecraft:cardinal_direction"));

  
  const baseBlock = multiblock.multiblock.getBaseBlock(
    block,
    permutation,
    { size, index: "cit:multiblock_index" },
    direction
  );

  
  if (baseBlock && baseBlock.permutation.getState("cit:multiblock_index") === 0) {
    return baseBlock;
  }

  return null;
}


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

  
  const blockType = block.typeId;
  const blocksCount = allBlocks.length;

  for (let i = 0; i < blocksCount; i++) {
    const targetBlock = allBlocks[i];
    if (targetBlock?.typeId === blockType) {
      create.TrySetPermutation(targetBlock, "cit:dynamic_state", newState);
    }
  }
}
