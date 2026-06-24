import * as server from "@minecraft/server";
import blockComponents from "./cit/custom_component";
import item3dComponents from "./item3d/custom_component";
// === 玩家身份标识实验 ===
// 玩家首次生成时，在聊天栏和控制台输出身份信息
server.world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;
    server.system.run(() => {
        console.warn(`[Identity] playerSpawn → id: "${player.id}", name: "${player.name}", typeId: "${player.typeId}"`);
        // 仅首次生成时发送聊天消息，避免死亡复活时刷屏
        if (event.initialSpawn) {
            player.sendMessage(`§a你的 id: §e${player.id}`);
            player.sendMessage(`§a你的 name: §e${player.name}`);
            player.sendMessage(`§a你的 typeId: §e${player.typeId}`);
        }
    });
});
// 玩家加入世界时控制台打印（playerSpawn 在每次重生都触发，playerJoin 只触发一次）
// 注：PlayerJoinAfterEvent 只暴露 playerId 和 playerName，不含 Player 对象
server.world.afterEvents.playerJoin.subscribe((event) => {
    console.warn(`[Identity] playerJoin  → id: "${event.playerId}", name: "${event.playerName}"`);
});
// === 实验代码结束 ===
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
            }
            catch (error) {
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
//# sourceMappingURL=main.js.map