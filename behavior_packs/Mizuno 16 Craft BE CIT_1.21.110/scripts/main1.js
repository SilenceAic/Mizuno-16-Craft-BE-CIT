import * as server from "@minecraft/server";
/*
 * 方块组件
 */
import blockComponents from "./cit/custom_component";
/*
 * < 世界 > 初始化前 事件
 */
server.system.beforeEvents.startup.subscribe((data) => {
  /**
   * 方块自定义组件实例数组
   */
  const blockCustoms = [...blockComponents.values()];
  /**
   * 方块自定义组件名称数组
   */
  const blockNames = [...blockComponents.keys()];
  // === 方块自定义组件注册 ===
  for (let blockIndex = 0; blockIndex < blockCustoms.length; blockIndex++)
    data.blockComponentRegistry.registerCustomComponent(blockNames[blockIndex], blockCustoms[blockIndex]);
});
