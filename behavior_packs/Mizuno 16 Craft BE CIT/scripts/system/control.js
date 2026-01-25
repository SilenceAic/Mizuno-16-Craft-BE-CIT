
import * as server from "@minecraft/server";

import { Vector, Clamp } from './maths';

export { TriggerControl, ObtainWaitTime };

const ControlGroup = new Map();

function getUniqueIdentifier(source) {
    
    if (source instanceof server.Entity)
        return source.id;
    
    else if (source instanceof server.Block) {
        
        const dimension = source.dimension.id.split(/:/);
        
        return `${dimension[0]}.${Vector.toString(source)}.${dimension[1]}`;
    }
    
    else if (source instanceof Vector)
        return source.toString();
    
    throw new Error("不支持的源类型 -> 您应该指定实体或方块作为参数");
}
;

function TriggerControl(eventType, source, waitTime = 20) {
    
    const key = `${eventType}:${getUniqueIdentifier(source)}`;
    
    const existingTriggerTime = ControlGroup.get(key);
    
    if (existingTriggerTime === undefined || server.system.currentTick >= existingTriggerTime) {
        ControlGroup.set(key, server.system.currentTick + waitTime);
        return true;
    }
    
    return false;
}
;

function ObtainWaitTime(eventType, source) {
    
    const key = `${eventType}:${getUniqueIdentifier(source)}`;
    
    const existingTriggerTime = ControlGroup.get(key) ?? 0;
    
    return Clamp({ max: Number.MAX_SAFE_INTEGER, min: 0 }, existingTriggerTime - server.system.currentTick);
}
;
