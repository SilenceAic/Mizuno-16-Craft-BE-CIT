
import * as server from "@minecraft/server";

import * as table from "../data/table";
import * as type from "../data/type";

import { TrySpawnParticle } from './create';

import { RandomFloat, Vector, IsEnable, Clamp } from './maths';

import { Template } from './plan';

import { TriggerControl } from './control';

export { RandomRune, CreateProperty, SetProperty, AlterProperty, MergeProperty, GetProperty, CreateEmptyProperty, ElementalAttack, IsErupt, BackoffByDistance };

const rune_fusion = new Map([
    
    [10010, { double: 2, event: quicksand }],
    
    [110000, { double: 1.5, event: resonance }],
    
    [11000, { double: 2, event: produce }],
    
    [10100, { double: 2, event: crystal }],
    
    [110, { double: 2, event: vapor }],
    
    [100010, { double: 1.5, event: electric }],
    
    [100100, { double: 1.5, event: overload }],
    
    [1000010, { double: 2, event: like_water }],
    
    [1010000, { double: 2, event: directive }],
    
    [1010, { double: 1.5, event: blossom }],
    
    [101000, { double: 5, event: sharpen }],
    
    [1100, { double: 3, event: flame }],
    
    [10010000, { double: 5, event: zero }],
    
    [10000100, { double: 2, event: embers }],
    
    [1100000, { double: 2, event: thunderous }],
    
    [1000100, { double: 2, event: brilliance }],
    
    [1001000, { double: 2, event: catalysis }],
    
    [10001000, { double: 5, event: withered }],
    
    [10000010, { double: 2, event: tides }],
    
    [10001000, { double: 2, event: insulation }],
    
    [10010000, { double: 1.5, event: polarity }],
]);

class RuneClingEntity extends Template {
    
    static tokenGroup = [];
    
    static CreateToken(source) {
        
        const test = RuneClingEntity.tokenGroup.filter(token => token.id === source.id).length;
        
        if (test === 0)
            RuneClingEntity.tokenGroup.push({ id: source.id, wait: 100 });
        
        else {
            RuneClingEntity.tokenGroup = RuneClingEntity.tokenGroup.filter(token => token.id !== source.id);
            RuneClingEntity.tokenGroup.push({ id: source.id, wait: 100 });
        }
        return test === 0;
    }
    ;
    afterPlanEvent() {
        
        const reset = RuneClingEntity.tokenGroup.filter(token => token.wait <= 0);
        
        const valid = RuneClingEntity.tokenGroup.filter(token => token.wait > 0);
        
        RuneClingEntity.tokenGroup = RuneClingEntity.tokenGroup.filter(token => token.wait > 0);
        
        RuneClingEntity.tokenGroup.forEach(token => token.wait -= 1);
        
        reset.forEach(token => {
            
            const entity = server.world.getEntity(token.id);
            if (!entity)
                return;
            AlterProperty(entity, { add_rune: 'rune_void' });
        });
        
        valid.forEach(token => {
            
            const entity = server.world.getEntity(token.id);
            if (!entity)
                return;
            
            const molang = new server.MolangVariableMap();
            
            const state = GetProperty(entity);
            
            const dimension = entity.dimension;
            
            const colour = table.getRuneColor(state.self_rune);
            
            molang.setFloat('variable.scale', 0.35);
            molang.setColorRGB('variable.color', colour);
            molang.setVector3('variable.offset', { x: 0, y: 1.5, z: 0 });
            
            TrySpawnParticle(dimension, `scripts:fusion_${state.add_rune}`, entity.getHeadLocation(), molang);
        });
    }
    ;
    
    static BriefCreate(nameTag) {
        return this.Create(nameTag, 1, {});
    }
    ;
}
;

function BackoffByDistance(entity, target, multiplier = 3) {
    
    const direction = Vector.difference(entity.location, target.location);
    
    const distance = Vector.distance(entity.location, target.location);
    
    const mapping = ((1 + distance) / distance) * multiplier;
    
    target.applyKnockback({ x: direction.x * mapping, z: direction.z * mapping }, direction.y * (multiplier - 1));
}
;

function RandomRune() {
    
    const runes = [
        type.RUNE_ENUM.blue,
        type.RUNE_ENUM.green,
        type.RUNE_ENUM.orange,
        type.RUNE_ENUM.red,
        type.RUNE_ENUM.purple
    ];
    
    const randomIndex = RandomFloat(0, runes.length);
    
    return runes[randomIndex];
}
;

function IsErupt(object) {
    
    const getData = GetProperty(object);
    
    const eruptOdds = getData.erupt_odds + getData.raise_erupt_odds;
    
    return IsEnable(eruptOdds);
}
;

function CreateProperty(entity, input) {
    
    const setProperty = (key) => {
        entity.setDynamicProperty(`rune_hurt:${key}`, input?.[key] ?? type.RUNE_PROPERTY_DEFAULT[key]);
    };
    
    setProperty('raise_basic_attack');
    setProperty('raise_erupt_odds');
    setProperty('raise_erupt_hurt');
    setProperty('damage_increase');
    setProperty('double_damage');
    setProperty('basic_attack');
    setProperty('erupt_hurt');
    setProperty('erupt_odds');
    setProperty('add_rune');
    
    entity.setDynamicProperty('rune_hurt:self_rune', input?.self_rune ?? RandomRune());
}
;

function SetProperty(object, input) {
    
    const proto = GetProperty(object);
    
    object.setDynamicProperty('rune_hurt:basic_attack', input.basic_attack ?? proto.basic_attack);
    object.setDynamicProperty('rune_hurt:raise_basic_attack', input.raise_basic_attack ?? proto.raise_basic_attack);
    
    object.setDynamicProperty('rune_hurt:erupt_odds', input.erupt_odds ?? proto.erupt_odds);
    object.setDynamicProperty('rune_hurt:raise_erupt_odds', input.raise_erupt_odds ?? proto.raise_erupt_odds);
    
    object.setDynamicProperty('rune_hurt:erupt_hurt', input.erupt_hurt ?? proto.erupt_hurt);
    object.setDynamicProperty('rune_hurt:raise_erupt_hurt', input.raise_erupt_hurt ?? proto.raise_erupt_hurt);
    
    object.setDynamicProperty('rune_hurt:damage_increase', input.damage_increase ?? proto.damage_increase);
    object.setDynamicProperty('rune_hurt:double_damage', input.double_damage ?? proto.double_damage);
    
    object.setDynamicProperty('rune_hurt:add_rune', input.add_rune ?? proto.add_rune);
    object.setDynamicProperty('rune_hurt:self_rune', input.self_rune ?? proto.self_rune);
}
;

function AlterProperty(object, input) {
    
    if (!object.getDynamicProperty('entity:is_initial'))
        return;
    
    const proto = GetProperty(object);
    
    if (input.basic_attack)
        object.setDynamicProperty('rune_hurt:basic_attack', proto.basic_attack + input.basic_attack);
    if (input.raise_basic_attack)
        object.setDynamicProperty('rune_hurt:raise_basic_attack', proto.raise_basic_attack + input.raise_basic_attack);
    
    if (input.erupt_odds)
        object.setDynamicProperty('rune_hurt:erupt_odds', proto.erupt_odds + input.erupt_odds);
    if (input.raise_erupt_odds)
        object.setDynamicProperty('rune_hurt:raise_erupt_odds', proto.raise_erupt_odds + input.raise_erupt_odds);
    
    if (input.erupt_hurt)
        object.setDynamicProperty('rune_hurt:erupt_hurt', proto.erupt_hurt + input.erupt_hurt);
    if (input.raise_erupt_hurt)
        object.setDynamicProperty('rune_hurt:raise_erupt_hurt', proto.raise_erupt_odds + input.raise_erupt_hurt);
    
    if (input.damage_increase)
        object.setDynamicProperty('rune_hurt:damage_increase', proto.damage_increase + input.damage_increase);
    if (input.double_damage)
        object.setDynamicProperty('rune_hurt:double_damage', proto.double_damage + input.double_damage);
    
    object.setDynamicProperty('rune_hurt:add_rune', input.add_rune ?? proto.add_rune);
    object.setDynamicProperty('rune_hurt:self_rune', input.self_rune ?? proto.self_rune);
}
;

function MergeProperty(proto, alter) {
    return { ...proto, ...alter };
}
;

function GetProperty(entity) {
    
    if (!entity || !entity.isValid)
        return type.RUNE_PROPERTY_DEFAULT;
    
    const getProperty = (key, initial) => entity?.getDynamicProperty(`rune_hurt:${key}`) ?? initial;
    
    return {
        
        raise_basic_attack: getProperty('raise_basic_attack', type.RUNE_PROPERTY_DEFAULT.raise_basic_attack),
        raise_erupt_odds: getProperty('raise_erupt_odds', type.RUNE_PROPERTY_DEFAULT.raise_erupt_odds),
        raise_erupt_hurt: getProperty('raise_erupt_hurt', type.RUNE_PROPERTY_DEFAULT.raise_erupt_hurt),
        damage_increase: getProperty('damage_increase', type.RUNE_PROPERTY_DEFAULT.damage_increase),
        double_damage: getProperty('double_damage', type.RUNE_PROPERTY_DEFAULT.double_damage),
        
        basic_attack: getProperty('basic_attack', type.RUNE_PROPERTY_DEFAULT.basic_attack),
        erupt_odds: getProperty('erupt_odds', type.RUNE_PROPERTY_DEFAULT.erupt_odds),
        erupt_hurt: getProperty('erupt_hurt', type.RUNE_PROPERTY_DEFAULT.erupt_hurt),
        
        self_rune: getProperty('self_rune', type.RUNE_PROPERTY_DEFAULT.self_rune),
        add_rune: getProperty('add_rune', type.RUNE_PROPERTY_DEFAULT.add_rune),
    };
}
;

function CreateEmptyProperty(input) {
    
    const proto = {};
    
    for (const key in type.RUNE_PROPERTY_DEFAULT) {
        if (type.RUNE_PROPERTY_DEFAULT.hasOwnProperty(key)) {
            proto[key] = type.RUNE_PROPERTY_DEFAULT[key];
        }
    }
    ;
    return MergeProperty(proto, input);
}
;

function ElementalAttack(self, target, erupt = false, hurtData) {
    
    if (!self || !target || !target.isValid || !target.getComponent('health') || erupt == undefined)
        return;
    
    const selfData = MergeProperty(GetProperty(self), hurtData ?? {});
    
    const targetData = GetProperty(target);
    
    const options = DamageOptions(self);
    
    const fusion = ElementalReactions(target, targetData.add_rune, selfData.self_rune);
    
    const improve = MergeProperty(selfData, { double_damage: fusion + selfData.double_damage });
    
    const damage = RuneElementalDamage(improve, erupt);
    
    if (selfData.self_rune !== targetData.self_rune)
        target.applyDamage(damage, options);
    
    else
        ElementalResistance(target, options, damage, table.rune_resistance);
    
    SetProperty(target, { add_rune: selfData.self_rune });
    
    SetProperty(self, table.reset_battle_data);
    
    RuneClingEntity.CreateToken(target);
}
;

function DamageOptions(self, hurtType) {
    return {
        cause: server.EntityDamageCause[hurtType ?? 'entityExplosion'],
        damagingEntity: self
    };
}
;

function ElementalReactions(target, old, add) {
    
    const getOldValue = type.RUNE_COUNT[old];
    
    const getAddValue = type.RUNE_COUNT[add];
    
    if (!target)
        return 0;
    
    const result = rune_fusion.get(getOldValue + getAddValue);
    
    if (!result)
        return 0;
    
    if (result.event)
        result.event(target);
    
    return result.double;
}
;

function ElementalResistance(target, options, damage, resistance) {
    
    TrySpawnParticle(target.dimension, 'constant:rune_resistance', target.getHeadLocation());
    
    target.dimension.playSound('random.glass', target.location);
    
    target.applyDamage(damage * (1 - resistance), options);
}
;

function RuneElementalDamage(data, erupt) {
    
    const baseAttack = data.basic_attack + data.raise_basic_attack;
    
    const criticalMultiplier = (data.erupt_hurt + data.raise_erupt_hurt) / 100;
    
    const normalDamage = baseAttack * data.double_damage;
    
    const criticalDamage = (baseAttack * criticalMultiplier) * data.double_damage;
    
    const maxDamage = server.world.getDynamicProperty('rune_hurt:max_damage') ?? Number.MAX_SAFE_INTEGER;
    
    const minDamage = server.world.getDynamicProperty('rune_hurt:min_damage') ?? 5;
    
    const calculatedDamage = erupt ? (criticalDamage + data.damage_increase) : (normalDamage + data.damage_increase);
    
    return Clamp({ min: minDamage, max: maxDamage }, calculatedDamage);
}
;

async function ScopeAdditional(self, type) {
    
    const options = {
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"],
        location: self.location,
        maxDistance: 4,
        closest: 8
    };
    
    const entitys = self.dimension.getEntities(options);
    
    const getData = GetProperty(self);
    
    const hurtData = MergeProperty(getData, { self_rune: type });
    
    await server.system.waitTicks(5);
    
    entitys.forEach(target => ElementalAttack(self, target, false, hurtData));
}
;

function overload(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    ScopeAdditional(self, 'rune_red');
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.overload', self.getHeadLocation());
    
    if (self instanceof server.Player)
        return;
    
    self.applyImpulse(Vector.CONSTANT_UP);
}
;

function tides(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.tides', self.getHeadLocation());
    
    self.extinguishFire(true);
}
;

function catalysis(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.catalysis', self.getHeadLocation());
}
;

function electric(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    ScopeAdditional(self, 'rune_purple');
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.electric', self.getHeadLocation());
    
    if (self instanceof server.Player)
        return;
    
    self.applyImpulse(Vector.CONSTANT_DOWN);
}
;

function resonance(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    ScopeAdditional(self, 'rune_orange');
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.resonance', self.getHeadLocation());
    
    if (self instanceof server.Player)
        return;
    
    self.applyImpulse(Vector.CONSTANT_HALF);
}
;

function zero(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.zero', self.getHeadLocation());
}
;

function brilliance(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.brilliance', self.getHeadLocation());
}
;

function sharpen(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.sharpen', self.getHeadLocation());
    
    server.system.run(() => SetProperty(self, { add_rune: 'rune_purple' }));
}
;

function crystal(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.crystal', self.getHeadLocation());
    
    server.system.run(() => SetProperty(self, { add_rune: 'rune_orange' }));
}
;

function insulation(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.insulation', self.getHeadLocation());
}
;

function withered(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.withered', self.getHeadLocation());
}
;

function thunderous(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.thunderous', self.getHeadLocation());
}
;

function quicksand(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.quicksand', self.getHeadLocation());
    
    server.system.run(() => SetProperty(self, { add_rune: 'rune_orange' }));
}
;

function directive(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.directive', self.getHeadLocation());
}
;

function polarity(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    const health = self.getComponent('health');
    
    if (!health)
        return;
    
    const current = health?.currentValue ?? 0;
    
    const Clamping = Math.max(10, Math.min((current * 0.15), 3000));
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.polarity', self.getHeadLocation());
    
    server.system.runTimeout(() => health?.setCurrentValue(current - Clamping), 2);
}
;

function flame(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.flame', self.getHeadLocation());
    
    self.setOnFire(self.typeId.length * 2, true);
    
    server.system.run(() => SetProperty(self, { add_rune: 'rune_red' }));
}
;

function like_water(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.like_water', self.getHeadLocation());
}
;

function produce(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.produce', self.getHeadLocation());
    
    server.system.run(() => SetProperty(self, { add_rune: 'rune_orange' }));
}
;

function embers(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.embers', self.getHeadLocation());
}
;

function blossom(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    ScopeAdditional(self, 'rune_green');
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.blossom', self.getHeadLocation());
}
;

function vapor(self) {
    
    if (!TriggerControl('元素反应', self, 20))
        return;
    
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.vapor', self.getHeadLocation());
    
    self.extinguishFire(true);
    
    server.system.run(() => SetProperty(self, { add_rune: 'rune_blue' }));
}
;

RuneClingEntity.BriefCreate('世界初始化容器');
