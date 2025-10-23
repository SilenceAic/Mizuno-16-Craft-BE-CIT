
import * as server from "@minecraft/server";
import * as debug from "@minecraft/debug-utilities";

import { can_display_logs, message_notify, rune_color } from "../data/table";

import { translate } from './translate';

import { TrySpawnParticle } from './create';

import { TriggerControl } from './control';

import { Vector, RandomFloor, Clamp } from './maths';

export { GetTargetIntel, DistanceAndName, ThrowErrorIfPermitted, IntelMessage, DisplayFloatingText, AlterMessageNotify, ErrorMessage, NumberParticleDisplay };

function DistanceAndName(entity, distance) {
    return {
        rawtext: [
            { text: '§l' }, translate(entity), { text: `\n§9距离: §5${distance}` }
        ]
    };
}
;

function ThrowErrorIfPermitted(message, cause) {
    
    if (!can_display_logs)
        return;
    
    throw new Error(message, { cause: cause });
}
;

function IntelMessage(object, range, text) {
    
    const setOptions = {
        location: object.location,
        maxDistance: range
    };
    
    const getPlayers = object.dimension.getPlayers(setOptions);
    
    getPlayers.forEach(info => info.onScreenDisplay.setActionBar(text));
}
;

const textCaseMap = new Map();

function DisplayFloatingText(block, text) {
    
    
    const identifier = block.dimension.id + Vector.copy(block).toString();
    
    const oldTextCase = textCaseMap.get(identifier);
    
    if (oldTextCase)
        debug.debugDrawer.removeShape(oldTextCase);
    
    const textCase = new debug.DebugText(block.above(2)?.bottomCenter() || block.center(), text || '未知');
    
    textCase.timeLeft = Clamp({ min: 100, max: 2000 }, text.length * 20);
    
    debug.debugDrawer.addShape(textCase);
    
    textCaseMap.set(identifier, textCase);
}
;

function AlterMessageNotify(title, block, message) {
    
    const rawMessage = {
        rawtext: [
            { text: '| §l§p' + block.dimension.id + '§r | §a' + Vector.toString(block.location) + '§r |\n\n' },
            message
        ]
    };
    
    message_notify.set(title, rawMessage);
    
    if (!message.rawtext)
        DisplayFloatingText(block, message.text ?? '未知');
}
;

function ErrorMessage(title, block, message) {
    
    const type = 'error -> ' + block.typeId;
    
    const token = TriggerControl(type, block, 40);
    if (!token)
        return;
    
    const molang = new server.MolangVariableMap();
    
    molang.setFloat('variable.direction', RandomFloor(0, 2));
    molang.setFloat('variable.size', 3);
    
    TrySpawnParticle(block.dimension, 'scripts:path_star4_large', block.center(), molang);
    
    AlterMessageNotify(title, block, message);
}
;

function NumberParticleDisplay(anchor, numberToDisplay, offset) {
    
    if (numberToDisplay > 99999)
        return;
    
    const molang = new server.MolangVariableMap();
    
    const particleColors = [...rune_color.values()];
    
    const numberDigits = Math.floor(numberToDisplay).toString().split('').reverse().map(value => parseInt(value, 10));
    
    const randomColorIndex = RandomFloor(0, particleColors.length - 3);
    
    molang.setVector3('variable.offset', Vector.random(offset, 0.5));
    molang.setColorRGB('variable.color', particleColors[randomColorIndex]);
    
    numberDigits.forEach((value, index) => {
        molang.setVector3('variable.property', { x: value, y: index, z: numberDigits.length });
        TrySpawnParticle(anchor.dimension, 'scripts:setting.number_display', anchor.location, molang);
    });
}
;

function GetTargetIntel(object) {
    
    const entity = object.getEntitiesFromViewDirection()[0]?.entity;
    
    const block = object.getBlockFromViewDirection()?.block;
    
    const message = [];
    
    if (entity && entity.isValid) {
        
        if (entity.typeId != 'minecraft:item')
            return GetEntityIntel(entity, message);
        
        const item = entity.getComponent('minecraft:item')?.itemStack;
        
        if (!item)
            return [{ text: '§4 未知物品 §r' }];
        
        return GetItemStackIntel(item, message);
    }
    
    else if (block && block.isValid)
        return GetBlockIntel(block, message);
    
    return [{ text: '§4 未知目标 §r' }];
}
;

function GetTargetTags(object) {
    return object.getTags().map(info => { return { text: info + '\n' }; });
}
;

function GetBlockRecord(states) {
    
    let [output, name, value] = [[], [], []];
    
    for (let index in states) {
        value.push(states[index]);
        name.push(index);
    }
    ;
    for (let α = 0; α < name.length; α++) {
        output.push({ text: `§r§l<§r§5 ${name[α]} §7:§2 ${value[α]} §r§l>§r\n` });
    }
    ;
    
    return output;
}
;

function GetInventoryIntel(container, message) {
    
    if (container)
        for (let index = 0; index < container.size; index++) {
            
            const item = container.getItem(index);
            if (!item)
                continue;
            message.push(translate(item), { text: `§r : §2${item.amount}§r\n` });
        }
    ;
}
;

function GetItemStackIntel(item, message) {
    
    const durability = item.getComponent('minecraft:durability');
    
    const info = [
        { text: '§5§o§l[§9 物品 §5]§r : ' },
        translate(item),
        { text: ' → ' },
        { text: item.typeId },
        { text: `\n\n§5§o§l[§9 数量 §5]§r : ${item.amount}` },
        { text: `\n\n§5§o§l[§9 耐久 §5]§r : ${durability?.damage ?? 0}/${durability?.maxDurability ?? 0}` },
        { text: '\n\n§5§o§l[§9 标签 §5]§r :\n' }
    ];
    
    message.push(...info, ...GetTargetTags(item));
    
    return message;
}
;

function GetEntityIntel(entity, message) {
    
    const getHealth = entity.getComponent('minecraft:health');
    
    const getBasisSpeed = entity.getComponent('minecraft:movement');
    
    const getisTether = entity.getComponent('minecraft:leashable');
    
    const getTameable = entity.getComponent('minecraft:tameable');
    
    const getMagmaSpeed = entity.getComponent('minecraft:lava_movement');
    
    const getWaterSpeed = entity.getComponent('minecraft:underwater_movement');
    
    const getAllComponentsID = entity.getComponents().map(info => [{ text: info.typeId + '\n' }][0]);
    
    const getTameItems = getTameable ? getTameable.getTameItems.map(info => { return { rawtext: [{ text: '\n' }, translate(info)] }; }) : [{ text: '\n' }];
    
    const info = [
        { text: '§5§o§l[§9 实体 §5]§r : ' },
        translate(entity),
        { text: ' → ' },
        { text: entity.typeId },
        { text: `\n\n§5§o§l[§9 位置 §5]§r : §n${Vector.toString(entity.location)}§r` },
        { text: `\n\n§5§o§l[§9 血量 §5]§r : §2${getHealth?.currentValue ?? 0}/${getHealth?.defaultValue ?? 0}§r` },
        { text: `\n\n§5§o§l[§9 能否栓绳 §5]§r : §6${!!getisTether}§r` },
        { text: `\n\n§5§o§l[§9 陆地移速 §5]§r : §2${Math.floor((getBasisSpeed?.defaultValue ?? 0) * 100) / 100}§r` },
        { text: `\n\n§5§o§l[§9 水下移速 §5]§r : §2${Math.floor((getWaterSpeed?.defaultValue ?? 0) * 100) / 100}§r` },
        { text: `\n\n§5§o§l[§9 熔岩移速 §5]§r : §2${Math.floor((getMagmaSpeed?.defaultValue ?? 0) * 100) / 100}§r` },
        { text: '\n\n§5§o§l[§9 驯服材料 §5]§r : §6' },
    ];
    
    const container = entity.getComponent('inventory')?.container;
    
    const inventory = [{ text: '§5§o§l[§9 背包 §5]§r :\n' }];
    
    GetInventoryIntel(container, inventory);
    
    message.push(...info, ...getTameItems, { text: '\n§5§o§l[§9 标签 §5]§r :\n' }, ...GetTargetTags(entity), { text: '\n§5§o§l[§9 组件 §5]§r:\n' }, ...getAllComponentsID, ...inventory);
    
    return message;
}
;

function GetBlockIntel(block, message) {
    
    const states = block.permutation.getAllStates();
    
    const info = [
        { text: '§5§o§l[§9 方块 §5]§r : ' },
        translate(block),
        { text: ' → ' },
        { text: block.typeId },
        { text: `\n\n§5§o§l[§9 红石能量 §5]§r : §4${block.getRedstonePower() ?? 0}§r` },
        { text: '\n\n§5§o§l[§9 方块状态 §5]§r :\n' },
    ];
    
    const container = block.getComponent('inventory')?.container;
    
    const inventory = [{ text: '\n§5§o§l[§9 方块容器 §5]§r :\n' }];
    
    GetInventoryIntel(container, inventory);
    
    message.push(...info, ...GetBlockRecord(states), { text: '\n§5§o§l[§9 方块标签 §5]§r :\n' }, ...GetTargetTags(block), ...inventory);
    
    return message;
}
;
