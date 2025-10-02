/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 数学拓展模块
 */
import { Vector } from './maths';
/*
 * 导出模块
 */
export { CreateItemFromStackData, DisplaceItemStack, SetDurability, AlterDurability, DeleteItemStack, ConsumeItemStack, CheckItemHasAmount, OrganizeItemStacks, CheckItemStack, SearchContainers };
/**
 * 根据物品堆栈数据创建一个新的物品实例
 *
 * @param {type.ITEM_STACK_DATA} data - 包含物品类型, 数量, 名称标签, 描述和动态属性的对象
 *
 * @returns {server.ItemStack} 创建的物品实例, 包含了传入数据中的所有属性
 */
function CreateItemFromStackData(data) {
    /**
     * 创建一个新的物品实例, 并设置其类型和数量
     */
    const item = new server.ItemStack(data.type, data.amount);
    // 如果传入了名称标签, 则设置物品的名称标签
    if (data.name)
        item.nameTag = data.name;
    // 如果传入了词缀, 则设置物品的词缀
    if (data.lore)
        item.setLore(data.lore);
    // 如果传入了属性, 则设置物品的属性
    if (data.property)
        [...data.property].forEach(intel => item.setDynamicProperty(...intel));
    // 返回创建好的物品实例
    return item;
}
;
/**
 * * 替换 容器中 物品对象
 *
 * @param {server.Container} container - 要进行 检测 的 容器对象
 *
 * @param {server.ItemStack} proto - 需要替换 的 物品对象
 *
 * @param {server.ItemStack} fresh - 替换后 的 物品对象
 *
 * @param {boolean} omitAmount - 是否忽略数量
 *
 * @returns {server.ItemStack[]} - 检测到的 物品对象集
 */
function DisplaceItemStack(container, proto, fresh, omitAmount) {
    /**
     * * 物品对象集
     */
    const output = [];
    // 遍历 容器中的 物品对象
    for (let index = 0; index < container.size; index++) {
        /**
         * * 获取 物品对象
         */
        const item = container.getItem(index);
        // 排除无效的物品对象
        if (!item || item.typeId != proto.typeId)
            continue;
        if (!omitAmount && proto.amount != item.amount)
            continue;
        if (proto.getLore.toString() != item.getLore.toString())
            continue;
        // 替换 物品对象
        container.setItem(index, fresh);
        // 输出 物品对象
        output.push(item);
    }
    ;
    // 返回 物品对象集
    return output;
}
;
/**
 * * 设置 物品耐久
 *
 * @param {server.Player} source 发起修改 的 玩家
 *
 * @param {server.ItemStack} item 进行修改 的 物品
 *
 * @param {server.Container} container 进行修改 的 物品容器
 *
 * @param {number} slot 进行修改 的 物品槽位
 *
 * @param {number} value 物品耐久 的 偏移量
 */
function SetDurability(source, item, container, slot, value) {
    /**
     * * 获得 修改过耐久 的 新物品
     */
    const newItem = AlterDurability(item, value);
    // 如果耐久不足 则播放耐久耗尽的音效
    if (newItem === undefined)
        source.playSound('random.anvil_break');
    // 更新容器中的物品
    container.setItem(slot, newItem);
}
;
/**
 * * 改变 物品耐久
 *
 * @param {server.ItemStack} item - 物品
 *
 * @param {number} value - 更新的数值
 *
 * @returns {server.ItemStack | undefined} - 返回修改后的 物品
 */
function AlterDurability(item, value) {
    /**
     * * 获取 物品耐久组件
     */
    const getDurability = item.getComponent('minecraft:durability');
    // 判断 物品耐久组件 是否存在
    if (!getDurability)
        return item;
    // 更新 物品耐久
    if (getDurability.damage <= getDurability.maxDurability - value) {
        getDurability.damage += value;
        return item;
    }
    else
        return undefined;
}
;
/**
 * * 删除 容器中 物品对象
 *
 * @param {server.Container} container - 要进行 检测 的 容器对象
 *
 * @param {server.ItemStack} sample - 要进行 检测 的 物品对象集
 *
 * @returns {boolean} - 是否成功
 */
function DeleteItemStack(container, sample) {
    // 遍历 容器中的 物品对象
    for (let index = 0; index < container.size; index++) {
        /**
         * * 获取 物品对象
         */
        const item = container.getItem(index);
        // 排除 无效的 物品对象
        if (!item || item.typeId !== sample.typeId || item.amount < sample.amount)
            continue;
        // 减少 物品堆栈
        ConsumeItemStack(container, index, item, sample.amount);
        // 输出 物品删除成功
        return true;
    }
    ;
    // 输出 物品删除失败
    return false;
}
;
/**
 * * 从容器中消耗指定数量的物品堆叠
 *
 * 检查物品堆叠中的物品数量是否大于要消耗的数量
 *
 * 如果大于, 减少物品堆叠的数量, 并更新容器中的物品堆叠
 *
 * 如果物品堆叠中的物品数量等于或小于要消耗的数量
 *
 * 则将容器中对应槽位的物品堆叠设置为空（即移除该物品堆叠）
 *
 * @param {server.Container} container - 物品所在的容器
 *
 * @param {number} slot - 物品堆叠所在的槽位索引
 *
 * @param {server.ItemStack} item - 要消耗的物品堆叠
 *
 * @param {number} amount - 要消耗的物品数量, 默认为 1
 */
function ConsumeItemStack(container, slot, item, amount = 1) {
    if (item.amount > amount) {
        // 减少物品堆叠的数量
        item.amount -= amount;
        // 更新容器中的物品堆叠
        container.setItem(slot, item);
    }
    else
        container.setItem(slot);
}
;
/**
 * 检查源物品数组是否包含样本数组中所有物品及其所需数量
 *
 * @param source - 源物品数组, 包含物品的类型ID和数量
 *
 * @param samples - 样本物品数组, 包含物品的类型ID和需要检查的数量
 *
 * @returns 如果源物品数组包含样本数组中所有物品及其所需数量, 则返回true, 否则返回false
 */
function CheckItemHasAmount(source, samples) {
    /**
     * 样本数据集, 使用 Map 存储, 键为物品类型ID, 值为物品数量
     */
    const samplesInfo = new Map(samples.map(item => [item.typeId, item.amount]));
    /**
     * 容器物品数据集, 使用Map存储, 键为物品类型ID, 值为物品数量
     */
    const sourceInfo = new Map(source.map(item => [item.typeId, item.amount]));
    // 遍历样本数据集, 检查每个样本物品是否存在于源物品数据集中, 并且源物品的数量是否大于或等于样本物品的数量
    return [...samplesInfo].every(item => sourceInfo.has(item[0]) && (sourceInfo.get(item[0]) ?? 0 >= item[1]));
}
;
/**
 * * 对物品堆栈进行排序和分组
 *
 * * 将物品堆栈按类型标识符进行分组, 并在每个组内按数量进行排序
 *
 * * 最后将所有分组合并为一个排序后的数组
 *
 * @param {server.ItemStack[]} items - 需要排序和分组的物品堆栈数组
 *
 * @returns {server.ItemStack[]} - 返回排序和分组后的物品堆栈数组
 */
function OrganizeItemStacks(items) {
    /**
     * * 创建一个 Map 来保存按 typeId 分组的物品
     */
    const groupedItems = new Map();
    // 遍历 items 数组, 将具有相同 typeId 的项目归类到一起
    items.forEach(item => {
        /**
         * * 获取物品的 typeId
         */
        const typeId = item.typeId;
        // 如果 groupedItems 中还没有该 typeId 对应的数组, 则创建一个新数组并添加到 groupedItems 中
        if (!groupedItems.has(typeId))
            groupedItems.set(typeId, [item]);
        // 否则, 将该项目添加到对应 typeId 的数组中
        else
            groupedItems.get(typeId)?.push(item);
    });
    /**
     * 将 groupedItems 中的项目根据 typeId 的某个部分长度进行排序
     *
     * 并将每个 typeId 对应的项目数组根据 amount 进行排序
     *
     * 然后将所有的项目数组合并成一个数组
     */
    const sortedItems = [...groupedItems]
        // 根据 typeId 的第一个部分的长度进行排序, 确保按照特定的顺序处理项目
        .sort((a, b) => a[0].split(':')[0].length - b[0].split(':')[0].length)
        // 根据 typeId 的首字母排序
        .sort((a, b) => a[0].split(':')[0].localeCompare(b[0].split(':')[0]))
        // 将每个 typeId 对应的项目数组提取出来, 并根据项目的 amount 进行排序
        .map(x => x[1].sort((a, b) => a.amount - b.amount))
        // 将所有的项目数组合并成一个大的数组
        .flatMap(x => x);
    // 返回排序后的项目数组
    return sortedItems;
}
;
/**
 * 检测容器中是否包含足够的物品来满足给定样本中的需求。
 *
 * @param {server.Container} container - 要进行检测的容器对象。
 *
 * @param {server.ItemStack[]} samples - 包含需要检测的物品及其所需数量的数组。
 *
 * @returns {boolean} - 如果容器中的物品满足所有样本需求, 返回 true；否则返回 false。
 */
function CheckItemStack(container, samples) {
    /**
     * 合并样本中相同类型 (typeId) 的需求数量
     */
    const types = new Map();
    // 遍历样本数组
    for (const sample of samples) {
        /**
         * 获取当前样本类型可能已经记录的数量
         */
        const existingAmount = types.get(sample.typeId) || 0;
        // 更新记录的数量
        types.set(sample.typeId, existingAmount + sample.amount);
    }
    ;
    /**
     * 累加容器中相同类型 (typeId) 的实际数量
     */
    const items = new Map();
    // 遍历容器中的每个槽位
    for (let index = 0; index < container.size; index++) {
        /**
         * * 获取容器中当前槽位的物品对象
         */
        const item = container.getItem(index);
        // 如果当前槽位为空, 则跳过当前迭代
        if (!item)
            continue;
        /**
         * 获取当前物品类型可能已经记录的数量
         */
        const currentAmount = items.get(item.typeId) || 0;
        // 更新记录的数量
        items.set(item.typeId, currentAmount + item.amount);
    }
    ;
    // 检查容器中的每个物品类型是否满足样本需求
    return [...types].every(([typeId, requiredAmount]) => (items.get(typeId) || 0) >= requiredAmount);
}
;
/**
 * 搜索周围的方块, 查找符合条件的容器。
 *
 * @param {server.Block} anchor - 搜索起始点的方块对象。
 *
 * @param {server.ItemStack}[input] - 可选参数, 表示要存放的物品。用于校验目标容器是否能容纳该物品。
 *
 * @param {number} [scope=5] - 搜索范围, 默认为 5个方块内的距离。
 *
 * @returns {[server.Container, server.Block][]} 返回符合条件的容器和对应方块的结果数组。
 */
function SearchContainers(anchor, input, scope = 5) {
    /**
     * 存储找到的容器
     */
    const containers = [];
    // 遍历周围的方块容器
    for (const vector of Vector.createCubeLattice(scope)) {
        /**
         * 获取偏移位置的方块
         */
        const block = anchor.offset(vector);
        /**
         * * 获取指定坐标处的容器
         */
        const container = block?.getComponent('inventory')?.container;
        // 判断是否指定了目标物品
        if (input !== undefined) {
            /**
             * 用于校验容器的模板物品
             */
            const samples = new server.ItemStack(input.typeId);
            // 如果容器不存在或没有空槽, 则跳过该容器
            if (!container || !CheckItemStack(container, [samples]) || container.emptySlotsCount <= 1)
                continue;
        }
        else if (!container || container.emptySlotsCount <= 1)
            continue;
        // 将找到的容器添加到containers数组中
        containers.push([container, block]);
    }
    return containers;
}
;
