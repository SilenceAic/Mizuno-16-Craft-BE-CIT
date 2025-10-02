/*
 * 原版接口
 */
import * as server from "@minecraft/server";
import * as debug from "@minecraft/debug-utilities";
/*
 * 系统数据
 */
import { can_display_logs, message_notify, rune_color } from "../data/table";
/*
 * 常用翻译模块
 */
import { translate } from './translate';
/*
 * 实例创建模块
 */
import { TrySpawnParticle } from './create';
/*
 * 触发控制模块
 */
import { TriggerControl } from './control';
/*
 * 数学拓展模块
 */
import { Vector, RandomFloor, Clamp } from './maths';
/*
 * 导出模块
 */
export { GetTargetIntel, DistanceAndName, ThrowErrorIfPermitted, IntelMessage, DisplayFloatingText, AlterMessageNotify, ErrorMessage, NumberParticleDisplay };
/**
 * * 编写 实体翻译 与 距离信息 文本组件
 *
 * @param {server.Entity} entity - 实体
 *
 * @param {number} distance - 距离
 *
 * @returns {server.RawMessage} - 返回 实体翻译 与 距离信息 文本组件
 */
function DistanceAndName(entity, distance) {
    return {
        rawtext: [
            { text: '§l' }, translate(entity), { text: `\n§9距离: §5${distance}` }
        ]
    };
}
;
/**
 * * 根据日志权限决定是否抛出错误
 *
 * * 此函数用于在允许显示日志的情况下抛出一个带有原因的错误
 *
 * * 在开发或特定环境下提供更详细的错误信息, 而在生产或限制日志输出的环境下保持静默
 *
 * @param {string} [message] 错误信息, 描述发生了什么问题
 *
 * @param {string} [cause] 错误的原因, 提供额外的上下文信息
 */
function ThrowErrorIfPermitted(message, cause) {
    // 检查是否有权限显示日志, 如果没有则直接返回, 不执行后续操作
    if (!can_display_logs)
        return;
    // 抛出一个带有原因的错误
    throw new Error(message, { cause: cause });
}
;
/**
 * * 使用 小标题 的 形式 向 玩家 显示特定信息
 *
 * @param {server.Block | server.Entity | server.Player} object 播报 信息 的 实例对象
 *
 * @param {number} range 信息 的 广播范围
 *
 * @param {string} text 信息 的 文本类型
 */
function IntelMessage(object, range, text) {
    /**
     * * 设置广播范围
     */
    const setOptions = {
        location: object.location,
        maxDistance: range
    };
    /**
     * * 获取玩家队列
     */
    const getPlayers = object.dimension.getPlayers(setOptions);
    //遍历玩家队列 播放文本信息
    getPlayers.forEach(info => info.onScreenDisplay.setActionBar(text));
}
;
/**
 * * 悬浮字信息集合
 */
const textCaseMap = new Map();
/**
 * * 显示悬浮字信息
 *
 * @param {server.Block} block - 显示悬浮字信息的方块
 *
 * @param {string} text - 悬浮字信息的文本
 */
function DisplayFloatingText(block, text) {
    /*
    const typeId = 'starry_map:execute.name_display';
    block.dimension.getEntitiesAtBlockLocation(block.center()).filter(entity => entity.typeId === typeId).forEach(entity => entity.remove());
    const entity = TrySpawnEntity(block.dimension, typeId, block.bottomCenter());
    if (entity instanceof server.Entity) entity.nameTag = text || '未知';
    */
    /**
     * 悬浮字标识符
     */
    const identifier = block.dimension.id + Vector.copy(block).toString();
    /**
     * 获取 旧的悬浮字信息
     */
    const oldTextCase = textCaseMap.get(identifier);
    // 移除 旧的悬浮字信息
    if (oldTextCase)
        debug.debugDrawer.removeShape(oldTextCase);
    /**
     * * 创建 DebugText 实例
     */
    const textCase = new debug.DebugText(block.above(2)?.bottomCenter() || block.center(), text || '未知');
    // 设置 显示时间
    textCase.timeLeft = Clamp({ min: 100, max: 2000 }, text.length * 20);
    // 生成悬浮字信息
    debug.debugDrawer.addShape(textCase);
    // 添加 悬浮字信息 到 集合中
    textCaseMap.set(identifier, textCase);
}
;
/**
 * * 修改通知消息
 *
 * @param {string} title - 消息通知 的 标题
 *
 * @param {server.Block | server.Entity | server.Player}  block - 消息通知 的 发信源
 *
 * @param {server.RawMessage} message - 消息通知 的 文本内容
 */
function AlterMessageNotify(title, block, message) {
    /**
     * * 编写 发信源信息
     */
    const rawMessage = {
        rawtext: [
            { text: '| §l§p' + block.dimension.id + '§r | §a' + Vector.toString(block.location) + '§r |\n\n' },
            message
        ]
    };
    // 将当前区块的 消息通知 写入 数据库
    message_notify.set(title, rawMessage);
    // 如果是简单的信息 则 显示悬浮字信息
    if (!message.rawtext)
        DisplayFloatingText(block, message.text ?? '未知');
}
;
/**
 * * 处理错误信息
 *
 * @param {string} title - 错误信息 的 标题
 *
 * @param {server.Block | server.Entity | server.Player}  block - 错误信息 的 发信源
 *
 * @param {server.RawMessage} message - 错误信息 的 文本内容
 */
function ErrorMessage(title, block, message) {
    /**
     * * 定义 令牌类型
     */
    const type = 'error -> ' + block.typeId;
    /**
     * * 获取令牌
     */
    const token = TriggerControl(type, block, 40);
    if (!token)
        return;
    /**
     * * 定义 粒子参数
     */
    const molang = new server.MolangVariableMap();
    // 设置 粒子参数
    molang.setFloat('variable.direction', RandomFloor(0, 2));
    molang.setFloat('variable.size', 3);
    // 显示 发生错误情况 的 粒子效果
    TrySpawnParticle(block.dimension, 'scripts:path_star4_large', block.center(), molang);
    // 发送 发生错误情况 的 消息通知
    AlterMessageNotify(title, block, message);
}
;
/**
 * * 显示数值粒子效果
 *
 * @param {type.LOCATION_AND_DIMENSION} anchor - 坐标与维度
 *
 * @param {number} numberToDisplay - 显示的数值
 *
 * @param {server.Vector3} offset - 偏移量
 */
function NumberParticleDisplay(anchor, numberToDisplay, offset) {
    // 判断 数值 是否过大
    if (numberToDisplay > 99999)
        return;
    /**
     * * 粒子参数
     */
    const molang = new server.MolangVariableMap();
    /**
     * * 粒子颜色
     */
    const particleColors = [...rune_color.values()];
    /**
     * * 粒子数值
     */
    const numberDigits = Math.floor(numberToDisplay).toString().split('').reverse().map(value => parseInt(value, 10));
    /**
     * * 随机色彩索引
     */
    const randomColorIndex = RandomFloor(0, particleColors.length - 3);
    // 设置 粒子属性
    molang.setVector3('variable.offset', Vector.random(offset, 0.5));
    molang.setColorRGB('variable.color', particleColors[randomColorIndex]);
    // 显示 数值粒子效果
    numberDigits.forEach((value, index) => {
        molang.setVector3('variable.property', { x: value, y: index, z: numberDigits.length });
        TrySpawnParticle(anchor.dimension, 'scripts:setting.number_display', anchor.location, molang);
    });
}
;
/**
 * * 返回 选中目标 的 信息
 *
 * @param {server.Entity | server.Player} object - 执行 目标选择 的 实体单位
 *
 * @returns {server.RawMessage[]} 状态信息
 */
function GetTargetIntel(object) {
    /**
     * * 获取 实体对象
     */
    const entity = object.getEntitiesFromViewDirection()[0]?.entity;
    /**
     * * 获取 方块对象
     */
    const block = object.getBlockFromViewDirection()?.block;
    /**
     * * 适配游戏的信息格式
     */
    const message = [];
    // 检测实体是否存在
    if (entity && entity.isValid) {
        // 确认实体是否为物品
        if (entity.typeId != 'minecraft:item')
            return GetEntityIntel(entity, message);
        /**
         * * 获取 物品对象
         */
        const item = entity.getComponent('minecraft:item')?.itemStack;
        // 确认 物品是否存在
        if (!item)
            return [{ text: '§4 未知物品 §r' }];
        // 获取 物品信息
        return GetItemStackIntel(item, message);
    }
    // 检测方块是否存在
    else if (block && block.isValid)
        return GetBlockIntel(block, message);
    // 确认 目标是否为空
    return [{ text: '§4 未知目标 §r' }];
}
;
/**
 * * 返回 目标标签 的 排列结果
 *
 * @param object - 输入的 目标对象
 *
 * @returns {server.RawMessage[]} - 返回的排列结果
 */
function GetTargetTags(object) {
    return object.getTags().map(info => { return { text: info + '\n' }; });
}
;
/**
 * * 返回 方块状态对象的排列结果
 *
 * @param {Record<string, boolean | number | string>} states - 输入的方块状态对象
 *
 * @returns {server.RawMessage[]} - 返回的排列结果
 */
function GetBlockRecord(states) {
    // 设定 各项参数
    let [output, name, value] = [[], [], []];
    // 解析 方块排列 信息
    for (let index in states) {
        value.push(states[index]);
        name.push(index);
    }
    ;
    for (let α = 0; α < name.length; α++) {
        output.push({ text: `§r§l<§r§5 ${name[α]} §7:§2 ${value[α]} §r§l>§r\n` });
    }
    ;
    //返回 方块排列 信息
    return output;
}
;
/**
 * * 返回 容器对象的排列结果
 *
 * @param {server.Container | undefined} container - 输入的容器对象
 *
 * @param {server.RawMessage[]} message - 输入的排列信息
 */
function GetInventoryIntel(container, message) {
    // 遍历 库存容器
    if (container)
        for (let index = 0; index < container.size; index++) {
            /**
             * * 容器物品
             */
            const item = container.getItem(index);
            if (!item)
                continue;
            message.push(translate(item), { text: `§r : §2${item.amount}§r\n` });
        }
    ;
}
;
/**
 * * 返回 物品对象的排列结果
 *
 * @param {server.ItemStack} item - 输入的物品对象
 *
 * @param {server.RawMessage[]} message - 输入的排列信息
 *
 * @returns {server.RawMessage[]} - 返回的排列结果
 */
function GetItemStackIntel(item, message) {
    /**
     * * 获取 物品耐久
     */
    const durability = item.getComponent('minecraft:durability');
    /**
     * * 设定基础文本
     */
    const info = [
        { text: '§5§o§l[§9 物品 §5]§r : ' },
        translate(item),
        { text: ' → ' },
        { text: item.typeId },
        { text: `\n\n§5§o§l[§9 数量 §5]§r : ${item.amount}` },
        { text: `\n\n§5§o§l[§9 耐久 §5]§r : ${durability?.damage ?? 0}/${durability?.maxDurability ?? 0}` },
        { text: '\n\n§5§o§l[§9 标签 §5]§r :\n' }
    ];
    //写入信息文本
    message.push(...info, ...GetTargetTags(item));
    // 输出文本信息
    return message;
}
;
/**
 * * 返回 实体对象的排列结果
 *
 * @param {server.Entity} entity - 输入的实体对象
 *
 * @param {server.RawMessage[]} message - 输入的排列信息
 *
 * @returns {server.RawMessage[]} - 返回的排列结果
 */
function GetEntityIntel(entity, message) {
    /**
     * * 获取 实体血量
     */
    const getHealth = entity.getComponent('minecraft:health');
    /**
     * * 获取 基础移速
     */
    const getBasisSpeed = entity.getComponent('minecraft:movement');
    /**
     * * 获取 栓绳组件
     */
    const getisTether = entity.getComponent('minecraft:leashable');
    /**
     * * 获取 驯服组件
     */
    const getTameable = entity.getComponent('minecraft:tameable');
    /**
     * * 获取 熔岩移速
     */
    const getMagmaSpeed = entity.getComponent('minecraft:lava_movement');
    /**
     * * 获取 水下移速
     */
    const getWaterSpeed = entity.getComponent('minecraft:underwater_movement');
    /**
     * * 获取 全部组件标识
     */
    const getAllComponentsID = entity.getComponents().map(info => [{ text: info.typeId + '\n' }][0]);
    /**
     * * 获取 驯服材料列表
     */
    const getTameItems = getTameable ? getTameable.getTameItems.map(info => { return { rawtext: [{ text: '\n' }, translate(info)] }; }) : [{ text: '\n' }];
    /**
     * * 设定基础文本
     */
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
    /**
     * * 实体背包
     */
    const container = entity.getComponent('inventory')?.container;
    /**
     * * 背包库存
     */
    const inventory = [{ text: '§5§o§l[§9 背包 §5]§r :\n' }];
    // 遍历 实体背包
    GetInventoryIntel(container, inventory);
    //写入信息文本
    message.push(...info, ...getTameItems, { text: '\n§5§o§l[§9 标签 §5]§r :\n' }, ...GetTargetTags(entity), { text: '\n§5§o§l[§9 组件 §5]§r:\n' }, ...getAllComponentsID, ...inventory);
    // 返回信息文本
    return message;
}
;
/**
 * * 返回 方块对象的排列结果
 *
 * @param block - 输入的方块对象
 *
 * @param {server.RawMessage[]} message - 输入的排列信息
 *
 * @returns {server.RawMessage[]} - 返回的排列结果
 */
function GetBlockIntel(block, message) {
    /**
     * * 获取方块状态
     */
    const states = block.permutation.getAllStates();
    /**
     * * 设定基础文本
     */
    const info = [
        { text: '§5§o§l[§9 方块 §5]§r : ' },
        translate(block),
        { text: ' → ' },
        { text: block.typeId },
        { text: `\n\n§5§o§l[§9 红石能量 §5]§r : §4${block.getRedstonePower() ?? 0}§r` },
        { text: '\n\n§5§o§l[§9 方块状态 §5]§r :\n' },
    ];
    /**
     * * 方块容器
     */
    const container = block.getComponent('inventory')?.container;
    /**
     * * 容器库存
     */
    const inventory = [{ text: '\n§5§o§l[§9 方块容器 §5]§r :\n' }];
    // 遍历方块容器
    GetInventoryIntel(container, inventory);
    // 写入信息文本
    message.push(...info, ...GetBlockRecord(states), { text: '\n§5§o§l[§9 方块标签 §5]§r :\n' }, ...GetTargetTags(block), ...inventory);
    // 输出文本信息
    return message;
}
;
