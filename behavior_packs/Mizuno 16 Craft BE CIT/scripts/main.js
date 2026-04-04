// scripts/main.ts
import * as server from "@minecraft/server";
import blockComponents from "./cit/custom_component";
import item3dComponents from "./item3d/custom_component";

// 注册方块自定义组件
server.system.beforeEvents.startup.subscribe((data) => {
  const blockCustoms = [...blockComponents.values()];
  const blockNames = [...blockComponents.keys()];
  for (let blockIndex = 0; blockIndex < blockCustoms.length; blockIndex++)
    data.blockComponentRegistry.registerCustomComponent(blockNames[blockIndex], blockCustoms[blockIndex]);
});

// Item3D 实体系统事件分发
function dispatch(handlerName, event) {
  for (const [key, component] of item3dComponents) {
    const handler = component[handlerName];
    if (typeof handler === "function") {
      try {
        handler(event);
      } catch (error) {
        console.warn(`Error in component ${key}.${handlerName}: ${error}`);
      }
    }
  }
}

server.world.beforeEvents.itemUse.subscribe((event) => {
  dispatch("onItemUse", event);
});
server.world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  dispatch("onPlayerInteractWithBlock", event);
});
server.world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  dispatch("onPlayerInteractWithEntity", event);
});
server.world.afterEvents.entityHitEntity.subscribe((event) => {
  dispatch("onEntityHitEntity", event);
});
console.warn("[Item3D] main.js 已加载");

//# sourceMappingURL=../debug/main.js.map
