/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 系统数据
 */
import { can_display_logs } from "../data/table";
/*
 * 设置模块
 */
import { TrySpawnParticle } from './create';
/*
 * 数学模块
 */
import { Vector } from './maths';
/*
 * 导出模块
 */
export { Control, Template, PathExecute, MistySeaFissure, NumberID, BriefID, UUID };
/**
 * * 运行并显示 计划表 的 反馈信息
 */
class Control {
    /**
     * * 持续性 的 计划表 队列
     *
     * @type {type.PLAN[]}
     */
    static inventory = [];
    /**
     * * 计划表功能执行前事件订阅器
     *
     * * 用于在计划表执行前进行一些预处理
     *
     * * 它接收一个 BEFORE_PLAN_DATA 类型的参数, 包含了预处理所需的数据
     *
     * @param {type.BEFORE_PLAN_DATA} data - 计划表数据
     */
    static beforeEventSubscribe(data) { }
    ;
    /**
     * * 执行 全部计划表
     */
    static execute() {
        // 验证 计划表队列 是否为空
        if (this.inventory.length == 0)
            return;
        /**
         * * 等待移除 的 计划表 的 唯一识别符
         *
         * @type {Set<string>}
         */
        const waitRemove = new Set();
        // 执行 全部 计划表
        this.inventory.forEach(plan => {
            // 运行 时间刻积分
            plan.timeScore += 1;
            // 验证 时间刻积分 是否满足 执行条件
            if (plan.timeScore % plan.cooldown != 0)
                return;
            /**
             * * 设定 是否运行当前实例
             *
             * @type {boolean}
             */
            let license = true;
            /**
             * * 将 计划表 标记为 等待移除
             */
            const remove = () => waitRemove.add(plan.planId);
            /**
             * * 定义 当前实例 是否暂停运行
             */
            const cease = () => license = false;
            // 运行 计划表
            try {
                // 运行 计划表 前处理 回调函数
                Control.beforeEventSubscribe({ plan, remove, cease });
                // 运行 计划表 后处理 回调函数
                if (license)
                    plan.afterPlanEvent({ plan, remove });
            }
            catch (error) {
                /**
                 * 获取 错误信息
                 */
                const info = error instanceof Error ? error : new Error(String(error));
                /**
                 * * 错误路径
                 *
                 * @type {string}
                 */
                const stack = info.stack ?? './';
                /**
                 * * 截取报错信息
                 *
                 * @type {string}
                 */
                const intel = 'THE_OTHER_SHORE:' + info.message + stack;
                // 基于 条件参数 约束 控制台输出
                if (can_display_logs)
                    console.error(intel);
                // 将 计划表 标记为 等待移除
                remove();
            }
            ;
        });
        // 移除 被标记为 等待移除 的 计划表
        if (waitRemove.size > 0)
            this.inventory = this.inventory.filter(plan => !waitRemove.has(plan.planId));
    }
    ;
    /**
     * * 私有构造函数
     */
    constructor() { }
    ;
}
;
/**
 * * 计划表 模板类
 */
class Template {
    className;
    cooldown;
    annex;
    /**
     * * 当前计划表 的 数字标识符
     */
    planId;
    /**
     * * 实例 的 时间刻积分
     */
    timeScore = 1;
    /**
     * * 计划表 后处理 回调函数
     */
    afterPlanEvent(data) { }
    ;
    /**
     * @param {string} className - 类名
     *
     * @param {number} cooldown - 重复执行的间隔时间
     *
     * @param {ANNEX_ARGS} annex - 附加参数
     */
    constructor(className, cooldown, annex) {
        this.className = className;
        this.cooldown = cooldown;
        this.annex = annex;
        this.cooldown = Math.floor(cooldown);
        this.planId = BriefID();
    }
    ;
    /**
     * * 创建 计划表 并 返回 计划表对象
     *
     * @param {string} className - 类名
     *
     * @param {number} cooldown - 冷却时间
     *
     * @param {ANNEX_ARGS} data - 附加参数
     */
    static Create(className, cooldown, data) {
        // 验证类名
        if (className == "")
            throw new Error("类名不能为空");
        /**
         * * 创建 计划表对象
         */
        const plan = new this(className, cooldown, data);
        // 将 计划表 添加到 持久性计划表
        Control.inventory.push(plan);
        // 返回 计划表对象
        return plan;
    }
    ;
}
;
/**
 * * 在路径上执行
 */
class PathExecute extends Template {
    /**
     * * 计划表 的 路径索引
     */
    pathIndex = 1;
    /**
     * * 计划表 的 当前位置
     */
    current = { ...Vector.CONSTANT_ZERO };
    /**
     * * 当前位置与节点位置间的矢量关系
     */
    direction = Vector.CONSTANT_ZERO;
    /**
     * * 当前位置与节点位置间的距离
     */
    nodeDistance = 0;
    /**
     * * 计划表 的 路径坐标组
     */
    location_group = [];
    /**
     * * 运行维度
     */
    dimension = server.world.getDimension('overworld');
    /**
     * * 粒子轨迹
     */
    particles = [];
    /**
     * * 带有molang表达式的粒子效果
     */
    particleMolang = undefined;
    /**
     * * 在运行时执行
     */
    on_move;
    /**
     * * 在结束时执行
     */
    on_done;
    /**
     * * 位置偏移
     */
    offset;
    /**
     * * 附加参数
     */
    annex = {};
    /**
     * * 运行速度
     */
    speed = 1;
    /**
     * * 路径执行计划表 抵达 边界点 的 次数
     */
    boundsCounting = 0;
    /**
     * * 计划表 后处理 回调函数
     *
     * @param data - 计划表数据
     */
    afterPlanEvent(data) {
        if (this.speed == 1)
            this.executePathPlan(data);
        else
            for (let index = 0; index < this.speed; index++)
                this.executePathPlan(data);
    }
    ;
    /**
     * * 执行 路径计划
     */
    executePathPlan(data) {
        // 判断越界次数
        if (this.boundsCounting >= 1)
            return;
        /**
         * * 当前位置与节点位置间的距离
         */
        const distance = Vector.distance(this.location_group[this.pathIndex], this.current);
        /**
         * * 终点位置的索引
         */
        const endIndex = this.location_group.length - 1;
        /**
         * * 判断是否继续运行
         */
        const enable = Vector.distance(this.current, this.location_group[endIndex]) < 1;
        /**
         * * 路径计划 附加参数
         */
        const pathAnnexData = {
            dimension: this.dimension,
            location: this.current,
            tick: this.timeScore
        };
        // 判断 是否执行 运行时 的 附加程序
        if (this.on_move) {
            /**
             * * 执行 运行时 的 附加程序
             */
            const onClose = this.on_move(pathAnnexData);
            // 判断 是否执行 关闭事件
            if (onClose == false && this.on_done)
                this.on_done(pathAnnexData);
            //检测是否需要关闭程序运行
            if (onClose == false)
                return data.remove();
        }
        ;
        // 判断 是否需要显示粒子效果
        if (this.particles.length > 0)
            this.particles.forEach(particle => TrySpawnParticle(this.dimension, particle, this.current));
        // 判断 是否需要显示带有molang表达式的粒子效果
        if (this.particleMolang !== undefined)
            TrySpawnParticle(this.dimension, this.particleMolang[0], this.current, this.particleMolang[1]);
        // 修改 计划表 指向的位置
        this.modifyCurrentLocation(this, distance, endIndex);
        // 判断 是否继续运行
        if (!enable || this.pathIndex != endIndex)
            return;
        // 执行结束事件
        if (this.on_done)
            this.on_done(pathAnnexData);
        // 记录越界次数
        this.boundsCounting += 1;
        // 移除 计划表
        return data.remove();
    }
    ;
    /**
     * * 修改 路径执行 当前指向 的 位置
     *
     * @param {PathExecute} self - 路径执行计划表
     *
     * @param {number} distance - 当前位置与节点位置间的距离
     *
     * @param {number} endIndex - 终点位置的索引
     */
    modifyCurrentLocation(self, distance, endIndex) {
        //判断 是否执行下一个位置
        if (distance < 1 && self.pathIndex != endIndex) {
            // 获取下一个位置
            self.pathIndex += 1;
            // 获取下一个位置与当前位置之间的矢量
            self.direction = Vector.subtract(self.location_group[self.pathIndex], self.current);
            // 获取下一个位置与当前位置之间的矢量距离
            self.nodeDistance = Vector.distance(self.location_group[self.pathIndex], self.current);
        }
        // 修改 计划表 指向的位置
        else {
            self.current.x += (self.direction.x / self.nodeDistance);
            self.current.y += (self.direction.y / self.nodeDistance);
            self.current.z += (self.direction.z / self.nodeDistance);
        }
        ;
    }
    ;
    /**
     * * 基于 射击参数 初始化 路径属性
     *
     * @param {PathExecute} source - 路径执行计划表
     *
     * @param {ANNEX_ARGS} args - 执行表参数
     *
     * @param {server.Vector3} offset - 位置偏移
     *
     * @class {@link PathExecute}
     */
    static prepareShootingPath(source, args, offset) {
        // 验证参数
        if (!source || !args.shoot)
            return;
        /**
         * * 计算 终点坐标
         */
        const endPoint = Vector.add(args.shoot.start_place, Vector.multiply(args.shoot.toward, args.shoot.max_distance));
        // 重载 坐标组数据
        source.location_group = [args.shoot.start_place, endPoint];
        // 如果有偏移量, 则调整位置组中的坐标
        if (offset)
            source.location_group = source.location_group.map(location => Vector.add(location, offset));
        // 获取当前位置与目标位置之间的矢量距离
        source.current = source.location_group[0];
        source.direction = Vector.subtract(source.location_group[1], source.current);
        source.nodeDistance = Vector.distance(source.location_group[1], source.current);
    }
    ;
    /**
     * * 基于 默认参数 初始化 路径属性
     *
     * @param {PathExecute} source - 路径型代码
     *
     * @param {server.Vector3} offset - 偏移
     *
     * @class {@link PathExecute}
     */
    static prepareDefaultPath(source, offset) {
        /**
         * * 获取 玩家对象
         */
        const player = source.dimension.getPlayers()[0];
        // 根据位置组长度设置新的位置组
        if (source.location_group.length === 0) {
            // 设置起点和终点
            source.location_group = [player.location, Vector.add(player.location, { x: 10, y: 10, z: 10 })];
        }
        else if (source.location_group.length === 1) {
            // 只有起点, 添加终点
            source.location_group.push(Vector.add(source.location_group[0], { x: 10, y: 10, z: 10 }));
        }
        // 如果有偏移量, 则调整位置组中的坐标
        if (offset)
            source.location_group = source.location_group.map(location => Vector.add(location, offset));
        // 获取当前位置与目标位置之间的矢量距离
        source.current = source.location_group[0];
        source.direction = Vector.subtract(source.location_group[1], source.current);
        source.nodeDistance = Vector.distance(source.location_group[1], source.current);
    }
    ;
    /**
     * * 创建 路径执行计划表 并 返回 计划表对象
     *
     * @param {string} className - 类名
     *
     * @param {number} cooldown - 冷却时间
     *
     * @param {type.ROUTE_ARGS} data - 路径参数
     */
    static Create(className, cooldown, data) {
        // 验证类名
        if (className == "")
            throw new Error("类名不能为空");
        /**
         * * 创建 计划表对象
         */
        const plan = new PathExecute(className, cooldown, data);
        /**
         * @returns {ROUTE_MOVE_CODE} - 射程参数
         */
        const shootToward = () => {
            if (data.shoot) {
                return {
                    shoot: {
                        toward: data.shoot.toward,
                        start_place: data.shoot.start_place,
                        max_distance: Math.floor(data.shoot.max_distance)
                    }
                };
            }
            else
                return {};
        };
        // 设定 路径与射程参数
        plan.location_group = data.locations;
        plan.dimension = data.dimension;
        plan.cooldown = Math.floor(data.cooldown);
        plan.particles = data?.particles || [];
        plan.particleMolang = data.particleMolang;
        plan.on_move = data.on_move;
        plan.on_done = data.on_done;
        plan.offset = data.offset;
        plan.speed = Math.floor(data.speed);
        plan.annex = shootToward();
        // 尝试基于射击参数进行初始化
        if (data.shoot)
            PathExecute.prepareShootingPath(plan, data, plan.offset);
        // 尝试基于默认参数进行初始化
        if (!data.shoot)
            PathExecute.prepareDefaultPath(plan, plan.offset);
        // 将 计划表 添加到 持久性计划表队列
        Control.inventory.push(plan);
        // 返回 计划表对象
        return plan;
    }
    ;
    /**
     * * 创建 实心立方体 造型 的 路径计划表 并 返回 计划表对象
     *
     * @param {string} className - 当前计划表的识别名称
     *
     * @param {ROUTE_ARGS} data - 路径参数
     *
     * @param {server.Vector3} start - 路径的起始位置
     *
     * @param {server.Vector3} done - 路径的结束位置
     *
     * @param {number|undefined} multiple - 速度的缩放倍率
     *
     * @returns {PathExecute} - 计划表对象
     */
    static CreateForCube(className, data, start, done, multiple = 1) {
        // 验证类名
        if (className == "")
            throw new Error("类名不能为空");
        /**
         * * 创建 计划表对象
         */
        const plan = new PathExecute(className, 1, data);
        // 对偏移量进行处理
        if (plan.offset)
            start = Vector.add(start, plan.offset);
        if (plan.offset)
            done = Vector.add(done, plan.offset);
        /**
         * * 计算 距离
         */
        const distance = Vector.distance(done, start);
        /**
         * * 拷贝 起始点 坐标
         */
        const copyStart = Vector.copy(start);
        /**
         * * 修改 终止点 坐标
         */
        const copyDone = Vector.copy(done);
        // 修改 路径计划表 的 函数
        plan.modifyCurrentLocation = (self) => {
            if (self.current.x != copyDone.x) {
                self.current.x += copyDone.x > self.current.x ? 1 : -1;
            }
            else if (self.current.x == copyDone.x && self.current.z != copyDone.z) {
                self.current.z += copyDone.z > self.current.z ? 1 : -1;
                self.current.x = copyStart.x;
            }
            else if (self.current.x == copyDone.x && self.current.z == copyDone.z && self.current.y != copyDone.y) {
                self.current.y += copyDone.y > self.current.y ? 1 : -1;
                self.current.x = copyStart.x;
                self.current.z = copyStart.z;
            }
            else if (self.current.x == copyDone.x && self.current.z == copyDone.z && self.current.y == copyDone.y) {
                self.pathIndex = 1;
                self.boundsCounting += 2;
            }
            ;
        };
        // 修改 路径计划表 的 参数
        plan.nodeDistance = Vector.distance(done, start);
        plan.direction = Vector.subtract(done, start);
        plan.location_group = [start, done];
        plan.dimension = data.dimension;
        plan.cooldown = Math.floor(data.cooldown);
        plan.particles = data?.particles || [];
        plan.on_move = data.on_move;
        plan.on_done = data.on_done;
        plan.offset = data.offset;
        plan.current = start;
        plan.speed = Math.floor((distance - 1) * multiple) + 1;
        // 将 计划表 添加到 持久性计划表队列
        Control.inventory.push(plan);
        // 返回 计划表对象
        return plan;
    }
    ;
    /**
     * * 创建 立方体边框 造型 的 路径计划表 并 返回 计划表对象
     *
     * @param {string} className - 当前计划表的识别名称
     *
     * @param {ROUTE_ARGS} data - 路径参数
     *
     * @param {server.Vector3} start - 路径的起始位置
     *
     * @param {server.Vector3} done - 路径的结束位置
     *
     * @returns {PathExecute} - 计划表对象
     */
    static CreateForFrame(className, data, start, done) {
        // 验证类名
        if (className == "")
            throw new Error("类名不能为空");
        /**
         * * 创建 计划表对象
         */
        const plan = new PathExecute(className, 1, data);
        /**
         * * 计算 向量
         */
        const vector = Vector.subtract(done, start);
        /**
         * * 计算 距离
         */
        const distance = Vector.distance(done, start);
        /**
         * * 路径序列
         */
        const location_group = [];
        // 序列化 3D 结构
        if (vector.y != 0 && vector.x != 0 && vector.z != 0) {
            location_group.push(
            // 绘制 双平面 结构
            Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: 0 }), Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, Vector.CONSTANT_ZERO), Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, { x: 0, y: vector.y, z: vector.z }), Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, Vector.CONSTANT_ZERO), 
            // 修正 基准点
            Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: 0, z: vector.z }), 
            // 绘制 双平面 结构
            Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, { x: 0, y: vector.y, z: vector.z }), Vector.add(start, { x: vector.x, y: vector.y, z: vector.z }), Vector.add(start, { x: vector.x, y: 0, z: vector.z }), Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: vector.z }));
        }
        else if (vector.y == 0 && vector.x != 0 && vector.z != 0) {
            location_group.push(Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, { x: vector.x, y: 0, z: vector.z }), Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, Vector.CONSTANT_ZERO));
        }
        else if (vector.y != 0 && vector.x == 0 && vector.z != 0) {
            location_group.push(Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, { x: 0, y: vector.y, z: vector.z }), Vector.add(start, { x: 0, y: 0, z: vector.z }), Vector.add(start, Vector.CONSTANT_ZERO));
        }
        else if (vector.y != 0 && vector.x != 0 && vector.z == 0) {
            location_group.push(Vector.add(start, { x: 0, y: vector.y, z: 0 }), Vector.add(start, { x: vector.x, y: vector.y, z: 0 }), Vector.add(start, { x: vector.x, y: 0, z: 0 }), Vector.add(start, Vector.CONSTANT_ZERO));
        }
        ;
        // 修改 路径规划表 的 参数
        plan.location_group = [start, ...location_group];
        plan.dimension = data.dimension;
        plan.cooldown = Math.floor(data.cooldown);
        plan.particles = data?.particles || [];
        plan.on_move = data.on_move;
        plan.on_done = data.on_done;
        plan.offset = data.offset;
        plan.speed = distance;
        // 基于默认参数进行初始化
        PathExecute.prepareDefaultPath(plan, plan.offset);
        // 将 计划表 添加到 持久性计划表队列
        Control.inventory.push(plan);
        // 返回 计划表对象
        return plan;
    }
    ;
}
;
/**
 * * 雾海裂隙效果处理器, 用于在指定维度间生成粒子效果并处理实体传送逻辑
 *
 * @extends Template
 *
 * @param {number} cooldown tick 间隔时间（建议值：30）
 */
class MistySeaFissure extends Template {
    /**
     * todo 裂隙已存在的持续时间（单位：tick）
     *
     * @type {number}
     */
    survivalTime = 0;
    /**
     * todo 计划任务后执行的主逻辑
     *
     * @param {type.AFTER_PLAN_DATA} data 计划任务数据对象
     *
     * 执行流程如下：
     *
     * * 检查生存时间是否达到上限或缺少必要附件, 若满足则移除任务
     *
     * * 获取显示维度与目标维度信息
     *
     * * 更新雾海裂隙的生存时间
     *
     * * 在指定坐标生成粒子效果
     *
     * * 将范围内实体传送至目标坐标
     */
    afterPlanEvent(data) {
        // ! 判断 是否满足移除条件
        if (this.survivalTime >= 20 || !this.annex.dimensions || !this.annex.locations || this.annex.dimensions.length < 2 || this.annex.locations.length < 2)
            return data.remove();
        /**
         * todo 粒子效果显示维度
         *
         * @type {server.Dimension}
         */
        const showDimension = this.annex.dimensions[0];
        /**
         * todo 粒子效果显示坐标
         *
         * @type {server.Vector3}
         */
        const showLocation = this.annex.locations[0];
        /**
         * todo 实体传送目标坐标
         *
         * @type {server.Vector3}
         */
        const pointLocation = this.annex.locations[1];
        /**
         * todo 实体传送目标维度
         *
         * @type {server.Dimension}
         */
        const pointDimension = this.annex.dimensions[1];
        // * 更新生存时间
        this.survivalTime++;
        //console.log(`[雾海裂隙] 已持续 ${this.survivalTime} ticks`);
        // * 生成雾海裂隙粒子效果
        TrySpawnParticle(showDimension, 'constant:the_cracks_of_the_misty_sea', showLocation);
        // * 传送范围内实体到目标维度
        showDimension.getEntities({ location: showLocation, maxDistance: 3 }).forEach(entity => entity.tryTeleport(pointLocation, { dimension: pointDimension }));
    }
    ;
    /**
     * todo 快捷创建雾海裂隙实例
     *
     * @param {string} nameTag - 实例标识名称
     *
     * @param {type.ANNEX_ARGS} data - 附件参数, 需包含 dimensions: [显示维度, 目标维度] locations: [显示坐标, 目标坐标]
     *
     * @returns {type.PLAN} 创建的实例对象
     */
    static BriefCreate(nameTag, data) {
        return this.Create(nameTag, 30, data);
    }
    ;
}
;
/**
 * * 生成8位纯数值序列号
 *
 * @param {number|undefined} deplete - 序列号偏移量
 *
 * @returns {string} - 生成的8位纯数值序列号
 */
function NumberID(deplete = 0) {
    /**
     * * 定义一个基数, 确保序列号至少为8位
     */
    const base = 10000000;
    /**
     * * 获取 当前时间戳
     */
    const timestamp = server.system.currentTick;
    /**
     * * 获取 0 到 9999 之间的随机整数
     */
    const random = Math.floor(Math.random() * 10000);
    /**
     * * 结合时间戳和随机数, 减去偏移量, 并确保结果在8位数字的范围内
     */
    const value = (base + (timestamp % base) + random - deplete) % 100000000;
    // 转换为字符串, 并确保长度为8位
    return value.toString().padStart(8, '0');
}
;
/**
 * * 生成一个 简短标识符 字符串
 *
 * * 该函数通过组合当前时间戳的后 16 位和一个随机数的后 16 位, 以及它们之间的差值来生成一个唯一的ID
 *
 * * 这种生成方式确保了 ID 的唯一性和随机性, 同时保持了 ID 的长度较短
 *
 * @returns {string} -生成的 ID字符串, 格式为"随机部分-差值部分-时间部分"
 */
function BriefID() {
    /**
     * * 获取当前时间戳的后16位作为时间部分
     */
    const timePart = (server.system.currentTick & 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
    /**
     * * 获取一个随机数作为随机部分
     */
    const randomPart = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0').toUpperCase();
    /**
     * * 计算时间部分和随机部分之间的差值
     */
    const difference = (parseInt(randomPart, 16) - parseInt(timePart, 16) + 0x10000) % 0x10000;
    /**
     * * 将差值转换为4位十六进制字符串
     */
    const differencePart = difference.toString(16).padStart(4, '0').toUpperCase();
    // 拼接各部分以形成完整的ID字符串
    return `${randomPart}-${differencePart}-${timePart}`;
}
;
/**
 * * 生成一个符合UUID格式的唯一字符串标识符
 *
 * * UUID (Universally Unique Identifier) 是一种在分布式系统中用来唯一标识信息的标准
 *
 * * 此函数用于创建一个随机的UUID, 它遵循RFC 4122标准的版本4（随机UUID）
 *
 * @returns {string} 返回一个UUID字符串, 格式为 xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * * 其中 x 表示一个随机的十六进制数字, y 表示一个随机生成但经过特定处理的十六进制数字
 */
function UUID() {
    // 定义UUID的模式, 包含固定的'-'位置和需要被替换的'x'和'y'字符
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
        /**
         * * 获取一个随机数, 范围在0到15之间, 并转换为整数
         */
        const randomValue = (Math.random() * 16) | 0;
        /**
         * * 根据字符类型（x 或 y）返回一个随机数, 范围在0到15之间, 并转换为整数
         */
        const maskedRandomValue = character === 'x' ? randomValue : (randomValue & 0x3 | 0x8);
        // 将处理后的随机数转换为十六进制字符串
        return maskedRandomValue.toString(16);
    });
}
;
/*
type system_BEFORE_EVENT = (data: type.BEFORE_PLAN_DATA) => void;
type system_AFTER_EVENT = (data: type.AFTER_PLAN_DATA) => void;
type system_Function = (time: number, annex: type.ANNEX_ARGS) => any;
const systemEvent: [string, system_BEFORE_EVENT, system_AFTER_EVENT][] = [];
function systemSubscribe(eventType: string, beforeEvent: system_BEFORE_EVENT, afterEvent: system_AFTER_EVENT) { }
function systemControl(eventType: string, code: system_Function, cooldown: number = 1, speed: number = 1) { }
*/ 
