
import * as server from "@minecraft/server";

import { Vector } from './maths';

export { CreateItemFromStackData, DisplaceItemStack, SetDurability, AlterDurability, DeleteItemStack, ConsumeItemStack, CheckItemHasAmount, OrganizeItemStacks, CheckItemStack, SearchContainers };

function CreateItemFromStackData(data) {
    
    const item = new server.ItemStack(data.type, data.amount);
    
    if (data.name)
        item.nameTag = data.name;
    
    if (data.lore)
        item.setLore(data.lore);
    
    if (data.property)
        [...data.property].forEach(intel => item.setDynamicProperty(...intel));
    
    return item;
}
;

function DisplaceItemStack(container, proto, fresh, omitAmount) {
    
    const output = [];
    
    for (let index = 0; index < container.size; index++) {
        
        const item = container.getItem(index);
        
        if (!item || item.typeId != proto.typeId)
            continue;
        if (!omitAmount && proto.amount != item.amount)
            continue;
        if (proto.getLore.toString() != item.getLore.toString())
            continue;
        
        container.setItem(index, fresh);
        
        output.push(item);
    }
    ;
    
    return output;
}
;

function SetDurability(source, item, container, slot, value) {
    
    const newItem = AlterDurability(item, value);
    
    if (newItem === undefined)
        source.playSound('random.anvil_break');
    
    container.setItem(slot, newItem);
}
;

function AlterDurability(item, value) {
    
    const getDurability = item.getComponent('minecraft:durability');
    
    if (!getDurability)
        return item;
    
    if (getDurability.damage <= getDurability.maxDurability - value) {
        getDurability.damage += value;
        return item;
    }
    else
        return undefined;
}
;

function DeleteItemStack(container, sample) {
    
    for (let index = 0; index < container.size; index++) {
        
        const item = container.getItem(index);
        
        if (!item || item.typeId !== sample.typeId || item.amount < sample.amount)
            continue;
        
        ConsumeItemStack(container, index, item, sample.amount);
        
        return true;
    }
    ;
    
    return false;
}
;

function ConsumeItemStack(container, slot, item, amount = 1) {
    if (item.amount > amount) {
        
        item.amount -= amount;
        
        container.setItem(slot, item);
    }
    else
        container.setItem(slot);
}
;

function CheckItemHasAmount(source, samples) {
    
    const samplesInfo = new Map(samples.map(item => [item.typeId, item.amount]));
    
    const sourceInfo = new Map(source.map(item => [item.typeId, item.amount]));
    
    return [...samplesInfo].every(item => sourceInfo.has(item[0]) && (sourceInfo.get(item[0]) ?? 0 >= item[1]));
}
;

function OrganizeItemStacks(items) {
    
    const groupedItems = new Map();
    
    items.forEach(item => {
        
        const typeId = item.typeId;
        
        if (!groupedItems.has(typeId))
            groupedItems.set(typeId, [item]);
        
        else
            groupedItems.get(typeId)?.push(item);
    });
    
    const sortedItems = [...groupedItems]
        
        .sort((a, b) => a[0].split(':')[0].length - b[0].split(':')[0].length)
        
        .sort((a, b) => a[0].split(':')[0].localeCompare(b[0].split(':')[0]))
        
        .map(x => x[1].sort((a, b) => a.amount - b.amount))
        
        .flatMap(x => x);
    
    return sortedItems;
}
;

function CheckItemStack(container, samples) {
    
    const types = new Map();
    
    for (const sample of samples) {
        
        const existingAmount = types.get(sample.typeId) || 0;
        
        types.set(sample.typeId, existingAmount + sample.amount);
    }
    ;
    
    const items = new Map();
    
    for (let index = 0; index < container.size; index++) {
        
        const item = container.getItem(index);
        
        if (!item)
            continue;
        
        const currentAmount = items.get(item.typeId) || 0;
        
        items.set(item.typeId, currentAmount + item.amount);
    }
    ;
    
    return [...types].every(([typeId, requiredAmount]) => (items.get(typeId) || 0) >= requiredAmount);
}
;

function SearchContainers(anchor, input, scope = 5) {
    
    const containers = [];
    
    for (const vector of Vector.createCubeLattice(scope)) {
        
        const block = anchor.offset(vector);
        
        const container = block?.getComponent('inventory')?.container;
        
        if (input !== undefined) {
            
            const samples = new server.ItemStack(input.typeId);
            
            if (!container || !CheckItemStack(container, [samples]) || container.emptySlotsCount <= 1)
                continue;
        }
        else if (!container || container.emptySlotsCount <= 1)
            continue;
        
        containers.push([container, block]);
    }
    return containers;
}
;
