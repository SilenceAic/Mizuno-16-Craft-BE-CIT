/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 系统数据
 */
import * as table from "../data/table";
/*
 * 数学模块
 */
import { Vector } from './maths';
/*
 * 设置模块
 */
import { TrySpawnItem, TrySpawnEntity } from './create';
/*
 * 导出模块
 */
export { UnloadInventoryAndPackageInPlace, UnloadInventoryAndDestroy, UnloadInventoryAndPackage, SummonEntityWithData };
/**
 * * 卸载 实体背包库存后 封装为 特定物品
 *
 * @param {server.Entity} target - 进行封装的目标对象
 *
 * @param {server.Player} player - 发起封装的玩家对象
 *
 * @param {server.ItemStack} material - 封装材料
 *
 * @param {string} itemName - 封装物品名称
 *
 * @param {string[]} itemLore - 封装物品词缀
 */
function UnloadInventoryAndPackage(target, player, material, itemName, itemLore) {
    // 检测 目标对象 是否为玩家
    if (target instanceof server.Player)
        return;
    /**
     * * 获取 实体背包
     */
    const container = target.getComponent('inventory')?.container;
    /**
     * * 获取 实体背包库存
     */
    const items = [];
    /**
     * * 获取 实体 的 动态属性类型数组
     */
    const types = target.getDynamicPropertyIds();
    /**
     * * 获取 实体 的 标签数组
     */
    const tags = target.getTags();
    /**
     * * 复制实体坐标
     */
    const anchor = Vector.copy(target.location);
    /**
     * * 获取 实体名称
     */
    const nameTag = target.nameTag.length >= 1 ? target.nameTag : table.name_mapping.get(target.typeId);
    // 无视大小写 根据首字母进行排序
    types.sort((a, b) => a[0].toLowerCase().charCodeAt(0) - b[0].toLowerCase().charCodeAt(0));
    // 清空 目标背包 并缓存 全部物品信息
    if (container)
        for (let index = 0; index < container.size; index++) {
            /**
             * * 背包物品
             */
            const item = container.getItem(index);
            if (!item)
                continue;
            items.push(item);
            container.setItem(index);
        }
    ;
    // 设置 物品动态属性
    types.forEach(type => material.setDynamicProperty(type, target.getDynamicProperty(type)));
    material.setDynamicProperty('reduction_pureness:tags', JSON.stringify(tags));
    material.setDynamicProperty('reduction_pureness:name', target.nameTag);
    material.setDynamicProperty('reduction_pureness:type', target.typeId);
    // 设置 物品名称
    material.nameTag = itemName + nameTag + '§r';
    // 设置 物品词缀
    material.setLore(itemLore);
    // 给与玩家物品
    server.system.runTimeout(() => { TrySpawnItem(player.dimension, material, player.getHeadLocation()); }, 10);
    // 释放背包物品
    server.system.runTimeout(() => { items.forEach(item => TrySpawnItem(player.dimension, item, anchor)); }, 10);
    // 销毁目标实体
    target.remove();
}
;
/**
 * * 卸载 实体背包库存后 封装为 特定物品 且留在原地
 *
 * @param {server.Entity} target - 进行封装的目标对象
 *
 * @param {server.ItemStack} material - 封装材料
 *
 * @param {string} itemName - 封装物品名称
 *
 * @param {string[]} itemLore - 封装物品词缀
 */
function UnloadInventoryAndPackageInPlace(target, material, itemName, itemLore) {
    // 检测 目标对象 是否为玩家
    if (target instanceof server.Player)
        return;
    /**
     * * 获取 实体背包
     */
    const container = target.getComponent('inventory')?.container;
    /**
     * * 获取 实体背包库存
     */
    const items = [];
    /**
     * * 获取 实体 的 动态属性类型数组
     */
    const types = target.getDynamicPropertyIds();
    /**
     * * 获取 实体 的 标签数组
     */
    const tags = target.getTags();
    /**
     * * 复制 实体坐标
     */
    const copyLocation = Vector.copy(target.location);
    /**
     * * 获取 实体所在维度
     */
    const copyDimension = target.dimension;
    /**
     * * 获取 实体名称
     */
    const nameTag = target.nameTag.length >= 1 ? target.nameTag : table.name_mapping.get(target.typeId);
    // 无视大小写 根据首字母进行排序
    types.sort((a, b) => a[0].toLowerCase().charCodeAt(0) - b[0].toLowerCase().charCodeAt(0));
    // 清空 目标背包 并缓存 全部物品信息
    if (container)
        for (let index = 0; index < container.size; index++) {
            /**
             * * 背包物品
             */
            const item = container.getItem(index);
            if (!item)
                continue;
            items.push(item);
            container.setItem(index);
        }
    ;
    // 设置 物品动态属性
    types.forEach(type => material.setDynamicProperty(type, target.getDynamicProperty(type)));
    material.setDynamicProperty('reduction_pureness:tags', JSON.stringify(tags));
    material.setDynamicProperty('reduction_pureness:name', target.nameTag);
    material.setDynamicProperty('reduction_pureness:type', target.typeId);
    // 设置 物品名称
    material.nameTag = itemName + nameTag + '§r';
    // 设置 物品词缀
    material.setLore(itemLore);
    // 释放背包物品
    server.system.runTimeout(() => { items.forEach(item => TrySpawnItem(copyDimension, item, copyLocation)); }, 10);
    // 给与玩家物品
    server.system.runTimeout(() => { TrySpawnItem(copyDimension, material, copyLocation); }, 10);
    // 销毁目标实体
    target.remove();
}
;
/**
 * * 卸载 实体背包库存后 销毁实体
 *
 * @param {server.Entity} target - 进行卸载的目标实体
 */
async function UnloadInventoryAndDestroy(target) {
    // 延迟执行, 避免触发器冲突
    await server.system.waitTicks(0);
    /**
     * * 获取 实体背包
     */
    const container = target.getComponent('inventory')?.container;
    /**
     * * 获取 实体背包库存
     */
    const items = [];
    /**
     * * 复制实体坐标
     */
    const location = Vector.copy(target.location);
    /**
     * * 复制实体维度
     */
    const dimension = server.world.getDimension(target.dimension.id);
    // 清空 目标背包 并缓存 全部物品信息
    if (container)
        for (let index = 0; index < container.size; index++) {
            /**
             * * 背包物品
             */
            const item = container.getItem(index);
            if (!item)
                continue;
            items.push(item);
            container.setItem(index);
        }
    ;
    // 释放背包物品
    server.system.runTimeout(() => { items.forEach(item => TrySpawnItem(dimension, item, location)); }, 10);
    // 销毁目标实体
    target.remove();
}
;
/**
 * * 召唤一个带有附加数据的实体
 *
 * @param {server.Player} player - 执行召唤事件的玩家
 *
 * @param {server.Container} container - 玩家的背包容器
 *
 * @param {string} type - 召唤的实体类型
 */
function SummonEntityWithData(player, container, type) {
    /**
     * * 玩家手持的物品
     */
    const item = container?.getItem(player.selectedSlotIndex);
    /**
     * * 玩家指向的方块
     */
    const block = player.getBlockFromViewDirection({ maxDistance: 16 })?.block;
    /**
     * * 实体动态属性
     */
    const propertyID = item?.getDynamicPropertyIds().filter(type => !type.startsWith('reduction_pureness:'));
    /**
     * * 被记录的实体名称
     */
    const nameTag = item?.getDynamicProperty('reduction_pureness:name');
    /**
     * * 获取 标签组
     */
    const tags = item?.getDynamicProperty('reduction_pureness:tags');
    /**
     * * 物品记录的实体
     */
    const entity = TrySpawnEntity(player.dimension, type, block?.center() ?? player.location);
    // 判断 实体是否存在
    if (entity instanceof Error)
        return player.sendMessage(`§l§4<§c 召唤失败 §4>§r: ${entity.message}`);
    // 播放 音效
    player.playSound('conduit.deactivate');
    // 绑定玩家
    server.system.run(() => entity.getComponent('tameable')?.tame(player));
    // 消耗物品
    server.system.run(() => container.setItem(player.selectedSlotIndex));
    // 判断 物品 与 属性 是否存在
    if (!item || !propertyID)
        return;
    // 注入属性
    server.system.runTimeout(() => propertyID.forEach(id => entity.setDynamicProperty(id, item.getDynamicProperty(id))), 20);
    // 判断 实体名称是否存在
    if (!nameTag)
        return;
    // 注入名称
    server.system.runTimeout(() => entity.nameTag = nameTag, 15);
    // 判断 实体名称是否存在
    if (!tags)
        return;
    // 添加实体标签
    JSON.parse(tags).forEach(tag => entity.addTag(tag));
}
;
