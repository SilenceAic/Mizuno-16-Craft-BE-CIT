
import * as server from "@minecraft/server";

import { Vector } from './maths';

export { TrySetPermutation, TrySpawnParticle, TrySpawnItem, TryFillBlocks, TrySpawnEntity, SetFreePointer, TryProcessBlocksInVolume };

function TrySetPermutation(objects, type, value) {
    try {
        
        const blocks = Array.isArray(objects) ? objects : [objects];
        
        blocks.forEach(block => {
            
            const state = block.permutation.withState(type, value);
            
            block.setPermutation(state);
        });
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;

function TryProcessBlocksInVolume(dimension, location, range, filter, after) {
    try {
        
        const start = Vector.copy(location).add(Vector.CONSTANT_ONE.multiply(range));
        
        const done = Vector.copy(location).add(Vector.CONSTANT_ONE.multiply(-range));
        
        const blockVolume = new server.BlockVolume(start, done);
        
        const locations = [...dimension.getBlocks(blockVolume, filter).getBlockLocationIterator()];
        
        locations.forEach(location => {
            
            const block = dimension.getBlock(location);
            
            if (block && block?.isValid)
                after(block);
        });
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
    ;
}
;

function TrySpawnParticle(dimension, typeID, location, molang) {
    try {
        dimension.spawnParticle(typeID, location, molang);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;

function TrySpawnItem(dimension, item, location) {
    try {
        return dimension.spawnItem(item, location);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;

function TryFillBlocks(dimension, start, done, block, options) {
    try {
        return dimension.fillBlocks(new server.BlockVolume(start, done), block, options);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;

function TrySpawnEntity(dimension, typeID, location) {
    try {
        return dimension.spawnEntity(typeID, location);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;

function SetFreePointer(start, done, lifetime = 1, caseId = 'starry_map:execute.free_pointer') {
    
    const difference = Vector.difference(done, start.location);
    
    const angle = Vector.Vector3ToAngle(difference);
    
    const distance = Vector.distance(start.location, done);
    
    const entity = TrySpawnEntity(start.dimension, caseId, start.location);
    
    
    
    if (entity instanceof Error)
        return entity;
    
    entity.setProperty('property:x_axle_rotate', angle.x);
    
    entity.setProperty('property:y_axle_rotate', angle.y);
    
    entity.setProperty('property:length', distance * 8);
    
    server.system.runTimeout(() => { if (entity && entity.isValid)
        entity.remove(); }, lifetime * 20);
}
;
