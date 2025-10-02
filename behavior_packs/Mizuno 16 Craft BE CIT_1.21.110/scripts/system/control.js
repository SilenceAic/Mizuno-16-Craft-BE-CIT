/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 数学模块
 */
import { Vector, Clamp } from './maths';
/*
 * 导出模块
 */
export { TriggerControl, ObtainWaitTime };
/**
 * 触发控制组, 用于存储事件类型与触发时间的映射
 *
 * @type {Map<string, number>}
 */
const ControlGroup = new Map();
/**
 * 获取来源对象的唯一标识符
 *
 * 如果来源是实体, 则返回实体的 ID
 *
 * 如果来源是方块, 则返回方块所在维度和位置的组合字符串
 *
 * @param {server.Entity | server.Block} [source] - 来源对象, 可以是实体或方块
 *
 * @returns {string} - 来源对象的唯一标识符
 */
function getUniqueIdentifier(source) {
    // 如果来源是实体, 则返回实体的 ID
    if (source instanceof server.Entity)
        return source.id;
    // 如果来源是方块, 则返回方块所在维度和位置的组合字符串
    else if (source instanceof server.Block) {
        /**
         * * 维度标识符信息
         *
         * @type {string[]}
         */
        const dimension = source.dimension.id.split(/:/);
        // 获取 方块位置与维度信息字符串
        return `${dimension[0]}.${Vector.toString(source)}.${dimension[1]}`;
    }
    // 如果来源是向量, 则返回向量字符串
    else if (source instanceof Vector)
        return source.toString();
    // 抛出错误
    throw new Error("不支持的源类型 -> 您应该指定实体或方块作为参数");
}
;
/**
 * 创建触发控制, 用于管理特定事件类型的触发频率
 *
 * 根据给定的事件类型、来源（实体或方块）和等待时间,
 *
 * 判断是否允许触发事件
 *
 * @param {string} [eventType] - 事件类型字符串
 *
 * @param {server.Entity | server.Block | Vector} [source] - 触发事件的来源, 可以是 实体 或 方块 或 Vector 对象
 *
 * @param {number} [waitTime] - 触发事件前的等待时间（游戏刻数）
 *
 * @returns {boolean} - 如果可以触发事件则返回 true, 否则返回 false
 */
function TriggerControl(eventType, source, waitTime = 20) {
    /**
     * 触发的事件的唯一标识符键
     *
     * @type {string}
     */
    const key = `${eventType}:${getUniqueIdentifier(source)}`;
    /**
     * 获取控制组中已存在的触发时间
     *
     * @type {number | undefined}
     */
    const existingTriggerTime = ControlGroup.get(key);
    /*
     * 如果不存在触发时间或当前游戏刻数大于等于触发时间
     *
     * 设置新的触发时间并返回 true
     */
    if (existingTriggerTime === undefined || server.system.currentTick >= existingTriggerTime) {
        ControlGroup.set(key, server.system.currentTick + waitTime);
        return true;
    }
    // 否则返回 false
    return false;
}
;
/**
 * 获取指定事件类型和来源的等待时间
 *
 * 如果事件类型和来源已经存在于触发控制组中, 则返回当前等待时间
 *
 * 否则, 返回默认的等待时间（ 通常为 0 ）
 *
 * @param {string} [eventType] - 事件类型
 *
 * @param {server.Entity | server.Block} [source] - 事件来源, 可以是实体或方块
 *
 * @returns {number} - 返回剩余的等待时间
 */
function ObtainWaitTime(eventType, source) {
    /**
     * 获取 来源对象的唯一标识符
     */
    const key = `${eventType}:${getUniqueIdentifier(source)}`;
    /**
     * 查找 ControlGroup 中类型匹配且标识符相同的项, 并返回其等待时间
     */
    const existingTriggerTime = ControlGroup.get(key) ?? 0;
    // 返回 剩余等待时间
    return Clamp({ max: Number.MAX_SAFE_INTEGER, min: 0 }, existingTriggerTime - server.system.currentTick);
}
;
