
import * as server from "@minecraft/server";

import { Vector } from './maths';

import { PathExecute } from './plan';

export { DisplayChunkBoundary, RealmPropertyName, AlterEnergy, QueryEnergy };

function DisplayChunkBoundary(source) {
    
    const anchor = Vector.add(source.location, { x: 0, y: -16, z: 0 });
    
    const startPlace = Vector.chunkLocation(anchor, false);
    
    const donePlace = Vector.add(startPlace, { x: 16, y: 32, z: 16 });
    
    PathExecute.CreateForFrame('显示区块边界', {
        particles: ['constant:prompt_route'],
        locations: [],
        dimension: source.dimension,
        cooldown: 1,
        speed: 1
    }, startPlace, donePlace);
}
;

function RealmPropertyName(object, type, range) {
    
    const nodeQueue = [];
    
    server.world.getDynamicPropertyIds()
        .filter(node => node.startsWith(`${type}•`))
        .forEach(node => node.split(/•/)[1] == object.dimension.id
        ? nodeQueue.push({ x: JSON.parse(node.split(/•/)[2]), y: 0, z: JSON.parse(node.split(/•/)[4]) })
        : void 0);
    
    if (nodeQueue.length == 0)
        return;
    
    const distance = nodeQueue.map(node => Vector.distance(node, { x: Math.floor(object.location.x / 16), y: 0, z: Math.floor(object.location.z / 16) }));
    
    const minDistance = Math.min(...distance);
    
    if (minDistance <= range) {
        
        const index = distance.indexOf(minDistance);
        
        return `${type}•${object.dimension.id}•${nodeQueue[index].x}•0•${nodeQueue[index].z}`;
    }
    
    else
        return;
}
;

function AlterEnergy(object, offset, create) {
    
    const MAX_ENERGY = 10_000_000;
    
    const current = `stardust_energy•${object.dimension.id}•${Math.floor(object.location.x / 16)}•0•${Math.floor(object.location.z / 16)}`;
    
    const typePrefix = current.split(/•/)[0];
    
    const realmName = RealmPropertyName(object, typePrefix, 16);
    
    if (!realmName) {
        
        if (create) {
            server.world.setDynamicProperty(current, offset);
            
            return [true, offset];
        }
        
        return [false, offset];
    }
    
    const rawPrice = server.world.getDynamicProperty(realmName);
    
    if (typeof rawPrice !== 'number')
        return [false, 0];
    
    const price = rawPrice;
    
    const newAmount = price + offset;
    
    if (newAmount <= 0) {
        
        if (newAmount === 0) {
            server.world.setDynamicProperty(realmName, undefined);
        }
        
        return [false, 0];
    }
    
    if (newAmount >= MAX_ENERGY)
        return [true, price];
    
    server.world.setDynamicProperty(realmName, newAmount);
    
    return [true, newAmount];
}

function QueryEnergy(object) {
    
    const current = `stardust_energy•${object.dimension.id}•${Math.floor(object.location.x / 16)}•0•${Math.floor(object.location.z / 16)}`;
    
    const realmName = RealmPropertyName(object, current.split(/•/)[0], 48);
    
    if (!realmName)
        return 0;
    
    return server.world.getDynamicProperty(realmName);
}
;
