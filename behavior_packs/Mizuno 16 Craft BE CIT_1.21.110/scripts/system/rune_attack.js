/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 系统数据
 */
import * as table from "../data/table";
import * as type from "../data/type";
/*
 * 设置模块
 */
import { TrySpawnParticle } from './create';
/*
 * 数学模块
 */
import { RandomFloat, Vector, IsEnable, Clamp } from './maths';
/*
 * 计划模块
 */
import { Template } from './plan';
/*
 * 控制模块
 */
import { TriggerControl } from './control';
/*
 * 导出模块
 */
export { RandomRune, CreateProperty, SetProperty, AlterProperty, MergeProperty, GetProperty, CreateEmptyProperty, ElementalAttack, IsErupt, BackoffByDistance };
/**
 * * 实体数据 - 符文融合
 */
const rune_fusion = new Map([
    // * 流沙
    [10010, { double: 2, event: quicksand }],
    // * 共鸣
    [110000, { double: 1.5, event: resonance }],
    // * 生长
    [11000, { double: 2, event: produce }],
    // * 结晶
    [10100, { double: 2, event: crystal }],
    // * 蒸发
    [110, { double: 2, event: vapor }],
    // * 感电
    [100010, { double: 1.5, event: electric }],
    // * 超载
    [100100, { double: 1.5, event: overload }],
    // * 若水
    [1000010, { double: 2, event: like_water }],
    // * 律令
    [1010000, { double: 2, event: directive }],
    // * 绽放
    [1010, { double: 1.5, event: blossom }],
    // * 激化
    [101000, { double: 5, event: sharpen }],
    // * 燃烧
    [1100, { double: 3, event: flame }],
    // * 归零
    [10010000, { double: 5, event: zero }],
    // * 余烬
    [10000100, { double: 2, event: embers }],
    // * 雷鸣
    [1100000, { double: 2, event: thunderous }],
    // * 辉光
    [1000100, { double: 2, event: brilliance }],
    // * 催化
    [1001000, { double: 2, event: catalysis }],
    // * 枯萎
    [10001000, { double: 5, event: withered }],
    // * 潮汐
    [10000010, { double: 2, event: tides }],
    // * 绝缘
    [10001000, { double: 2, event: insulation }],
    // * 偏振
    [10010000, { double: 1.5, event: polarity }],
]);
/**
 * * 符文依附于目标实体
 */
class RuneClingEntity extends Template {
    /**
     * * 缓存 符文令牌
     */
    static tokenGroup = [];
    /**
     * * 检查 事件令牌 是否可用
     *
     * @param {server.Entity} source 申请 执行操作 的 实体
     *
     * @returns {boolean} 是否已经拥有符文令牌
     */
    static CreateToken(source) {
        /**
         * * 检查 令牌 是否存在
         */
        const test = RuneClingEntity.tokenGroup.filter(token => token.id === source.id).length;
        // 如果 令牌 不存在 则 创建令牌
        if (test === 0)
            RuneClingEntity.tokenGroup.push({ id: source.id, wait: 100 });
        // 否则 更新 令牌
        else {
            RuneClingEntity.tokenGroup = RuneClingEntity.tokenGroup.filter(token => token.id !== source.id);
            RuneClingEntity.tokenGroup.push({ id: source.id, wait: 100 });
        }
        return test === 0;
    }
    ;
    afterPlanEvent() {
        /**
         * * 获取 无效的 令牌
         */
        const reset = RuneClingEntity.tokenGroup.filter(token => token.wait <= 0);
        /**
         * * 获取 有效的 令牌
         */
        const valid = RuneClingEntity.tokenGroup.filter(token => token.wait > 0);
        // 移除 无效的 令牌
        RuneClingEntity.tokenGroup = RuneClingEntity.tokenGroup.filter(token => token.wait > 0);
        // 减少 令牌有效时间
        RuneClingEntity.tokenGroup.forEach(token => token.wait -= 1);
        // 令牌移除事件
        reset.forEach(token => {
            /**
             * * 获取 实体
             */
            const entity = server.world.getEntity(token.id);
            if (!entity)
                return;
            AlterProperty(entity, { add_rune: 'rune_void' });
        });
        // 令牌有效事件
        valid.forEach(token => {
            /**
             * * 获取 实体
             */
            const entity = server.world.getEntity(token.id);
            if (!entity)
                return;
            /**
             * * 粒子参数
             */
            const molang = new server.MolangVariableMap();
            /**
             * * 获取 实体属性
             */
            const state = GetProperty(entity);
            /**
             * * 获取 世界维度
             */
            const dimension = entity.dimension;
            /**
             * * 获取 颜色
             */
            const colour = table.getRuneColor(state.self_rune);
            // 设定 粒子参数
            molang.setFloat('variable.scale', 0.35);
            molang.setColorRGB('variable.color', colour);
            molang.setVector3('variable.offset', { x: 0, y: 1.5, z: 0 });
            // 显示 粒子特效
            TrySpawnParticle(dimension, `scripts:fusion_${state.add_rune}`, entity.getHeadLocation(), molang);
        });
    }
    ;
    /**
     * * 简短的构造器
     *
     * @param nameTag - 名称
     */
    static BriefCreate(nameTag) {
        return this.Create(nameTag, 1, {});
    }
    ;
}
;
/**
 * * 根据实体与目标之间的距离来计算击退效果
 *
 * @param {server.Entity} entity - 发起击退的实体
 *
 * @param {server.Entity} target - 被击退的目标实体
 *
 * @param {number} multiplier - 距离影响击退效果的乘数因子, 默认值为3
 */
function BackoffByDistance(entity, target, multiplier = 3) {
    /**
     * * 击退方向
     */
    const direction = Vector.difference(entity.location, target.location);
    /**
     * * 本体与目标的距离
     */
    const distance = Vector.distance(entity.location, target.location);
    /**
     * * 击退系数
     */
    const mapping = ((1 + distance) / distance) * multiplier;
    // 执行击退
    target.applyKnockback({ x: direction.x * mapping, z: direction.z * mapping }, direction.y * (multiplier - 1));
}
;
/**
 * * 随机生成一个符文类型
 *
 * @returns {type.RUNE_TYPE} 返回一个随机的符文类型枚举值
 */
function RandomRune() {
    /**
     * * 符文类型数组, 每个类型都有相同的选中概率
     *
     * @type {type.RUNE_TYPE[]}
     */
    const runes = [
        type.RUNE_ENUM.blue,
        type.RUNE_ENUM.green,
        type.RUNE_ENUM.orange,
        type.RUNE_ENUM.red,
        type.RUNE_ENUM.purple
    ];
    /**
     * * 生成一个介于0（包含）和符文类型数组的长度（不包含）之间的随机索引
     *
     * @type {number}
     */
    const randomIndex = RandomFloat(0, runes.length);
    /**
     * * 根据随机索引返回一个符文类型
     *
     * @type {type.RUNE_TYPE}
     */
    return runes[randomIndex];
}
;
/**
 * * 判断 实体是否暴击
 *
 * @param {server.Entity | server.Player} object - 实例对象
 *
 * @returns {boolean} - 返回 实体是否暴击
 */
function IsErupt(object) {
    /**
     * * 获取 实体属性
     */
    const getData = GetProperty(object);
    /**
     * * 暴击概率
     */
    const eruptOdds = getData.erupt_odds + getData.raise_erupt_odds;
    // 判断 实体属性
    return IsEnable(eruptOdds);
}
;
/**
 * * 创建 实体 的 战斗属性面板
 *
 * @param {server.Entity} entity 进行 战斗属性面板 设置 的 实体
 *
 * @param {type.SET_PROPERTY_PANEL} input 实体 的 战斗属性面板
 */
function CreateProperty(entity, input) {
    /**
     * * 定义一个辅助函数, 用于设置动态属性, 使用枚举提供的默认值
     *
     * @param {RUNE_PROPERTY_DEFAULT} key - 战斗属性面板的属性
     */
    const setProperty = (key) => {
        entity.setDynamicProperty(`rune_hurt:${key}`, input?.[key] ?? type.RUNE_PROPERTY_DEFAULT[key]);
    };
    // 使用枚举设置属性, 同时允许输入覆盖默认值
    setProperty('raise_basic_attack');
    setProperty('raise_erupt_odds');
    setProperty('raise_erupt_hurt');
    setProperty('damage_increase');
    setProperty('double_damage');
    setProperty('basic_attack');
    setProperty('erupt_hurt');
    setProperty('erupt_odds');
    setProperty('add_rune');
    // 自身符文 需 特殊处理, 因为它使用了 RandomRune 函数
    entity.setDynamicProperty('rune_hurt:self_rune', input?.self_rune ?? RandomRune());
}
;
/**
 * * 设置 实体 的 战斗属性面板
 *
 * @param {server.Entity} object 进行 战斗属性面板 设置 的 实体
 *
 * @param {type.SET_PROPERTY_PANEL} input 实体 的 战斗属性面板
 */
function SetProperty(object, input) {
    /**
     * * 获取 实体 的 原始战斗属性面板
     */
    const proto = GetProperty(object);
    /*
     * 基础伤害
     */
    object.setDynamicProperty('rune_hurt:basic_attack', input.basic_attack ?? proto.basic_attack);
    object.setDynamicProperty('rune_hurt:raise_basic_attack', input.raise_basic_attack ?? proto.raise_basic_attack);
    /*
     * 暴击概率
     */
    object.setDynamicProperty('rune_hurt:erupt_odds', input.erupt_odds ?? proto.erupt_odds);
    object.setDynamicProperty('rune_hurt:raise_erupt_odds', input.raise_erupt_odds ?? proto.raise_erupt_odds);
    /*
     * 暴击伤害
     */
    object.setDynamicProperty('rune_hurt:erupt_hurt', input.erupt_hurt ?? proto.erupt_hurt);
    object.setDynamicProperty('rune_hurt:raise_erupt_hurt', input.raise_erupt_hurt ?? proto.raise_erupt_hurt);
    /*
     * 伤害提升
     */
    object.setDynamicProperty('rune_hurt:damage_increase', input.damage_increase ?? proto.damage_increase);
    object.setDynamicProperty('rune_hurt:double_damage', input.double_damage ?? proto.double_damage);
    /*
     * 元素符文
     */
    object.setDynamicProperty('rune_hurt:add_rune', input.add_rune ?? proto.add_rune);
    object.setDynamicProperty('rune_hurt:self_rune', input.self_rune ?? proto.self_rune);
}
;
/**
 * * 修改 实体 的 战斗属性面板
 *
 * @param {server.Entity} object 进行 战斗属性面板 设置 的 实体
 *
 * @param {type.SET_PROPERTY_PANEL} input 实体 的 战斗属性面板
 */
function AlterProperty(object, input) {
    // 如果 实体 未初始化 则 不进行 设置
    if (!object.getDynamicProperty('entity:is_initial'))
        return;
    /**
     * * 获取 实体 的 原始战斗属性面板
     */
    const proto = GetProperty(object);
    /*
     * 基础伤害
     */
    if (input.basic_attack)
        object.setDynamicProperty('rune_hurt:basic_attack', proto.basic_attack + input.basic_attack);
    if (input.raise_basic_attack)
        object.setDynamicProperty('rune_hurt:raise_basic_attack', proto.raise_basic_attack + input.raise_basic_attack);
    /*
     * 暴击概率
     */
    if (input.erupt_odds)
        object.setDynamicProperty('rune_hurt:erupt_odds', proto.erupt_odds + input.erupt_odds);
    if (input.raise_erupt_odds)
        object.setDynamicProperty('rune_hurt:raise_erupt_odds', proto.raise_erupt_odds + input.raise_erupt_odds);
    /*
     * 暴击伤害
     */
    if (input.erupt_hurt)
        object.setDynamicProperty('rune_hurt:erupt_hurt', proto.erupt_hurt + input.erupt_hurt);
    if (input.raise_erupt_hurt)
        object.setDynamicProperty('rune_hurt:raise_erupt_hurt', proto.raise_erupt_odds + input.raise_erupt_hurt);
    /*
     * 伤害提升
     */
    if (input.damage_increase)
        object.setDynamicProperty('rune_hurt:damage_increase', proto.damage_increase + input.damage_increase);
    if (input.double_damage)
        object.setDynamicProperty('rune_hurt:double_damage', proto.double_damage + input.double_damage);
    /*
     * 元素符文
     */
    object.setDynamicProperty('rune_hurt:add_rune', input.add_rune ?? proto.add_rune);
    object.setDynamicProperty('rune_hurt:self_rune', input.self_rune ?? proto.self_rune);
}
;
/**
 * * 合并 战斗属性面板
 *
 * @param {type.GET_PROPERTY_PANEL} proto 原本的 战斗属性面板
 *
 * @param {type.SET_PROPERTY_PANEL} alter 需要的 战斗属性面板
 *
 * @returns {type.GET_PROPERTY_PANEL} 合并后的 战斗属性面板
 */
function MergeProperty(proto, alter) {
    return { ...proto, ...alter };
}
;
/**
 * * 获取 实体 的 战斗属性面板
 *
 * @param {server.Entity} entity 需要获取属性面板的实体
 *
 * @returns {type.GET_PROPERTY_PANEL} 实体的战斗属性面板
 */
function GetProperty(entity) {
    // 如果 实体不存在 或 不是有效实体 则 返回默认属性面板
    if (!entity || !entity.isValid)
        return type.RUNE_PROPERTY_DEFAULT;
    /**
     * * 获取实体的属性面板值
     *
     * @param {string} key - 属性面板的键
     *
     * @param {any} initial - 初始值
     *
     * @returns {any} - 属性面板的值
     */
    const getProperty = (key, initial) => entity?.getDynamicProperty(`rune_hurt:${key}`) ?? initial;
    // 返回属性面板
    return {
        // 属性提升
        raise_basic_attack: getProperty('raise_basic_attack', type.RUNE_PROPERTY_DEFAULT.raise_basic_attack),
        raise_erupt_odds: getProperty('raise_erupt_odds', type.RUNE_PROPERTY_DEFAULT.raise_erupt_odds),
        raise_erupt_hurt: getProperty('raise_erupt_hurt', type.RUNE_PROPERTY_DEFAULT.raise_erupt_hurt),
        damage_increase: getProperty('damage_increase', type.RUNE_PROPERTY_DEFAULT.damage_increase),
        double_damage: getProperty('double_damage', type.RUNE_PROPERTY_DEFAULT.double_damage),
        // 基础属性
        basic_attack: getProperty('basic_attack', type.RUNE_PROPERTY_DEFAULT.basic_attack),
        erupt_odds: getProperty('erupt_odds', type.RUNE_PROPERTY_DEFAULT.erupt_odds),
        erupt_hurt: getProperty('erupt_hurt', type.RUNE_PROPERTY_DEFAULT.erupt_hurt),
        // 元素类型
        self_rune: getProperty('self_rune', type.RUNE_PROPERTY_DEFAULT.self_rune),
        add_rune: getProperty('add_rune', type.RUNE_PROPERTY_DEFAULT.add_rune),
    };
}
;
/**
 * * 创建 虚拟战斗属性面板
 *
 * @param {type.SET_PROPERTY_PANEL} input  - 设定战斗属性
 *
 * @returns {type.GET_PROPERTY_PANEL} - 输出战斗属性面板
 */
function CreateEmptyProperty(input) {
    /**
     * * 基础 战斗属性面板, 使用枚举定义的默认值
     */
    const proto = {};
    // 遍历枚举, 将枚举的键和值应用到 proto 对象上
    for (const key in type.RUNE_PROPERTY_DEFAULT) {
        if (type.RUNE_PROPERTY_DEFAULT.hasOwnProperty(key)) {
            proto[key] = type.RUNE_PROPERTY_DEFAULT[key];
        }
    }
    ;
    return MergeProperty(proto, input);
}
;
/**
 * * 创建 元素攻击
 *
 * @param {server.Entity} [self] - 发起元素攻击的实体
 *
 * @param {server.Entity} [target] - 遭受攻击的目标实体
 *
 * @param {boolean} [erupt] - 是否暴击
 *
 * @param {type.GET_PROPERTY_PANEL} [hurtData] - 攻击属性面板
 */
function ElementalAttack(self, target, erupt = false, hurtData) {
    // 判断 条件是否满足
    if (!self || !target || !target.isValid || !target.getComponent('health') || erupt == undefined)
        return;
    /**
     * * 元素伤害发起者 的 战斗属性面板
     */
    const selfData = MergeProperty(GetProperty(self), hurtData ?? {});
    /**
     * * 获取 目标属性
     */
    const targetData = GetProperty(target);
    /**
     * * 定义 伤害参数
     */
    const options = DamageOptions(self);
    /**
     * * 执行 元素反应 并获得 伤害倍率 提升值
     */
    const fusion = ElementalReactions(target, targetData.add_rune, selfData.self_rune);
    /**
     * * 获取 增加 伤害倍率 后的 属性面板
     */
    const improve = MergeProperty(selfData, { double_damage: fusion + selfData.double_damage });
    /**
     * * 计算 伤害值
     */
    const damage = RuneElementalDamage(improve, erupt);
    // 触发 完全命中 的 伤害
    if (selfData.self_rune !== targetData.self_rune)
        target.applyDamage(damage, options);
    // 触发 元素抗性 的 伤害
    else
        ElementalResistance(target, options, damage, table.rune_resistance);
    // 为目标 附加 元素印记
    SetProperty(target, { add_rune: selfData.self_rune });
    // 重置 自身属性
    SetProperty(self, table.reset_battle_data);
    // 刷新 元素印记
    RuneClingEntity.CreateToken(target);
}
;
/**
 * * 获取 伤害参数
 *
 * @param {server.Entity | server.Player} [self] - 发起元素攻击的实体
 *
 * @param {string} [hurtType] - 伤害类型
 *
 * @returns {server.EntityApplyDamageOptions} - 伤害参数
 */
function DamageOptions(self, hurtType) {
    return {
        cause: server.EntityDamageCause[hurtType ?? 'entityExplosion'],
        damagingEntity: self
    };
}
;
/**
 * * 执行 符文元素反应
 *
 * @param {server.Entity} target - 进行元素反应 的 目标实体
 *
 * @param {type.RUNE_TYPE} old - 当前的 元素符文类型
 *
 * @param {type.RUNE_TYPE} add - 新增的 元素符文类型
 *
 * @returns {number} 元素符文反应后 提供的 倍率倍率提升值
 */
function ElementalReactions(target, old, add) {
    /**
     * * 获取 原有的 符文映射值
     */
    const getOldValue = type.RUNE_COUNT[old];
    /**
     * * 获取 新增的 符文映射值
     */
    const getAddValue = type.RUNE_COUNT[add];
    // 判断 目标实体是否存在
    if (!target)
        return 0;
    /**
     * * 获取 符文融合结果
     */
    const result = rune_fusion.get(getOldValue + getAddValue);
    // 判断 实体是否存在
    if (!result)
        return 0;
    // 执行 符文融合 事件
    if (result.event)
        result.event(target);
    // 返回 倍率倍率
    return result.double;
}
;
/**
 * * 结算当目标具有元素抗性时的伤害
 *
 * @param {server.Entity} target - 目标实体
 *
 * @param {server.EntityApplyDamageOptions} options - 伤害参数
 *
 * @param {Number} damage - 伤害值
 *
 * @param {Number} resistance - 元素抗性
 */
function ElementalResistance(target, options, damage, resistance) {
    // 播放 粒子效果
    TrySpawnParticle(target.dimension, 'constant:rune_resistance', target.getHeadLocation());
    // 播放 抵抗音效
    target.dimension.playSound('random.glass', target.location);
    // 伤害值 乘以 抗性
    target.applyDamage(damage * (1 - resistance), options);
}
;
/**
 * * 计算 符文元素伤害
 *
 * @param {type.GET_PROPERTY_PANEL} data 用于 计算 的 属性面板
 *
 * @param {boolean} erupt - 是否暴击
 *
 * @returns {number} 计算后 的 伤害值
 */
function RuneElementalDamage(data, erupt) {
    /**
     * * 计算基础攻击总值（基础伤害 + 攻击提升）
     */
    const baseAttack = data.basic_attack + data.raise_basic_attack;
    /**
     * * 计算暴击伤害倍率（基础暴击值 + 暴击提升值）
     */
    const criticalMultiplier = (data.erupt_hurt + data.raise_erupt_hurt) / 100;
    /**
     * * 未暴击时的基础伤害计算
     */
    const normalDamage = baseAttack * data.double_damage;
    /**
     * * 暴击时的增强伤害计算
     */
    const criticalDamage = (baseAttack * criticalMultiplier) * data.double_damage;
    /**
     * * 获取世界配置的最大伤害限制（默认安全整数最大值）
     */
    const maxDamage = server.world.getDynamicProperty('rune_hurt:max_damage') ?? Number.MAX_SAFE_INTEGER;
    /**
     * * 获取世界配置的最小伤害限制（默认5点基础伤害）
     */
    const minDamage = server.world.getDynamicProperty('rune_hurt:min_damage') ?? 5;
    /**
     * * 综合计算最终伤害值
     */
    const calculatedDamage = erupt ? (criticalDamage + data.damage_increase) : (normalDamage + data.damage_increase);
    // 返回经过范围限制的最终伤害值
    return Clamp({ min: minDamage, max: maxDamage }, calculatedDamage);
}
;
/**
 * 对指定实体周围的目标进行元素攻击
 *
 * 此函数根据给定的符文类型, 对服务器中特定实体周围的目标进行范围攻击
 *
 * 它首先定义了一组查询选项以筛选周围的实体, 然后对这些实体执行攻击操作
 *
 * @param {server.Entity} [self] 实施攻击的实体
 *
 * @param {type.RUNE_TYPE} [type] 触发的符文类型
 */
async function ScopeAdditional(self, type) {
    /**
     * 实体查询选项, 用于定义查询条件
     *
     * @type {server.EntityQueryOptions}
     */
    const options = {
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"],
        location: self.location,
        maxDistance: 4,
        closest: 8
    };
    /**
     * 获取在指定范围内且符合查询条件的实体列表
     *
     * @type {server.Entity[]}
     */
    const entitys = self.dimension.getEntities(options);
    /**
     * * 获取数据
     */
    const getData = GetProperty(self);
    /**
     * * 合并数据
     */
    const hurtData = MergeProperty(getData, { self_rune: type });
    // 等待 5 帧
    await server.system.waitTicks(5);
    /**
     * 对查询到的每个实体执行元素攻击
     *
     * 使用简短的创建方法, 传递执行操作的实体, 目标实体, 是否是远程攻击以及合并后的属性数据
     */
    entitys.forEach(target => ElementalAttack(self, target, false, hurtData));
}
;
/**
 * * 符文事件 - 超载
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function overload(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 造成范围性元素反应伤害, 并对范围内的实体应用符文效果
    ScopeAdditional(self, 'rune_red');
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.overload', self.getHeadLocation());
    // 不可对玩家实体使用该特效
    if (self instanceof server.Player)
        return;
    // 对实体施加向上的冲量, 模拟超载效果的物理表现
    self.applyImpulse(Vector.CONSTANT_UP);
}
;
/**
 * * 符文事件 - 潮汐
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function tides(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.tides', self.getHeadLocation());
    // 尝试熄灭实体身上的火焰
    self.extinguishFire(true);
}
;
/**
 * * 符文事件 - 催化
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function catalysis(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.catalysis', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 感电
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function electric(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 造成范围性元素反应伤害, 并对范围内的实体应用符文效果
    ScopeAdditional(self, 'rune_purple');
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.electric', self.getHeadLocation());
    // 不可对玩家实体使用该特效
    if (self instanceof server.Player)
        return;
    // 对实体施加向下的冲量, 模拟感电效果的物理表现
    self.applyImpulse(Vector.CONSTANT_DOWN);
}
;
/**
 * * 符文事件 - 共鸣
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function resonance(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 造成范围性元素反应伤害, 并对范围内的实体应用符文效果
    ScopeAdditional(self, 'rune_orange');
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.resonance', self.getHeadLocation());
    // 不可对玩家实体使用该特效
    if (self instanceof server.Player)
        return;
    // 对实体施加向右的冲量, 模拟共鸣效果的物理表现
    self.applyImpulse(Vector.CONSTANT_HALF);
}
;
/**
 * * 符文事件 - 归零
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function zero(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.zero', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 辉光
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function brilliance(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.brilliance', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 激化
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function sharpen(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.sharpen', self.getHeadLocation());
    // 延迟一段时间后, 刷新实体的元素附着的符文效果
    server.system.run(() => SetProperty(self, { add_rune: 'rune_purple' }));
}
;
/**
 * * 符文事件 - 结晶
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function crystal(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.crystal', self.getHeadLocation());
    // 延迟一段时间后, 刷新实体的元素附着的符文效果
    server.system.run(() => SetProperty(self, { add_rune: 'rune_orange' }));
}
;
/**
 * * 符文事件 - 绝缘
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function insulation(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.insulation', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 枯萎
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function withered(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.withered', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 雷鸣
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function thunderous(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.thunderous', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 流沙
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function quicksand(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.quicksand', self.getHeadLocation());
    // 延迟一段时间后, 刷新实体的元素附着的符文效果
    server.system.run(() => SetProperty(self, { add_rune: 'rune_orange' }));
}
;
/**
 * * 符文事件 - 律令
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function directive(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.directive', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 偏振
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function polarity(self) {
    // 限制 重复触发速度
    if (!TriggerControl('元素反应', self, 20))
        return;
    /**
     * * 生命值组件
     */
    const health = self.getComponent('health');
    // 判断 生命值组件 是否存在
    if (!health)
        return;
    /**
     * * 当前血量
     */
    const current = health?.currentValue ?? 0;
    /**
     * * 元素伤害钳位值
     */
    const Clamping = Math.max(10, Math.min((current * 0.15), 3000));
    // 生成粒子
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.polarity', self.getHeadLocation());
    // 扣除实体百分比血量
    server.system.runTimeout(() => health?.setCurrentValue(current - Clamping), 2);
}
;
/**
 * * 符文事件 - 燃烧
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function flame(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.flame', self.getHeadLocation());
    // 根据实体名称的长度点燃实体
    self.setOnFire(self.typeId.length * 2, true);
    // 延迟一段时间后, 刷新实体的元素附着的符文效果
    server.system.run(() => SetProperty(self, { add_rune: 'rune_red' }));
}
;
/**
 * * 符文事件 - 若水
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function like_water(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.like_water', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 生长
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function produce(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.produce', self.getHeadLocation());
    // 延迟一段时间后, 刷新实体的元素附着的符文效果
    server.system.run(() => SetProperty(self, { add_rune: 'rune_orange' }));
}
;
/**
 * * 符文事件 - 余烬
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function embers(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.embers', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 绽放
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function blossom(self) {
    // 限制 重复触发速度
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 造成范围性元素反应伤害, 并对范围内的实体应用符文效果
    ScopeAdditional(self, 'rune_green');
    // 生成粒子
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.blossom', self.getHeadLocation());
}
;
/**
 * * 符文事件 - 蒸发
 *
 * @param {server.Entity} self - 触发元素反应效果的实体
 */
function vapor(self) {
    /**
     * 检查并限制事件的触发频率, 避免重复触发
     *
     * 如果事件在指定时间内已被触发, 则不再执行后续操作
     */
    if (!TriggerControl('元素反应', self, 20))
        return;
    // 在实体头部位置生成元素反应效果的粒子效果
    TrySpawnParticle(self.dimension, 'constant:rune_fusion.vapor', self.getHeadLocation());
    // 尝试熄灭实体身上的火焰
    self.extinguishFire(true);
    // 延迟一段时间后, 刷新实体的元素附着的符文效果
    server.system.run(() => SetProperty(self, { add_rune: 'rune_blue' }));
}
;
// 向系统中注册元素附着与显示机制
RuneClingEntity.BriefCreate('世界初始化容器');
