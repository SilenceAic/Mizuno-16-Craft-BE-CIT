/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 数学模块
 */
import { Vector } from './maths';
/*
 * 导出模块
 */
export { TrySetPermutation, TrySpawnParticle, TrySpawnItem, TryFillBlocks, TrySpawnEntity, SetFreePointer, TryProcessBlocksInVolume };
/**
 * * 尝试设置一个或多个方块的状态（方块属性）
 *
 * @param {server.Block | server.Block[]} objects - 单个方块或方块数组
 *
 * @param {string} type - 要设置的方块状态名称（如 "minecraft:direction"）
 *
 * @param {string | number | boolean} value - 对应的状态值
 *
 * @returns {Error | void} 如果设置失败返回错误信息，成功则返回 undefined
 */
function TrySetPermutation(objects, type, value) {
    try {
        /**
         * 强制转为数组进行处理
         */
        const blocks = Array.isArray(objects) ? objects : [objects];
        // 遍历数组
        blocks.forEach(block => {
            /**
             * 合并方块状态
             */
            const state = block.permutation.withState(type, value);
            // 设置方块状态
            block.setPermutation(state);
        });
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;
/**
 * 批量处理指定范围内符合条件的方块
 *
 * @param {server.Dimension} dimension - 处理方块的维度
 *
 * @param {server.Vector3} location - 中心位置坐标
 *
 * @param {number} range - 处理范围半径（各轴方向扩展的方块数量）
 *
 * @param {server.BlockFilter} filter - 方块过滤条件对象
 *
 * @param {(block: server.Block) => void} after - 对每个符合条件的方块执行的回调函数
 *
 * @remarks
 * 1. 处理范围以location为中心, 向xyz三个轴正负方向扩展range个方块
 * 2. 会自动创建BlockVolume对象进行批量查询
 * 3. 仅对有效且通过filter验证的方块执行回调
 */
function TryProcessBlocksInVolume(dimension, location, range, filter, after) {
    try {
        /**
         * 批量处理的起点坐标
         */
        const start = Vector.copy(location).add(Vector.CONSTANT_ONE.multiply(range));
        /**
         * 批量处理的终点坐标
         */
        const done = Vector.copy(location).add(Vector.CONSTANT_ONE.multiply(-range));
        /**
         * 批量处理的方块体积对象
         */
        const blockVolume = new server.BlockVolume(start, done);
        /**
         * 批量处理的方块坐标列表
         */
        const locations = [...dimension.getBlocks(blockVolume, filter).getBlockLocationIterator()];
        // 批量处理方块
        locations.forEach(location => {
            /**
             * 获取当前方块对象
             */
            const block = dimension.getBlock(location);
            // 验证方块是否有效 并执行回调
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
/**
 * * 尝试生成 粒子效果
 *
 * @param {string} typeID - 粒子效果的 type_id
 *
 * @param {server.Dimension} dimension - 生成粒子效果的维度
 *
 * @param {server.Vector3} location - 生成粒子效果的位置
 *
 * @param {server.MolangVariableMap} molang - 粒子效果的Molang变量
 *
 * @returns {Error | void} - 如果出现错误, 则返回错误对象, 否则返回 undefined
 */
function TrySpawnParticle(dimension, typeID, location, molang) {
    try {
        dimension.spawnParticle(typeID, location, molang);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;
/**
 * * 尝试生成 掉落物
 *
 * @param {server.Dimension} dimension - 生成 掉落物 的维度
 *
 * @param {string} item - 生成 掉落物 的 物品对象
 *
 * @param {server.Vector3} location - 生成 掉落物 的位置
 *
 * @returns {Error | void} - 如果出现错误, 则返回错误对象, 否则返回 undefined
 */
function TrySpawnItem(dimension, item, location) {
    try {
        return dimension.spawnItem(item, location);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;
/**
 * * 尝试填充 区域
 *
 * @param {server.Dimension} dimension - 填充的维度
 *
 * @param {server.Vector3} start - 填充的起始位置
 *
 * @param {server.Vector3} done - 填充的结束位置
 *
 * @param {string | server.BlockPermutation | server.BlockType} block - 填充的方块
 *
 * @param {server.BlockFillOptions} options - 填充的选项
 *
 * @returns {Error | number} - 如果出现错误, 则返回错误对象, 否则返回 填充的方块数量
 */
function TryFillBlocks(dimension, start, done, block, options) {
    try {
        return dimension.fillBlocks(new server.BlockVolume(start, done), block, options);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;
/**
 * * 尝试生成 实体
 *
 * @param {string} typeID - 实体的 type_id
 *
 * @param {server.Dimension} dimension - 生成实体的维度
 *
 * @param {server.Vector3} location - 生成实体的位置
 *
 * @returns {Error | void} - 如果出现错误, 则返回错误对象, 否则返回 undefined
 */
function TrySpawnEntity(dimension, typeID, location) {
    try {
        return dimension.spawnEntity(typeID, location);
    }
    catch (error) {
        return error instanceof Error ? error : new Error(String(error));
    }
}
;
/**
 * 设置自由指针实体并计算其旋转角度和长度。
 * 该函数用于在指定位置生成一个自由指针实体, 并根据起始点和目标点之间的向量
 * 计算出旋转角度和长度, 最后设置其实体属性。实体将在指定的生命周期结束后自动删除。
 *
 * @param {type.LOCATION_AND_DIMENSION} start - 起始位置及维度信息
 *
 * @param {server.Vector3} done - 目标位置坐标
 *
 * @param {number} [lifetime=1] - 实体的有效时间, 单位为秒。默认值为1
 *
 * @param {string} [caseId='starry_map:execute.free_pointer'] - 实体的案例ID, 用于指定生成的实体类型
 *
 * @returns {void|Error} - 如果生成实体失败, 则返回一个错误对象；否则返回 void
 *
 * @example
 * // 示例用法：
 * const start = { location: new Vector(0, 0, 0), dimension: getDimension('overworld') };
 * const done = new Vector(1, 1, 1);
 * SetFreePointer(start, done, 2);
 *
 * @remarks
 * - 如果 `TrySpawnEntity` 失败, 函数会返回一个错误对象并退出。
 * - 实体的长度属性是通过计算起始点和目标点之间的欧几里得距离乘以8得到的。
 * - 实体的角度属性基于向量的方向进行设置, 分别控制X轴和Y轴的旋转。
 * - 实体将在 `lifetime` 时间后通过 `runTimeout` 自动删除。
 */
function SetFreePointer(start, done, lifetime = 1, caseId = 'starry_map:execute.free_pointer') {
    /**
     * * 计算 向量空间的差向量 并 归一化
     */
    const difference = Vector.difference(done, start.location);
    /**
     * * 计算 实体旋转角度
     */
    const angle = Vector.Vector3ToAngle(difference);
    /**
     * * 计算两个向量之间的距离
     */
    const distance = Vector.distance(start.location, done);
    /**
     * * 尝试生成 自由指针实体
     */
    const entity = TrySpawnEntity(start.dimension, caseId, start.location);
    // 如果两个向量之间的距离为 0, 则直接返回
    //if (distance === 0) return;
    // 如果生成失败, 则返回错误信息
    if (entity instanceof Error)
        return entity;
    // 设置 自由指针的 X轴旋转属性
    entity.setProperty('property:x_axle_rotate', angle.x);
    // 设置 自由指针的 Y轴旋转属性
    entity.setProperty('property:y_axle_rotate', angle.y);
    // 设置 自由指针的长度属性
    entity.setProperty('property:length', distance * 8);
    // 设置 自由指针的 删除时间
    server.system.runTimeout(() => { if (entity && entity.isValid)
        entity.remove(); }, lifetime * 20);
}
;
