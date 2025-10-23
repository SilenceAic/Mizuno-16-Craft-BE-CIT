
import * as serverUI from "@minecraft/server-ui";
import * as server from "@minecraft/server";
import prompt from "../data/prompt";

import { Vector } from './maths';

import { Control } from './plan';

import { TrySpawnParticle } from './create';

import { ReplyMessages, material, isPlayerAuthorized } from './lexicon_v5';

import { AlterEnergy } from './chunk';

import { DisplayFloatingText, ErrorMessage } from './intel';

export { CompleteSummonAnimation, ParticleSummonAnimation, SprayParticleTrigger, ExpendEnergy, HealthHigher, HealthBelow, CompileSign, PlayPrompt, MinecraftColor };

class MinecraftColor {
    red;
    green;
    blue;
    
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.red = red / 255;
        this.green = green / 255;
        this.blue = blue / 255;
    }
    ;
    
    get hex() {
        return `#${[Math.round(this.red * 255), Math.round(this.green * 255), Math.round(this.blue * 255)].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    }
    ;
    
    static WHITE = new this(240, 240, 240);
    
    static LIGHT_GRAY = new this(157, 157, 151);
    
    static GRAY = new this(71, 79, 82);
    
    static BLACK = new this(29, 29, 33);
    
    static BROWN = new this(131, 84, 50);
    
    static RED = new this(176, 46, 38);
    
    static ORANGE = new this(249, 128, 29);
    
    static YELLOW = new this(254, 216, 61);
    
    static LIME = new this(128, 199, 31);
    
    static GREEN = new this(94, 124, 22);
    
    static CYAN = new this(22, 156, 156);
    
    static LIGHT_BLUE = new this(58, 179, 218);
    
    static BLUE = new this(60, 68, 170);
    
    static PURPLE = new this(137, 50, 184);
    
    static MAGENTA = new this(199, 78, 189);
    
    static PINK = new this(243, 139, 170);
    
    static colorDistance(color1, color2) {
        
        const deltaR = color1.red - color2.red;
        
        const deltaG = color1.green - color2.green;
        
        const deltaB = color1.blue - color2.blue;
        
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB) * 100;
    }
    ;
    
    static getEntityColor(target) {
        
        const entityColorR = target.getProperty('property:color_r');
        
        const entityColorG = target.getProperty('property:color_g');
        
        const entityColorB = target.getProperty('property:color_b');
        
        return new this((entityColorR ?? 0.5) * 255, (entityColorG ?? 0.5) * 255, (entityColorB ?? 0.5) * 255);
    }
    ;
}
;

function SprayParticleTrigger(dimension, location, size = 1) {
    
    const molangGroup = [
        new server.MolangVariableMap(),
        new server.MolangVariableMap(),
        new server.MolangVariableMap(),
        new server.MolangVariableMap()
    ];
    
    molangGroup[0].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_EAST);
    molangGroup[1].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_WEST);
    molangGroup[2].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_SOUTH);
    molangGroup[3].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_NORTH);
    
    server.system.runTimeout(() => {
        TrySpawnParticle(dimension, 'scripts:spray_main_ripple', location, molangGroup[0]);
        molangGroup.forEach(map => TrySpawnParticle(dimension, 'scripts:spray_large_phase1', location, map));
    }, 1);
    server.system.runTimeout(() => {
        TrySpawnParticle(dimension, 'scripts:spray_splash', location, molangGroup[0]);
        TrySpawnParticle(dimension, 'scripts:spray_extend_ripple', location, molangGroup[0]);
        molangGroup.forEach(map => TrySpawnParticle(dimension, 'scripts:spray_large_phase2', location, map));
    }, 6);
}
;

function HealthBelow(health, percentage) {
    
    const current = health.currentValue;
    
    const maximum = health.defaultValue;
    
    return maximum * percentage >= current;
}
;

function HealthHigher(health, percentage) {
    
    const current = health.currentValue;
    
    const maximum = health.defaultValue;
    
    return maximum * percentage <= current;
}
;

function CompileSign(object, input, output) {
    
    const source = JSON.parse(object.getDynamicProperty(input));
    
    const getDimension = server.world.getDimension(source.dimension);
    
    output.set(input, { location: source.location, dimension: getDimension });
}
;

function CompleteSummonAnimation(player, location) {
    
    const camera = player.camera;
    
    ParticleSummonAnimation(player, location);
    
    camera.setCamera('minecraft:free', { location: Vector.add(location, { x: 15, y: 35, z: 15 }), facingLocation: location, easeOptions: { easeTime: 2 } });
    server.system.runTimeout(() => camera.setCamera('minecraft:free', { location: Vector.add(location, { x: -15, y: 5, z: 15 }), facingLocation: location, easeOptions: { easeTime: 2 } }), 80);
    server.system.runTimeout(() => camera.fade({ fadeColor: { red: 0, green: 0, blue: 0 }, fadeTime: { fadeInTime: 1, fadeOutTime: 0.5, holdTime: 0.5 } }), 120);
    server.system.runTimeout(() => camera.setCamera('minecraft:free', { location, facingLocation: location, easeOptions: { easeTime: 1 } }), 120);
    server.system.runTimeout(() => camera.clear(), 140);
}
;

function ParticleSummonAnimation(player, location) {
    
    const molang = new server.MolangVariableMap();
    
    molang.setFloat('variable.size', 10);
    molang.setFloat('variable.direction', 3);
    TrySpawnParticle(player.dimension, 'scripts:path_round', location, molang);
    TrySpawnParticle(player.dimension, 'scripts:path_star4_small', location, molang);
    TrySpawnParticle(player.dimension, 'scripts:path_butterfly', location, molang);
    molang.setFloat('variable.size', 13);
    TrySpawnParticle(player.dimension, 'scripts:path_round', location, molang);
    server.system.runTimeout(() => {
        molang.setFloat('variable.type', 0);
        molang.setVector3('variable.direction', Vector.CONSTANT_UP);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: 5, y: 0, z: 0 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: -5, y: 0, z: 0 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: 0, y: 0, z: 5 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: 0, y: 0, z: -5 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: 3.725, y: 0, z: 3.725 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: -3.725, y: 0, z: -3.725 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: -3.725, y: 0, z: 3.725 }), molang);
        TrySpawnParticle(player.dimension, 'scripts:path_ray', Vector.add(location, { x: 3.725, y: 0, z: -3.725 }), molang);
        player.playSound('conduit.attack', { volume: 10, location: Vector.add(location, { x: 15, y: 35, z: 15 }) });
    }, 40);
}
;

function ExpendEnergy(block, modify, noShow, create = false) {
    
    const getEnergy = AlterEnergy(block, modify, create);
    
    const direction = modify > 0 ? '§q↑§r' : '§m↓§r';
    
    if (getEnergy[0]) {
        if (!noShow)
            DisplayFloatingText(block, '<§l§d 星尘力 §r> : §l§u' + getEnergy[1] + direction);
        return true;
    }
    else {
        ErrorMessage('<§l§d 星尘力 §r>§4 发生错误§r', block, { text: '无法获取到足够的<§l§d 星尘力 §r>, 请使用<§l§u 能源节点 §r>进行补充或创建' });
        return false;
    }
}
;

function ExecuteAnalysisRealm(player, text, after) {
    
    const entry = server.world.getDynamicPropertyIds().filter(node => node.startsWith(`${text}•`)).sort((a, b) => b.length - a.length);
    
    const state = entry.map(node => server.world.getDynamicProperty(node));
    
    const title = { text: "§9<§l " + text + " §r§9>" };
    
    const display = new serverUI.ActionFormData().title(title);
    
    const mapping = (node) => {
        
        const analysis = node.split(/•/).map(node => Number(node));
        
        const anchor = { x: analysis[2] * 16, y: 0, z: analysis[4] * 16 };
        
        return Vector.toString(anchor);
    };
    
    if (entry.length >= 1)
        entry.forEach((key, index) => display.button('§l§9基准坐标 : §5' + mapping(key) + '\n§9属性值 : §r§u' + state[index]));
    else
        display.button('§4§l未创建§r : §u领域属性§9 -> §r' + text);
    
    display.show(player).then(option => {
        
        if (option.canceled || option.selection == undefined)
            return;
        if (entry.length == 0)
            return;
        
        after(player, { option, entry, state });
    });
}
;

function ExecuteAlterEnergy(player, args) {
    
    const title = { text: "§9《§u§l 调试 - 星尘能量 §9》§r" };
    
    const text = { text: "请输入新的星尘能量值, 修改需谨慎以避免故障" };
    
    const plan = { text: args.state[args.option.selection ?? 0]?.toString() };
    
    const display = new serverUI.ModalFormData().title(title).textField('星尘能量值', text, { 'defaultValue': plan.text });
    
    display.show(player).then(option => {
        if (!option.formValues)
            return;
        
        const property = Number(option.formValues[0]) ?? 0;
        
        server.world.setDynamicProperty(args.entry[args.option.selection ?? 0], property);
    });
}
;

function AlterMineral(player, args) {
    
    const title = { text: "§9《§u§l 调试 - 虚岩矿脉 §9》§r" };
    
    const text = { text: "请输入新的矿物参数, 修改需谨慎以避免故障" };
    
    const analysis = JSON.parse(`${args.state[args.option.selection ?? 0]}`);
    
    const proto_amount = analysis.amount;
    
    const proto_type = analysis.type;
    
    const display = new serverUI.ModalFormData().title(title);
    
    proto_type.forEach(type => display.textField('矿物类型', text, { 'defaultValue': type }));
    
    display.textField('矿物数量', text, { 'defaultValue': proto_amount.toString() });
    
    display.show(player).then(option => {
        
        if (!option.formValues)
            return;
        
        const type = option.formValues.slice(0, proto_type.length);
        
        const amount = option.formValues[proto_type.length].split(',').map(Number);
        
        server.world.setDynamicProperty(args.entry[args.option.selection ?? 0], JSON.stringify({ type, amount }));
    });
}
;

function AnalysisAlterEnergy(player) {
    
    if (!isPlayerAuthorized(player))
        return ReplyMessages.power_lack;
    
    ExecuteAnalysisRealm(player, 'stardust_energy', ExecuteAlterEnergy);
    
    return ReplyMessages.realm_energy;
}
;

function AnalysisAlterMineral(player) {
    
    if (!isPlayerAuthorized(player))
        return ReplyMessages.power_lack;
    
    ExecuteAnalysisRealm(player, 'mineral_vein', AlterMineral);
    
    return ReplyMessages.realm_mineral;
}
;

function PlayPrompt(object, type) {
    
    const intel = prompt.get(type);
    
    const message = { text: '「 星之引导 」: ' };
    
    if (object.hasTag('prompt:' + type) || !intel)
        return;
    
    intel.forEach(info => server.system.runTimeout(() => object.sendMessage([message, info.refer]), info.delay));
    intel.forEach(info => server.system.runTimeout(() => object.playSound('resonate.amethyst_block'), info.delay));
    
    object.addTag('prompt:' + type);
}
;

const scalability = new Map();
scalability.set('调试星尘能量', {
    synopsis: { text: '§c◆§r 允许玩家修改§9星尘能量§r的§2数值§r' },
    ...ReplyMessages.craft_template,
    code: AnalysisAlterEnergy
});
scalability.set('调试虚岩矿脉', {
    synopsis: { text: '§c◆§r 允许玩家修改§9虚岩矿脉§r的§6类型§r和§2数量§r' },
    ...ReplyMessages.craft_template,
    code: AnalysisAlterMineral
});

material.push(...scalability);

server.system.runInterval(() => Control.execute());
