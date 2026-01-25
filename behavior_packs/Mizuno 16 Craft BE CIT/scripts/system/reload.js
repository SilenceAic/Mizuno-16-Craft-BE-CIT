
import * as server from "@minecraft/server";

import * as table from "../data/table";

import { Vector } from './maths';

import { TrySpawnItem, TrySpawnEntity } from './create';

export { UnloadInventoryAndPackageInPlace, UnloadInventoryAndDestroy, UnloadInventoryAndPackage, SummonEntityWithData };

function UnloadInventoryAndPackage(target, player, material, itemName, itemLore) {
    
    if (target instanceof server.Player)
        return;
    
    const container = target.getComponent('inventory')?.container;
    
    const items = [];
    
    const types = target.getDynamicPropertyIds();
    
    const tags = target.getTags();
    
    const anchor = Vector.copy(target.location);
    
    const nameTag = target.nameTag.length >= 1 ? target.nameTag : table.name_mapping.get(target.typeId);
    
    types.sort((a, b) => a[0].toLowerCase().charCodeAt(0) - b[0].toLowerCase().charCodeAt(0));
    
    if (container)
        for (let index = 0; index < container.size; index++) {
            
            const item = container.getItem(index);
            if (!item)
                continue;
            items.push(item);
            container.setItem(index);
        }
    ;
    
    types.forEach(type => material.setDynamicProperty(type, target.getDynamicProperty(type)));
    material.setDynamicProperty('reduction_pureness:tags', JSON.stringify(tags));
    material.setDynamicProperty('reduction_pureness:name', target.nameTag);
    material.setDynamicProperty('reduction_pureness:type', target.typeId);
    
    material.nameTag = itemName + nameTag + '§r';
    
    material.setLore(itemLore);
    
    server.system.runTimeout(() => { TrySpawnItem(player.dimension, material, player.getHeadLocation()); }, 10);
    
    server.system.runTimeout(() => { items.forEach(item => TrySpawnItem(player.dimension, item, anchor)); }, 10);
    
    target.remove();
}
;

function UnloadInventoryAndPackageInPlace(target, material, itemName, itemLore) {
    
    if (target instanceof server.Player)
        return;
    
    const container = target.getComponent('inventory')?.container;
    
    const items = [];
    
    const types = target.getDynamicPropertyIds();
    
    const tags = target.getTags();
    
    const copyLocation = Vector.copy(target.location);
    
    const copyDimension = target.dimension;
    
    const nameTag = target.nameTag.length >= 1 ? target.nameTag : table.name_mapping.get(target.typeId);
    
    types.sort((a, b) => a[0].toLowerCase().charCodeAt(0) - b[0].toLowerCase().charCodeAt(0));
    
    if (container)
        for (let index = 0; index < container.size; index++) {
            
            const item = container.getItem(index);
            if (!item)
                continue;
            items.push(item);
            container.setItem(index);
        }
    ;
    
    types.forEach(type => material.setDynamicProperty(type, target.getDynamicProperty(type)));
    material.setDynamicProperty('reduction_pureness:tags', JSON.stringify(tags));
    material.setDynamicProperty('reduction_pureness:name', target.nameTag);
    material.setDynamicProperty('reduction_pureness:type', target.typeId);
    
    material.nameTag = itemName + nameTag + '§r';
    
    material.setLore(itemLore);
    
    server.system.runTimeout(() => { items.forEach(item => TrySpawnItem(copyDimension, item, copyLocation)); }, 10);
    
    server.system.runTimeout(() => { TrySpawnItem(copyDimension, material, copyLocation); }, 10);
    
    target.remove();
}
;

async function UnloadInventoryAndDestroy(target) {
    
    await server.system.waitTicks(0);
    
    const container = target.getComponent('inventory')?.container;
    
    const items = [];
    
    const location = Vector.copy(target.location);
    
    const dimension = server.world.getDimension(target.dimension.id);
    
    if (container)
        for (let index = 0; index < container.size; index++) {
            
            const item = container.getItem(index);
            if (!item)
                continue;
            items.push(item);
            container.setItem(index);
        }
    ;
    
    server.system.runTimeout(() => { items.forEach(item => TrySpawnItem(dimension, item, location)); }, 10);
    
    target.remove();
}
;

function SummonEntityWithData(player, container, type) {
    
    const item = container?.getItem(player.selectedSlotIndex);
    
    const block = player.getBlockFromViewDirection({ maxDistance: 16 })?.block;
    
    const propertyID = item?.getDynamicPropertyIds().filter(type => !type.startsWith('reduction_pureness:'));
    
    const nameTag = item?.getDynamicProperty('reduction_pureness:name');
    
    const tags = item?.getDynamicProperty('reduction_pureness:tags');
    
    const entity = TrySpawnEntity(player.dimension, type, block?.center() ?? player.location);
    
    if (entity instanceof Error)
        return player.sendMessage(`§l§4<§c 召唤失败 §4>§r: ${entity.message}`);
    
    player.playSound('conduit.deactivate');
    
    server.system.run(() => entity.getComponent('tameable')?.tame(player));
    
    server.system.run(() => container.setItem(player.selectedSlotIndex));
    
    if (!item || !propertyID)
        return;
    
    server.system.runTimeout(() => propertyID.forEach(id => entity.setDynamicProperty(id, item.getDynamicProperty(id))), 20);
    
    if (!nameTag)
        return;
    
    server.system.runTimeout(() => entity.nameTag = nameTag, 15);
    
    if (!tags)
        return;
    
    JSON.parse(tags).forEach(tag => entity.addTag(tag));
}
;
