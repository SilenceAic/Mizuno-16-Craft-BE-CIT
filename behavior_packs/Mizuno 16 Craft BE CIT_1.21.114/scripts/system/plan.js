
import * as server from "@minecraft/server";

import { can_display_logs } from "../data/table";

import { TrySpawnParticle } from './create';

import { Vector } from './maths';

export { Control, Template, PathExecute, MistySeaFissure, NumberID, BriefID, UUID };

class Control {
    
    static inventory = [];
    
    static beforeEventSubscribe(data) { }
    ;
    
    static execute() {
        
        if (this.inventory.length == 0)
            return;
        
        const waitRemove = new Set();
        
        this.inventory.forEach(plan => {
            
            plan.timeScore += 1;
            
            if (plan.timeScore % plan.cooldown != 0)
                return;
            
            let license = true;
            
            const remove = () => waitRemove.add(plan.planId);
            
            const cease = () => license = false;
            
            try {
                
                Control.beforeEventSubscribe({ plan, remove, cease });
                
                if (license)
                    plan.afterPlanEvent({ plan, remove });
            }
            catch (error) {
                
                const info = error instanceof Error ? error : new Error(String(error));
                
                const stack = info.stack ?? './';
                
                const intel = 'THE_OTHER_SHORE:' + info.message + stack;
                
                if (can_display_logs)
                    console.error(intel);
                
                remove();
            }
            ;
        });
        
        if (waitRemove.size > 0)
            this.inventory = this.inventory.filter(plan => !waitRemove.has(plan.planId));
    }
    ;
    
    constructor() { }
    ;
}
;

class Template {
    className;
    cooldown;
    annex;
    
    planId;
    
    timeScore = 1;
    
    afterPlanEvent(data) { }
    ;
    
    constructor(className, cooldown, annex) {
        this.className = className;
        this.cooldown = cooldown;
        this.annex = annex;
        this.cooldown = Math.floor(cooldown);
        this.planId = BriefID();
    }
    ;
    
    static Create(className, cooldown, data) {
        
        if (className == "")
            throw new Error("类名不能为空");
        
        const plan = new this(className, cooldown, data);
        
        Control.inventory.push(plan);
        
        return plan;
    }
    ;
}
;

class PathExecute extends Template {
    
    pathIndex = 1;
    
    current = { ...Vector.CONSTANT_ZERO };
    
    direction = Vector.CONSTANT_ZERO;
    
    nodeDistance = 0;
    
    location_group = [];
    
    dimension = server.world.getDimension('overworld');
    
    particles = [];
    
    particleMolang = undefined;
    
    on_move;
    
    on_done;
    
    offset;
    
    annex = {};
    
    speed = 1;
    
    boundsCounting = 0;
    
    afterPlanEvent(data) {
        if (this.speed == 1)
            this.executePathPlan(data);
        else
            for (let index = 0; index < this.speed; index++)
                this.executePathPlan(data);
    }
    ;
    
    executePathPlan(data) {
        
        if (this.boundsCounting >= 1)
            return;
        
        const distance = Vector.distance(this.location_group[this.pathIndex], this.current);
        
        const endIndex = this.location_group.length - 1;
        
        const enable = Vector.distance(this.current, this.location_group[endIndex]) < 1;
        
        const pathAnnexData = {
            dimension: this.dimension,
            location: this.current,
            tick: this.timeScore
        };
        
        if (this.on_move) {
            
            const onClose = this.on_move(pathAnnexData);
            
            if (onClose == false && this.on_done)
                this.on_done(pathAnnexData);
            
            if (onClose == false)
                return data.remove();
        }
        ;
        
        if (this.particles.length > 0)
            this.particles.forEach(particle => TrySpawnParticle(this.dimension, particle, this.current));
        
        if (this.particleMolang !== undefined)
            TrySpawnParticle(this.dimension, this.particleMolang[0], this.current, this.particleMolang[1]);
        
        this.modifyCurrentLocation(this, distance, endIndex);
        
        if (!enable || this.pathIndex != endIndex)
            return;
        
        if (this.on_done)
            this.on_done(pathAnnexData);
        
        this.boundsCounting += 1;
        
        return data.remove();
    }
    ;
    
    modifyCurrentLocation(self, distance, endIndex) {
        
        if (distance < 1 && self.pathIndex != endIndex) {
            
            self.pathIndex += 1;
            
            self.direction = Vector.subtract(self.location_group[self.pathIndex], self.current);
            
            self.nodeDistance = Vector.distance(self.location_group[self.pathIndex], self.current);
        }
        
        else {
            self.current.x += (self.direction.x / self.nodeDistance);
            self.current.y += (self.direction.y / self.nodeDistance);
            self.current.z += (self.direction.z / self.nodeDistance);
        }
        ;
    }
    ;
    
    static prepareShootingPath(source, args, offset) {
        
        if (!source || !args.shoot)
            return;
        
        const endPoint = Vector.add(args.shoot.start_place, Vector.multiply(args.shoot.toward, args.shoot.max_distance));
        
        source.location_group = [args.shoot.start_place, endPoint];
        
        if (offset)
            source.location_group = source.location_group.map(location => Vector.add(location, offset));
        
        source.current = source.location_group[0];
        source.direction = Vector.subtract(source.location_group[1], source.current);
        source.nodeDistance = Vector.distance(source.location_group[1], source.current);
    }
    ;
    
    static prepareDefaultPath(source, offset) {
        
        const player = source.dimension.getPlayers()[0];
        
        if (source.location_group.length === 0) {
            
            source.location_group = [player.location, Vector.add(player.location, { x: 10, y: 10, z: 10 })];
        }
        else if (source.location_group.length === 1) {
            
            source.location_group.push(Vector.add(source.location_group[0], { x: 10, y: 10, z: 10 }));
        }
        
        if (offset)
            source.location_group = source.location_group.map(location => Vector.add(location, offset));
        
        source.current = source.location_group[0];
        source.direction = Vector.subtract(source.location_group[1], source.current);
        source.nodeDistance = Vector.distance(source.location_group[1], source.current);
    }
    ;
    
    static Create(className, cooldown, data) {
        
        if (className == "")
            throw new Error("类名不能为空");
        
        const plan = new PathExecute(className, cooldown, data);
        
        const shootToward = () => {
            if (data.shoot) {
                return {
                    shoot: {
                        toward: data.shoot.toward,
                        start_place: data.shoot.start_place,
                        max_distance: Math.floor(data.shoot.max_distance)
                    }
                };
            }
            else
                return {};
        };
        
        plan.location_group = data.locations;
        plan.dimension = data.dimension;
        plan.cooldown = Math.floor(data.cooldown);
        plan.particles = data?.particles || [];
        plan.particleMolang = data.particleMolang;
        plan.on_move = data.on_move;
        plan.on_done = data.on_done;
        plan.offset = data.offset;
        plan.speed = Math.floor(data.speed);
        plan.annex = shootToward();
        
        if (data.shoot)
            PathExecute.prepareShootingPath(plan, data, plan.offset);
        
        if (!data.shoot)
            PathExecute.prepareDefaultPath(plan, plan.offset);
        
        Control.inventory.push(plan);
        
        return plan;
    }
    ;
    
    static CreateForCube(className, data, start, done, multiple = 1) {
        
        if (className == "")
            throw new Error("类名不能为空");
        
        const plan = new PathExecute(className, 1, data);
        
        if (plan.offset)
            start = Vector.add(start, plan.offset);
        if (plan.offset)
            done = Vector.add(done, plan.offset);
        
        const distance = Vector.distance(done, start);
        
        const copyStart = Vector.copy(start);
        
        const copyDone = Vector.copy(done);
        
        plan.modifyCurrentLocation = (self) => {
            if (self.current.x != copyDone.x) {
                self.current.x += copyDone.x > self.current.x ? 1 : -1;
            }
            else if (self.current.x == copyDone.x && self.current.z != copyDone.z) {
                self.current.z += copyDone.z > self.current.z ? 1 : -1;
                self.current.x = copyStart.x;
            }
            else if (self.current.x == copyDone.x && self.current.z == copyDone.z && self.current.y != copyDone.y) {
                self.current.y += copyDone.y > self.current.y ? 1 : -1;
                self.current.x = copyStart.x;
                self.current.z = copyStart.z;
            }
            else if (self.current.x == copyDone.x && self.current.z == copyDone.z && self.current.y == copyDone.y) {
                self.pathIndex = 1;
                self.boundsCounting += 2;
            }
            ;
        };
        
        plan.nodeDistance = Vector.distance(done, start);
        plan.direction = Vector.subtract(done, start);
        plan.location_group = [start, done];
        plan.dimension = data.dimension;
        plan.cooldown = Math.floor(data.cooldown);
        plan.particles = data?.particles || [];
        plan.on_move = data.on_move;
        plan.on_done = data.on_done;
        plan.offset = data.offset;
        plan.current = start;
        plan.speed = Math.floor((distance - 1) * multiple) + 1;
        
        Control.inventory.push(plan);
        
        return plan;
    }
    ;
    
    static CreateForFrame(className, data, start, done) {
        
        if (className == "")
            throw new Error("类名不能为空");
        
        const plan = new PathExecute(className, 1, data);
        
        const vector = Vector.subtract(done, start);
        
        const distance = Vector.distance(done, start);
        
        const location_group = [];
        
        if (vector.y != 0 && vector.x != 0 && vector.z != 0) {
            location_group.push(
            
            Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: 0 }), Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, Vector.CONSTANT_ZERO), Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, { x: 0, y: vector.y, z: vector.z }), Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, Vector.CONSTANT_ZERO), 
            
            Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: 0, z: vector.z }), 
            
            Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, { x: 0, y: vector.y, z: vector.z }), Vector.add(start, { x: vector.x, y: vector.y, z: vector.z }), Vector.add(start, { x: vector.x, y: 0, z: vector.z }), Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: vector.z }));
        }
        else if (vector.y == 0 && vector.x != 0 && vector.z != 0) {
            location_group.push(Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: 0, z: vector.z }), Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, Vector.CONSTANT_ZERO));
        }
        else if (vector.y != 0 && vector.x == 0 && vector.z != 0) {
            location_group.push(Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, { x: 0, y: vector.y, z: vector.z }), Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, Vector.CONSTANT_ZERO));
        }
        else if (vector.y != 0 && vector.x != 0 && vector.z == 0) {
            location_group.push(Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: 0 }), Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, Vector.CONSTANT_ZERO));
        }
        ;
        
        plan.location_group = [start, ...location_group];
        plan.dimension = data.dimension;
        plan.cooldown = Math.floor(data.cooldown);
        plan.particles = data?.particles || [];
        plan.on_move = data.on_move;
        plan.on_done = data.on_done;
        plan.offset = data.offset;
        plan.speed = distance;
        
        PathExecute.prepareDefaultPath(plan, plan.offset);
        
        Control.inventory.push(plan);
        
        return plan;
    }
    ;
}
;

class MistySeaFissure extends Template {
    
    survivalTime = 0;
    
    afterPlanEvent(data) {
        
        if (this.survivalTime >= 20 || !this.annex.dimensions || !this.annex.locations || this.annex.dimensions.length < 2 || this.annex.locations.length < 2)
            return data.remove();
        
        const showDimension = this.annex.dimensions[0];
        
        const showLocation = this.annex.locations[0];
        
        const pointLocation = this.annex.locations[1];
        
        const pointDimension = this.annex.dimensions[1];
        
        this.survivalTime++;
        
        
        TrySpawnParticle(showDimension, 'constant:the_cracks_of_the_misty_sea', showLocation);
        
        showDimension.getEntities({ location: showLocation, maxDistance: 3 }).forEach(entity => entity.tryTeleport(pointLocation, { dimension: pointDimension }));
    }
    ;
    
    static BriefCreate(nameTag, data) {
        return this.Create(nameTag, 30, data);
    }
    ;
}
;

function NumberID(deplete = 0) {
    
    const base = 10000000;
    
    const timestamp = server.system.currentTick;
    
    const random = Math.floor(Math.random() * 10000);
    
    const value = (base + (timestamp % base) + random - deplete) % 100000000;
    
    return value.toString().padStart(8, '0');
}
;

function BriefID() {
    
    const timePart = (server.system.currentTick & 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
    
    const randomPart = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0').toUpperCase();
    
    const difference = (parseInt(randomPart, 16) - parseInt(timePart, 16) + 0x10000) % 0x10000;
    
    const differencePart = difference.toString(16).padStart(4, '0').toUpperCase();
    
    return `${randomPart}-${differencePart}-${timePart}`;
}
;

function UUID() {
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
        
        const randomValue = (Math.random() * 16) | 0;
        
        const maskedRandomValue = character === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
        
        return maskedRandomValue.toString(16);
    });
}
;
 
