/*
 * 原版接口
 */
import * as serverUI from "@minecraft/server-ui";
import * as server from "@minecraft/server";
import prompt from "../data/prompt";
/*
 * 数学拓展模块
 */
import { Vector } from './maths';
/*
 * 计划执行模块
 */
import { Control } from './plan';
/*
 * 实例创建模块
 */
import { TrySpawnParticle } from './create';
/*
 * 月华百科模块
 */
import { ReplyMessages, material, isPlayerAuthorized } from './lexicon_v5';
/*
 * 区块处理模块
 */
import { AlterEnergy } from './chunk';
/*
 * 信息处理模块
 */
import { DisplayFloatingText, ErrorMessage } from './intel';
/*
 * 导出模块
 */
export { CompleteSummonAnimation, ParticleSummonAnimation, SprayParticleTrigger, ExpendEnergy, HealthHigher, HealthBelow, CompileSign, PlayPrompt, };
/**
 * * 水花粒子效果触发器
 */
function SprayParticleTrigger(dimension, location, size = 1) {
    /**
     * * 参数数组
     */
    const molangGroup = [
        new server.MolangVariableMap(),
        new server.MolangVariableMap(),
        new server.MolangVariableMap(),
        new server.MolangVariableMap()
    ];
    // 设置 参数
    molangGroup[0].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_EAST);
    molangGroup[1].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_WEST);
    molangGroup[2].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_SOUTH);
    molangGroup[3].setSpeedAndDirection('variable.property', size, Vector.CONSTANT_NORTH);
    // 输出 粒子
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
/**
 * * 判断 实体当前生命值 是否低于 指定百分比
 *
 * @param {server.EntityHealthComponent} health - 实体生命值组件
 *
 * @param {number} percentage - 百分比
 *
 * @returns {boolean} - 返回 实体当前生命值 是否低于 指定百分比
 */
function HealthBelow(health, percentage) {
    /**
     * * 当前生命值
     */
    const current = health.currentValue;
    /**
     * * 最大生命值
     */
    const maximum = health.defaultValue;
    // 返回测试结果
    return maximum * percentage >= current;
}
;
/**
 * * 判断 实体当前生命值 是否高于 指定百分比
 *
 * @param {server.EntityHealthComponent} health - 实体生命值组件
 *
 * @param {number} percentage - 百分比
 *
 * @returns {boolean} - 返回 实体当前生命值 是否高于 指定百分比
 */
function HealthHigher(health, percentage) {
    /**
     * * 当前生命值
     */
    const current = health.currentValue;
    /**
     * * 最大生命值
     */
    const maximum = health.defaultValue;
    // 返回测试结果
    return maximum * percentage <= current;
}
;
/**
 * * 尝试获取 诸界道标
 *
 * @param {server.Player} object - 作为 信息源 的 玩家对象
 *
 * @param {string} input - 获取信息 的 键
 *
 * @param {Map<string, type.LOCATION_AND_DIMENSION>} output - 存储信息 的 Map对象
 */
function CompileSign(object, input, output) {
    /**
     * * 获取 json信息
     */
    const source = JSON.parse(object.getDynamicProperty(input));
    /**
     * * 获取 目标维度
     */
    const getDimension = server.world.getDimension(source.dimension);
    // 保存 解析后的 坐标信息
    output.set(input, { location: source.location, dimension: getDimension });
}
;
/**
 * * 包含 粒子动画 与 镜头动画 的 完整召唤动画
 *
 * @param {server.Player} player - 玩家对象
 *
 * @param {server.Vector3} location - 召唤点坐标
 */
function CompleteSummonAnimation(player, location) {
    /**
     * * 定义 相机参数
     */
    const camera = player.camera;
    // 构建 粒子动画
    ParticleSummonAnimation(player, location);
    // 构建 镜头动画
    camera.setCamera('minecraft:free', { location: Vector.add(location, { x: 15, y: 35, z: 15 }), facingLocation: location, easeOptions: { easeTime: 2 } });
    server.system.runTimeout(() => camera.setCamera('minecraft:free', { location: Vector.add(location, { x: -15, y: 5, z: 15 }), facingLocation: location, easeOptions: { easeTime: 2 } }), 80);
    server.system.runTimeout(() => camera.fade({ fadeColor: { red: 0, green: 0, blue: 0 }, fadeTime: { fadeInTime: 1, fadeOutTime: 0.5, holdTime: 0.5 } }), 120);
    server.system.runTimeout(() => camera.setCamera('minecraft:free', { location, facingLocation: location, easeOptions: { easeTime: 1 } }), 120);
    server.system.runTimeout(() => camera.clear(), 140);
}
;
/**
 * * 通用召唤效果的粒子动画部分
 *
 * @param {server.Player} player - 玩家对象
 *
 * @param {server.Vector3} location - 召唤点坐标
 */
function ParticleSummonAnimation(player, location) {
    /**
     * * 定义 粒子参数
     */
    const molang = new server.MolangVariableMap();
    // 构建 动画效果
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
/**
 * * 显示与消耗星尘能
 *
 * @param {server.Block} block - 发起事件的实例对象
 *
 * @param {number} modify - 修改的数值
 *
 * @param {boolean} noShow - 是否不显示悬浮字
 *
 * @param {boolean} create - 是否可以创建新的 星尘能 节点
 *
 * @returns {boolean} - 返回一个布尔值, 表示是否修改成功
 */
function ExpendEnergy(block, modify, noShow, create = false) {
    /**
     * * 获取 星尘能 数值
     */
    const getEnergy = AlterEnergy(block, modify, create);
    /**
     * * 判断是否为耗能
     */
    const direction = modify > 0 ? '§q↑§r' : '§m↓§r';
    // 判断是否修改成功
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
/**
 * * 分析领域属性
 *
 * 根据玩家请求, 分析并展示当前世界的特定领域属性
 *
 * @param {server.Player} player - 发起操作的玩家
 * @param {string} text - 要查询的领域属性类型
 * @param {(option: serverUI.ActionFormResponse) => void} after - 窗口关闭后的回调函数
 */
function ExecuteAnalysisRealm(player, text, after) {
    /**
     * 获取领域属性标识符
     */
    const entry = server.world.getDynamicPropertyIds().filter(node => node.startsWith(`${text}•`)).sort((a, b) => b.length - a.length);
    /**
     * 获取领域属性状态值
     */
    const state = entry.map(node => server.world.getDynamicProperty(node));
    /**
     * 定义窗口界面标题
     */
    const title = { text: "§9<§l " + text + " §r§9>" };
    /**
     * 创建窗口界面表单对象
     */
    const display = new serverUI.ActionFormData().title(title);
    /**
     * 将领域属性坐标映射为区块坐标字符串
     */
    const mapping = (node) => {
        /**
         * 提取坐标信息
         */
        const analysis = node.split(/•/).map(node => Number(node));
        /**
         * 创建区块坐标对象
         */
        const anchor = { x: analysis[2] * 16, y: 0, z: analysis[4] * 16 };
        // 返回区块坐标字符串
        return Vector.toString(anchor);
    };
    // 根据领域属性数量添加按钮
    if (entry.length >= 1)
        entry.forEach((key, index) => display.button('§l§9基准坐标 : §5' + mapping(key) + '\n§9属性值 : §r§u' + state[index]));
    else
        display.button('§4§l未创建§r : §u领域属性§9 -> §r' + text);
    // 显示窗口界面
    display.show(player).then(option => {
        // 检测玩家是否退出窗口
        if (option.canceled || option.selection == undefined)
            return;
        if (entry.length == 0)
            return;
        // 调用回调函数处理后续操作
        after(player, { option, entry, state });
    });
}
;
/**
 * * 修改星尘能量属性
 *
 * 允许玩家通过表单输入修改星尘能量的数值
 *
 * @param {server.Player} player - 发起操作的玩家
 *
 * @param {INTENTION_REALM_AFTER} args - 表单返回的参数
 */
function ExecuteAlterEnergy(player, args) {
    /**
     * 定义表单标题
     */
    const title = { text: "§9《§u§l 调试 - 星尘能量 §9》§r" };
    /**
     * 输入框提示信息
     */
    const text = { text: "请输入新的星尘能量值, 修改需谨慎以避免故障" };
    /**
     * 预填充的文本
     */
    const plan = { text: args.state[args.option.selection ?? 0]?.toString() };
    /**
     * 创建表单对象, 并添加能量值输入框
     */
    const display = new serverUI.ModalFormData().title(title).textField('星尘能量值', text, { 'defaultValue': plan.text });
    // 显示表单
    display.show(player).then(option => {
        if (!option.formValues)
            return;
        /**
         * 新的星尘能量值
         */
        const property = Number(option.formValues[0]) ?? 0;
        // 更新领域属性
        server.world.setDynamicProperty(args.entry[args.option.selection ?? 0], property);
    });
}
;
/**
 * * 分析并调整星尘能量值
 *
 * 根据玩家请求, 对当前世界的星尘能量值进行分析和调整
 *
 * @param {server.Player} player - 发起操作的玩家
 *
 * @returns {server.RawMessage} - 操作结果的反馈消息
 */
function AnalysisAlterEnergy(player) {
    // 权限验证
    if (!isPlayerAuthorized(player))
        return ReplyMessages.power_lack;
    // 调用领域分析函数, 调整能量值
    ExecuteAnalysisRealm(player, 'stardust_energy', ExecuteAlterEnergy);
    // 返回操作成功的提示信息
    return ReplyMessages.realm_energy;
}
;
/**
 * * 显示引导提示
 *
 * @param {server.Player} object - 显示引导提示的玩家对象
 *
 * @param {string} type - 指引类型
 */
function PlayPrompt(object, type) {
    /**
     * * 指引文本
     */
    const intel = prompt.get(type);
    /**
     * * 引导提示开头
     */
    const message = { text: '「 星之引导 」: ' };
    // 检测 指引文本 与 玩家身份
    if (object.hasTag('prompt:' + type) || !intel)
        return;
    // 显示 指引文本
    intel.forEach(info => server.system.runTimeout(() => object.sendMessage([message, info.refer]), info.delay));
    intel.forEach(info => server.system.runTimeout(() => object.playSound('resonate.amethyst_block'), info.delay));
    // 添加识别标签
    object.addTag('prompt:' + type);
}
;
/**
 * * 扩展功能
 */
const scalability = new Map();
scalability.set('调试星尘能量', {
    synopsis: { text: '§c◆§r 允许玩家修改§9星尘能量§r的§2数值§r' },
    ...ReplyMessages.craft_template,
    code: AnalysisAlterEnergy
});
// 在 月华百科的数据库 内 注册 扩展功能
material.push(...scalability);
// 运行 计划表
server.system.runInterval(() => Control.execute());
