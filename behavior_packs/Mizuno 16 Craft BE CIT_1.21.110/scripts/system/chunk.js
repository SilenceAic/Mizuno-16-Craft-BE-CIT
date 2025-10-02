/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 数学模块
 */
import { Vector } from './maths';
/*
 * 计划模块
 */
import { PathExecute } from './plan';
/*
 * 导出模块
 */
export { DisplayChunkBoundary, RealmPropertyName, AlterEnergy, QueryEnergy };
/**
 * * 显示 区块边界
 *
 * @param {type.LOCATION_AND_DIMENSION} source - 用于显示区块边界的 坐标信息与维度信息
 */
function DisplayChunkBoundary(source) {
    /**
     * * 校准 锚点信息
     */
    const anchor = Vector.add(source.location, { x: 0, y: -16, z: 0 });
    /**
     * * 设定 区块显示 起点坐标
     */
    const startPlace = Vector.chunkLocation(anchor, false);
    /**
     * * 设定 区块显示 终点坐标
     */
    const donePlace = Vector.add(startPlace, { x: 16, y: 32, z: 16 });
    // 创建 路径执行计划
    PathExecute.CreateForFrame('显示区块边界', {
        particles: ['constant:prompt_route'],
        locations: [],
        dimension: source.dimension,
        cooldown: 1,
        speed: 1
    }, startPlace, donePlace);
}
;
/**
 * * 获取 区域属性名称
 *
 * @param {server.Entity | server.Player | server.Block} object - 实体或方块
 *
 * @param {string} type - 区域属性类型
 *
 * @param {number} range - 检索范围
 *
 * @returns {string|undefined} - 属性名称
 */
function RealmPropertyName(object, type, range) {
    /**
     * * 节点队列
     */
    const nodeQueue = [];
    // 获取 节点队列
    server.world.getDynamicPropertyIds()
        .filter(node => node.startsWith(`${type}•`))
        .forEach(node => node.split(/•/)[1] == object.dimension.id
        ? nodeQueue.push({ x: JSON.parse(node.split(/•/)[2]), y: 0, z: JSON.parse(node.split(/•/)[4]) })
        : void 0);
    // 如果 节点队列 为空
    if (nodeQueue.length == 0)
        return;
    /**
     * * 节点距离
     */
    const distance = nodeQueue.map(node => Vector.distance(node, { x: Math.floor(object.location.x / 16), y: 0, z: Math.floor(object.location.z / 16) }));
    /**
     * * 最小节点距离
     */
    const minDistance = Math.min(...distance);
    // 如果 范围内 有节点
    if (minDistance <= range) {
        /**
         * * 获取 节点索引
         */
        const index = distance.indexOf(minDistance);
        // 返回 节点属性名称
        return `${type}•${object.dimension.id}•${nodeQueue[index].x}•0•${nodeQueue[index].z}`;
    }
    // 如果 范围内 无节点
    else
        return;
}
;
/**
 * * 查询 与 修改星尘能
 *
 * @param {server.Block | server.Entity | server.Player} object - 发起事件的实例对象
 *
 * @param {number} offset - 修改的数值
 *
 * @param {boolean} create - 是否可以创建新的 星尘能 节点
 *
 * @returns {[boolean, number]} - 返回一个数组, 第一个元素表示是否修改成功, 第二个元素表示修改后的星尘能数量
 */
function AlterEnergy(object, offset, create) {
    /**
     * * 单一逻辑区块的最大星尘能
     */
    const MAX_ENERGY = 10_000_000;
    /**
     * * 当前节点名称
     */
    const current = `stardust_energy•${object.dimension.id}•${Math.floor(object.location.x / 16)}•0•${Math.floor(object.location.z / 16)}`;
    /**
     * * 类型前缀
     */
    const typePrefix = current.split(/•/)[0];
    /**
     * * 区域属性名称
     */
    const realmName = RealmPropertyName(object, typePrefix, 16);
    /**
     * 如果区域属性名称为空
     */
    if (!realmName) {
        // 如果可以创建新的星尘能节点
        if (create) {
            server.world.setDynamicProperty(current, offset);
            // 返回能量修改成功
            return [true, offset];
        }
        // 返回能量修改失败
        return [false, offset];
    }
    /**
     * * 区域属性-能量值
     */
    const rawPrice = server.world.getDynamicProperty(realmName);
    // 如果区域属性-能量值的类型不是数字
    if (typeof rawPrice !== 'number')
        return [false, 0];
    /**
     * 拷贝 区域属性-能量值
     */
    const price = rawPrice;
    /**
     * 计算后的 区域属性-能量值
     */
    const newAmount = price + offset;
    // 如果新的能量值小于等于0
    if (newAmount <= 0) {
        // 如果新的能量值为0, 则删除区域属性
        if (newAmount === 0) {
            server.world.setDynamicProperty(realmName, undefined);
        }
        // 返回能量修改失败
        return [false, 0];
    }
    // 如果新的能量值超出最大容量限制
    if (newAmount >= MAX_ENERGY)
        return [true, price];
    // 在数值正确的前提下设置 区域属性-能量值
    server.world.setDynamicProperty(realmName, newAmount);
    // 返回能量修改成功
    return [true, newAmount];
}
/**
 * * 查询 区域属性 - 能量值
 *
 * @param {server.Block | server.Entity | server.Player} object - 发起事件的实例对象
 *
 * @returns {number} - 返回 区域属性-能量值
 */
function QueryEnergy(object) {
    /**
     * * 当前节点名称
     */
    const current = `stardust_energy•${object.dimension.id}•${Math.floor(object.location.x / 16)}•0•${Math.floor(object.location.z / 16)}`;
    /**
     * * 区域属性名称
     */
    const realmName = RealmPropertyName(object, current.split(/•/)[0], 48);
    // 如果 区域属性名称 为空
    if (!realmName)
        return 0;
    // 返回 区域属性-能量值
    return server.world.getDynamicProperty(realmName);
}
;
