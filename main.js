/**
 * 3D Item Display System
 * @minecraft/server v2.6.0
 *
 * This script allows players to place items as 3D entities in the world
 * and manipulate their position and rotation.
 *
 * Refactored to use component-based architecture.
 */
import * as mc from "@minecraft/server";
import components from "./item3d/custom_component";
console.log("3D Item Display System");
/**
 * Dispatcher for events to registered components
 * @param handlerName Name of the handler method to call on components
 * @param event The event object to pass
 */
function dispatch(handlerName, event) {
    for (const [key, component] of components) {
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
// Register event listeners
mc.world.beforeEvents.itemUse.subscribe((event) => {
    dispatch("onItemUse", event);
});
mc.world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    dispatch("onPlayerInteractWithBlock", event);
});
mc.world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    dispatch("onPlayerInteractWithEntity", event);
});
mc.world.afterEvents.entityHitEntity.subscribe((event) => {
    dispatch("onEntityHitEntity", event);
});
//# sourceMappingURL=main.js.map