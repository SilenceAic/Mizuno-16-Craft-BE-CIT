import * as server from "@minecraft/server";
import blockComponents from "./cit/custom_component";
server.system.beforeEvents.startup.subscribe((data) => {
    const blockCustoms = [...blockComponents.values()];
    const blockNames = [...blockComponents.keys()];
    for (let blockIndex = 0; blockIndex < blockCustoms.length; blockIndex++)
        data.blockComponentRegistry.registerCustomComponent(blockNames[blockIndex], blockCustoms[blockIndex]);
});
//# sourceMappingURL=main.js.map