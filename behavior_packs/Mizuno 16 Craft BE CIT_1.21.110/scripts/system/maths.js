/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 导出模块
 */
export { Vector, MinecraftColor, CalculateMedian, CalculateModes, AnalysisWeight, RandomFloor, RandomFloat, Clamp, IsEnable, QueryFoothold, QueryEntityFoothold };
/**
 * * 向量常量类
 */
class VectorConstant {
    /**
     * 常量: 0.5 向量
     * 返回一个所有分量都为 0.5 的向量
     */
    static get CONSTANT_HALF() { return new Vector(0.5, 0.5, 0.5); }
    ;
    /**
     * 常量: 0 向量
     * 返回一个所有分量都为 0 的向量
     */
    static get CONSTANT_ZERO() { return new Vector(0, 0, 0); }
    ;
    /**
     * 常量: 向上单位向量
     * 返回一个 y 分量为 1, 其余分量为 0 的向上单位向量
     */
    static get CONSTANT_UP() { return new Vector(0, 1, 0); }
    ;
    /**
     * 常量: 向下单位向量
     * 返回一个 y 分量为 -1, 其余分量为 0 的向下单位向量
     */
    static get CONSTANT_DOWN() { return new Vector(0, -1, 0); }
    ;
    /**
     * 常量: 正一向量
     * 返回一个所有分量都是 1 的单位向量
     */
    static get CONSTANT_ONE() { return new Vector(1, 1, 1); }
    ;
    /**
     * 常量: 负一向量
     * 返回一个所有分量都是 -1 的单位向量
     */
    static get CONSTANT_LOSS_ONE() { return new Vector(-1, -1, -1); }
    ;
    /**
     * 常量: 西方向单位向量
     * 返回一个 x 分量为 -1, 其余分量为 0 的向西方向单位向量
     */
    static get CONSTANT_WEST() { return new Vector(-1, 0, 0); }
    ;
    /**
     * 常量: 东方向单位向量
     * 返回一个 x 分量为 1, 其余分量为 0 的向东方向单位向量
     */
    static get CONSTANT_EAST() { return new Vector(1, 0, 0); }
    ;
    /**
     * 常量: 北方向单位向量
     * 返回一个 z 分量为 1, 其余分量为 0 的向北方向单位向量
     */
    static get CONSTANT_SOUTH() { return new Vector(0, 0, 1); }
    ;
    /**
     * 常量: 南方向单位向量
     * 返回一个 z 分量为 -1, 其余分量为 0 的向南方向单位向量
     */
    static get CONSTANT_NORTH() { return new Vector(0, 0, -1); }
    ;
    /**
     * 常量: 水平方向单位向量数组
     * 包含四个水平方向（北、南、东、西）的单位向量
     */
    static get CONSTANT_HORIZONTAL() {
        return [
            Vector.CONSTANT_NORTH,
            Vector.CONSTANT_SOUTH,
            Vector.CONSTANT_EAST,
            Vector.CONSTANT_WEST
        ];
    }
    ;
    /**
     * 常量: 垂直方向单位向量数组
     * 包含两个垂直方向（上、下）的单位向量
     */
    static get CONSTANT_VERTICAL() {
        return [
            Vector.CONSTANT_DOWN,
            Vector.CONSTANT_UP,
        ];
    }
    ;
    /**
     * 常量: 所有方向单位向量数组
     * 包含所有方向（垂直和水平）的单位向量
     */
    static get CONSTANT_ALL() {
        return [
            ...Vector.CONSTANT_VERTICAL,
            ...Vector.CONSTANT_HORIZONTAL,
        ];
    }
    ;
    /**
     * 常量: 向下及水平方向单位向量数组
     * 包含向下方向（下）和所有水平方向（北、南、东、西）的单位向量
     */
    static get CONSTANT_DOWN_HORIZONTAL() {
        return [
            Vector.CONSTANT_DOWN,
            ...Vector.CONSTANT_HORIZONTAL,
        ];
    }
    ;
}
;
/**
 * * 向量类
 */
class Vector extends VectorConstant {
    x;
    y;
    z;
    /**
     * * 创建一个新的 Vector3 对象
     *
     * @param {number} x - 向量的 X 坐标
     *
     * @param {number} y - 向量的 Y 坐标
     *
     * @param {number} z - 向量的 Z 坐标
     */
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
    ;
    /**
     * * 生成立方体阵列向量数组
     *
     * @param scope 向量坐标的范围大小（非负整数）
     *
     * @returns {Vector[]} 立方体阵列向量数组, 包含所有可能的 (x, y, z) 组合, 其中每个坐标值都在 [-scope, +scope] 范围内
     */
    static createCubeLattice(scope) {
        /**
         * 计算立方体的边长, 范围为 [-scope, +scope], 因此边长为 2 * scope + 1
         */
        const size = 2 * scope + 1;
        /**
         * 存储生成的向量数组
         */
        const vectors = [];
        // 遍历所有可能的坐标组合
        for (let i = 0; i < size ** 3; i++) {
            /**
             * 计算 x 坐标：通过整数除法和取模运算确定 x 的值
             */
            const x = -scope + Math.floor(i / (size ** 2)) % size;
            /**
             * 计算 y 坐标：通过整数除法和取模运算确定 y 的值
             */
            const y = -scope + Math.floor((i / size) % size);
            /**
             * 计算 z 坐标：通过取模运算确定 z 的值
             */
            const z = -scope + i % size;
            // 将计算出的坐标封装为 Vector 对象并添加到数组中
            vectors.push(new Vector(x, y, z));
        }
        // 返回生成的向量数组
        return vectors;
    }
    ;
    /**
     * * 比较当前 Vector3 对象与另一个 Vector3 对象是否相等
     *
     * @param {server.Vector3} start - 要比较的 Vector3 对象
     *
     * @param {server.Vector3} done - 要比较的 Vector3 对象
     *
     * @returns {boolean} - 如果两个 Vector3 对象的 x、y 和 z 属性都相等, 则返回 true；否则返回 false
     */
    static equals(start, done) {
        return start.x === done.x && start.y === done.y && start.z === done.z;
    }
    ;
    /**
     * * 比较当前 Vector3 对象与另一个 Vector3 对象是否相等
     *
     * @param {server.Vector3} sample - 要比较的 Vector3 对象
     *
     * @returns {boolean} 如果两个 Vector3 对象的 x、y 和 z 属性都相等, 则返回 true；否则返回 false
     */
    equals(sample) {
        return this.x === sample.x && this.y === sample.y && this.z === sample.z;
    }
    ;
    /**
     * * 返回 Vector3 对象的一个副本
     *
     * @param {server.Vector3} vector - 需要拷贝的 Vector3 对象
     *
     * @returns {Vector} - 拷贝后的新 Vector 对象
     */
    static copy(vector) {
        return this.CONSTANT_ZERO.add(vector);
    }
    ;
    /**
     * * 返回当前 Vector3 对象的一个副本
     *
     * @returns {Vector} 当前 Vector 对象的副本
     */
    get copy() {
        return this.add(Vector.CONSTANT_ZERO);
    }
    ;
    /**
     * * 根据指定步数返回当前向量在y轴方向上的偏移结果
     *
     * @param {number} [steps = 1] - 垂直方向偏移量（可选, 默认为1）
     *
     * @returns {Vector} - 偏移后的新的 Vector 对象
     */
    above(steps) {
        /**
         * 获取偏移量
         */
        const offset = steps ?? 1;
        // 返回当前 Vector3 对象与偏移量相加后的新 Vector3 对象
        return this.add({ x: 0, y: offset, z: 0 });
    }
    ;
    /**
     * * 根据指定步数返回当前向量在x轴正方向的偏移结果
     *
     * @param {number} [steps=1] - 水平方向偏移量（可选, 默认为1）
     *
     * @returns {Vector} - 偏移后的新的 Vector 对象
     */
    east(steps) {
        /**
         * 获取偏移量
         */
        const offset = steps ?? 1;
        // 返回当前 Vector3 对象与偏移量相加后的新 Vector3 对象
        return this.add({ x: offset, y: 0, z: 0 });
    }
    ;
    /**
     * * 根据指定步数返回当前向量在z轴正方向的偏移结果
     *
     * @param {number} [steps=1] - 水平方向偏移量（可选, 默认为1）
     *
     * @returns {Vector} - 偏移后的新的 Vector 对象
     */
    north(steps) {
        /**
         * 获取偏移量
         */
        const offset = steps ?? 1;
        // 返回当前 Vector3 对象与偏移量相加后的新 Vector3 对象
        return this.add({ x: 0, y: 0, z: offset });
    }
    ;
    /**
     * * 将当前 Vector3 对象与另一个 Vector3 对象相加
     *
     * @param {server.Vector3} start - 要相加的 Vector3 对象
     *
     * @param {server.Vector3} done - 要相加的 Vector3 对象
     *
     * @returns {Vector} - 相加结果的新 Vector3 对象
     */
    static add(start, done) {
        return new Vector(start.x + done.x, start.y + done.y, start.z + done.z);
    }
    ;
    /**
     * * 将当前 Vector3 对象与另一个 Vector3 对象相加
     *
     * @param {server.Vector3} sample - 要相加的 Vector3 对象
     *
     * @returns {Vector} - 相加结果的新 Vector3 对象
     */
    add(sample) {
        return new Vector(sample.x + this.x, sample.y + this.y, sample.z + this.z);
    }
    ;
    /**
     * * 从 Vector3 对象中减去另一个 Vector3 对象
     *
     * @param {server.Vector3} start - 被减去的 Vector3 对象
     *
     * @param {server.Vector3} done - 要减去的 Vector3 对象
     *
     * @returns {Vector} - 减法结果的新 Vector 对象
     */
    static subtract(start, done) {
        return new Vector(start.x - done.x, start.y - done.y, start.z - done.z);
    }
    ;
    /**
     * * 从当前 Vector3 对象中减去另一个 Vector3 对象
     *
     * @param {server.Vector3} sample - 要减去的 Vector3 对象
     *
     * @returns {Vector} - 减法结果的新 Vector 对象
     */
    subtract(sample) {
        return new Vector(this.x - sample.x, this.y - sample.y, this.z - sample.z);
    }
    ;
    /**
     * * 将 Vector3 对象的每个分量乘以一个标量
     *
     * @param {server.Vector3} vector - 向量对象
     *
     * @param {number} scale - 用于缩放的标量值
     *
     * @returns {Vector} - 缩放后的新 Vector 对象
     */
    static multiply(vector, scale) {
        return new Vector(vector.x * scale, vector.y * scale, vector.z * scale);
    }
    ;
    /**
     * * 将当前 Vector 对象的每个分量乘以一个标量
     *
     * @param {number} scale - 用于缩放的标量值
     *
     * @returns {Vector} - 缩放后的新 Vector 对象
     */
    multiply(scale) {
        return new Vector(this.x * scale, this.y * scale, this.z * scale);
    }
    ;
    /**
     * * 计算 Vector3 对象与另一个 Vector3 对象的点积
     *
     * @param {server.Vector3} start - 要计算点积的 Vector3 对象
     *
     * @param {server.Vector3} done - 要计算点积的 Vector3 对象
     *
     * @returns {number} - 两个向量的点积结果
     */
    static dot(start, done) {
        return start.x * done.x + start.y * done.y + start.z * done.z;
    }
    ;
    /**
     * 计算当前 Vector3 对象与另一个 Vector3 对象的点积
     *
     * @param {server.Vector3} sample - 要计算点积的 Vector3 对象
     *
     * @returns {number} - 两个向量的点积结果
     */
    dot(sample) {
        return this.x * sample.x + this.y * sample.y + this.z * sample.z;
    }
    ;
    /**
     * * 计算 Vector3 对象与另一个 Vector3 对象的叉积
     *
     * @param {server.Vector3} start - 要计算叉积的 Vector3 对象
     *
     * @param {server.Vector3} done - 要计算叉积的 Vector3 对象
     *
     * @returns {server.Vector3} - 两个向量的叉积结果
     */
    static cross(start, done) {
        return new Vector(start.y * done.z - start.z * done.y, start.z * done.x - start.x * done.z, start.x * done.y - start.y * done.x);
    }
    ;
    /**
     * * 计算当前 Vector3 对象与另一个 Vector3 对象的叉积
     *
     * @param {server.Vector3} done - 要计算叉积的 Vector3 对象
     *
     * @returns {Vector} - 两个向量的叉积结果
     */
    cross(done) {
        return new Vector(this.y * done.z - this.z * done.y, this.z * done.x - this.x * done.z, this.x * done.y - this.y * done.x);
    }
    ;
    /**
     * * 将 Vector3 对象的每个分量除以一个标量
     *
     * @param {server.Vector3} vector - 进行除法计算的 Vector3 对象
     *
     * @param {number} divisor - 用于除法的标量值
     *
     * @returns {Vector} - 除法结果的新 Vector3 对象
     */
    static division(vector, divisor) {
        if (divisor === 0)
            return new Vector(vector.x, vector.y, vector.z);
        return new Vector(vector.x / divisor, vector.y / divisor, vector.z / divisor);
    }
    ;
    /**
     * 将当前 Vector3 对象的每个分量除以一个标量
     *
     * @param {number} divisor - 用于除法的标量值
     *
     * @returns {Vector} - 除法结果的新 Vector3 对象
     */
    division(divisor) {
        if (divisor === 0)
            return this;
        return new Vector(this.x / divisor, this.y / divisor, this.z / divisor);
    }
    ;
    /**
     * * 获取 Vector3 对象的模（长度）
     *
     * @param {server.Vector3} vector - 进行计算的 Vector3 对象
     *
     * @returns {number} - 向量的模
     */
    static magnitude(vector) {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
    }
    ;
    /**
     * * 获取当前 Vector3 对象的模（长度）
     *
     * @returns {number} 向量的模
     */
    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
    ;
    /**
     * * 计算 Vector3 对象与另一个 Vector3 对象之间的距离
     *
     * @param {server.Vector3} start - 要计算距离的 Vector3 对象
     *
     * @param {server.Vector3} done - 要计算距离的 Vector3 对象
     *
     * @returns {number} - 两个向量之间的距离
     */
    static distance(start, done) {
        return this.magnitude(this.subtract(start, done));
    }
    ;
    /**
     * * 计算当前 Vector3 对象与另一个 Vector3 对象之间的距离
     *
     * @param {server.Vector3} vector - 要计算距离的 Vector3 对象
     *
     * @returns {number} - 两个向量之间的距离
     */
    distance(vector) {
        return Vector.magnitude(this.subtract(vector));
    }
    ;
    /**
     * * 获取 Vector3 对象的归一化向量
     *
     * @param {server.Vector3} vector - 进行计算的 Vector3 对象
     *
     * @returns {server.Vector3} - 计算后的向量对象
     */
    static normalize(vector) {
        /**
         * * 计算向量模长
         */
        const mag = this.magnitude(vector);
        return new Vector(vector.x / mag, vector.y / mag, vector.z / mag);
    }
    ;
    /**
     * * 获取当前 Vector3 对象的归一化向量
     *
     * @returns {Vector} 归一化的单位向量
     */
    get normalize() {
        /**
         * * 计算向量模长
         */
        const mag = this.magnitude;
        return new Vector(this.x / mag, this.y / mag, this.z / mag);
    }
    ;
    /**
     * * 将 Vector3 对象的每个分量向下取整到指定的小数位数
     *
     * @param {server.Vector3} vector - 进行计算的 Vector3 对象
     *
     * @param {number} decimals - 小数位数, 默认为 2
     *
     * @returns {Vector} - 取整后的新 Vector 对象
     */
    static floor(vector, decimals = 2) {
        /**
         * * 获取乘数
         */
        const multiplier = Math.pow(10, decimals);
        return new Vector(Math.floor(vector.x * multiplier) / multiplier, Math.floor(vector.y * multiplier) / multiplier, Math.floor(vector.z * multiplier) / multiplier);
    }
    ;
    /**
     * * 将当前 Vector3 对象的每个分量向下取整到指定的小数位数
     *
     * @param {number} decimals - 小数位数, 默认为 2
     *
     * @returns {Vector} - 取整后的新 Vector 对象
     */
    floor(decimals = 2) {
        /**
         * * 获取乘数
         */
        const multiplier = Math.pow(10, decimals);
        return new Vector(Math.floor(this.x * multiplier) / multiplier, Math.floor(this.y * multiplier) / multiplier, Math.floor(this.z * multiplier) / multiplier);
    }
    ;
    /**
     * * 将 Vector3 对象转换为字符串
     *
     * @param {server.Vector3 | server.Vector2} [vector] - 向量对象
     *
     * @param {VECTOR_STRING_OPTIONS} [options] - 字符串化选项
     *
     * @returns {string} - 向量的字符串表示
     */
    static toString(vector, options) {
        /**
         * * 默认小数位数
         */
        const decimals = options?.decimals ?? 2;
        /**
         * * 向量 分隔字符串
         */
        const delimiter = options?.delimiter ?? ', ';
        /**
         * * 根据向量的类型, 获取不同的属性
         */
        const components = 'z' in vector
            ? [vector.x.toFixed(decimals), vector.y.toFixed(decimals), vector.z.toFixed(decimals)]
            : [vector.x.toFixed(decimals), vector.y.toFixed(decimals)];
        // 将向量组件连接成字符串
        return components.join(delimiter);
    }
    ;
    /**
     * * 将当前 Vector3 对象转换为字符串
     *
     * @param {type.VECTOR_STRING_OPTIONS} [options] - 字符串化选项
     *
     * @returns {string} - 向量的字符串表示
     */
    toString(options) {
        /**
         * * 默认小数位数
         */
        const decimals = options?.decimals ?? 2;
        /**
         * * 向量 分隔字符串
         */
        const delimiter = options?.delimiter ?? ', ';
        /**
         * * 转为 字符串 数组
         */
        const components = [this.x.toFixed(decimals), this.y.toFixed(decimals), this.z.toFixed(decimals)];
        // 将向量组件连接成字符串
        return components.join(delimiter);
    }
    ;
    /**
     * * 将 Vector3 对象的每个分量限制在指定的范围内
     *
     * @param {server.Vector3} [vector] - 进行计算的 Vector3 对象
     *
     * @param {VECTOR_LIMITS} [limits] - 包含最小值和最大值的对象
     *
     * @returns {Vector} - 计算后的新 Vector 对象
     */
    static clamp(vector, limits) {
        return new Vector(Clamp({ min: limits?.min?.x ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.x ?? Number.MAX_SAFE_INTEGER }, vector.x), Clamp({ min: limits?.min?.y ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.y ?? Number.MAX_SAFE_INTEGER }, vector.y), Clamp({ min: limits?.min?.z ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.z ?? Number.MAX_SAFE_INTEGER }, vector.z));
    }
    ;
    /**
     * * 将当前 Vector3 对象的每个分量限制在指定的范围内
     *
     * @param {type.VECTOR_LIMITS} [limits] - 包含最小值和最大值的对象
     *
     * @returns {Vector} - 计算后的新 Vector 对象
     */
    clamp(limits) {
        return new Vector(Clamp({ min: limits?.min?.x ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.x ?? Number.MAX_SAFE_INTEGER }, this.x), Clamp({ min: limits?.min?.y ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.y ?? Number.MAX_SAFE_INTEGER }, this.y), Clamp({ min: limits?.min?.z ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.z ?? Number.MAX_SAFE_INTEGER }, this.z));
    }
    ;
    /**
     * * 向量 线性插值
     *
     * @param {server.Vector3} start - 向量对象
     *
     * @param {server.Vector3} done - 向量对象
     *
     * @param {number} time - 时间系数
     *
     * @returns {server.Vector3} - 计算后的向量对象
     */
    static lerp(start, done, time) {
        return new Vector(start.x + (done.x - start.x) * time, start.y + (done.y - start.y) * time, start.z + (done.z - start.z) * time);
    }
    ;
    /**
     * * 向量 球面线性插值
     *
     * @param {server.Vector3} start - 向量对象
     *
     * @param {server.Vector3} done - 向量对象
     *
     * @param {number} time - 时间系数
     *
     * @returns {server.Vector3} - 计算后的向量对象
     */
    static slerp(start, done, time) {
        /**
         * * 计算两个向量点积
         */
        const angleCosine = this.dot(start, done);
        /**
         * * 确保角度余弦值在 [-1, 1] 区间内
         */
        const safeAngleCosine = Math.min(Math.max(angleCosine, -1), 1);
        /**
         * * 计算角度余弦值
         */
        const angleTheta = Math.acos(safeAngleCosine);
        /**
         * * 计算角度正弦值
         */
        const angleSin = Math.sin(angleTheta);
        /**
         * * 处理几乎平行的向量
         */
        if (Math.abs(angleSin) < Number.EPSILON)
            return start;
        /**
         * * 计算插值比例 对应 vectorA
         */
        const ratioA = Math.sin((1.0 - time) * angleTheta) / angleSin;
        /**
         * * 计算插值比例 对应 vectorB
         */
        const ratioB = Math.sin(time * angleTheta) / angleSin;
        // 根据插值比例对两个向量进行缩放, 然后相加得到插值结果
        return this.add(this.multiply(start, ratioA), this.multiply(done, ratioB));
    }
    ;
    /**
     * * 在 Vector3 对象和另一个 Vector3 对象之间随机生成一个向量
     *
     * @param {server.Vector3} start - 进行计算的 Vector3 对象
     *
     * @param {server.Vector3} done - 进行计算的 Vector3 对象
     *
     * @returns {Vector} - 计算后的 Vector 对象
     */
    static rangeRandom(start, done) {
        /**
         * * 获取两个向量范围
         */
        const range = new server.BlockVolume(start, done);
        /**
         * * 向量空间 的 最小值顶点
         */
        const min = range.getMin();
        /**
         * * 向量空间 的 最大值顶点
         */
        const max = range.getMax();
        // 随机生成一个向量
        return new Vector(RandomFloat(min.x, max.x), RandomFloat(min.y, max.y), RandomFloat(min.z, max.z));
    }
    ;
    /**
     * 在当前 Vector3 对象和另一个 Vector3 对象之间随机生成一个向量
     *
     * @param {server.Vector3} done - 另一个 Vector3 对象
     *
     * @returns {Vector} - 计算后的 Vector 对象
     */
    rangeRandom(done) {
        /**
         * 创建一个 BlockVolume 对象, 表示从当前向量到目标向量的范围
         */
        const range = new server.BlockVolume(this, done);
        /**
         * 获取 BlockVolume 的最小顶点坐标
         */
        const min = range.getMin();
        /**
         * 获取 BlockVolume 的最大顶点坐标
         */
        const max = range.getMax();
        return new Vector(RandomFloat(min.x, max.x), RandomFloat(min.y, max.y), RandomFloat(min.z, max.z));
    }
    ;
    /**
     * * 在指定锚点周围生成一个随机向量
     *
     * @param {server.Vector3} [anchor] - 基准位置坐标
     *
     * @param {number} [range] - 随机偏移范围（每个轴的偏移值在 [-range, +range] 之间）
     *
     * @param {server.Vector3} [offset] - 偏移量（默认为 { x: 0, y: 0, z: 0 }）
     *
     * @returns {Vector} - 计算后的 Vector 对象
     */
    static random(anchor, range, offset = Vector.CONSTANT_ZERO) {
        return Vector.add(anchor, { x: RandomFloat(-range, range), y: RandomFloat(-range, range), z: RandomFloat(-range, range) }).add(offset);
    }
    ;
    /**
     * * 在当前位置周围生成一个随机向量
     *
     * @param {number} range - 随机偏移范围（每个轴的偏移值在 [-range, +range] 之间）
     *
     * @param {server.Vector3} [offset] - 偏移量（默认为 { x: 0, y: 0, z: 0 }）
     *
     * @returns {Vector} - 计算后的 Vector 对象
     */
    random(range, offset = Vector.CONSTANT_ZERO) {
        return Vector.add(this, { x: RandomFloat(-range, range), y: RandomFloat(-range, range), z: RandomFloat(-range, range) }).add(offset);
        ;
    }
    ;
    /**
     * * 计算 Vector3 对象与另一个 Vector3 对象之间的归一化差向量
     *
     * @param {server.Vector3} start - 进行计算的 Vector3 对象
     *
     * @param {server.Vector3} done - 进行计算的 Vector3 对象
     *
     * @returns {Vector} - 归一化后的差向量
     */
    static difference(start, done) {
        /**
         * * 计算 两个向量 的 基本向量
         */
        const direction = this.subtract(done, start);
        // 返回 归一化后 的 差向量
        return this.normalize(direction);
    }
    ;
    /**
     * * 计算当前 Vector3 对象与另一个 Vector3 对象之间的归一化差向量
     *
     * @param {Vector} done - 进行计算的 Vector3 对象
     *
     * @returns {Vector} - 归一化后的差向量
     */
    difference(done) {
        /**
         * 计算差向量
         */
        const direction = done.subtract(this);
        return Vector.normalize(direction);
    }
    ;
    /**
     * 在指定位置和维度内随机获取最高块的中心坐标
     *
     * @param {type.LOCATION_AND_DIMENSION} source - 包含位置和维度的对象
     *
     * @param {number} [range=8] - 随机偏移的范围, 默认值为8
     *
     * @returns {server.Vector3} 返回最高块的中心坐标, 如果无法找到最高块, 则返回源位置
     */
    static randomTopmostBlock(source, range = 8) {
        /**
         * * 随机偏移坐标
         */
        const offset = Vector.add(source.location, { x: RandomFloor(-range, range), y: 0, z: RandomFloor(-range, range) });
        // 输出 随机有效坐标
        return source.dimension.getTopmostBlock(offset)?.above(1)?.center() ?? source.location;
    }
    ;
    /**
     * * 基于 实体旋转 获取 指向信息 的 3轴矢量
     *
     * @param {server.Vector2} rotate - 实体旋转的 2轴矢量
     */
    static AngleToPlace(rotate) {
        /**
         * * 旋转角度(俯仰角)
         */
        const ry = -rotate.y * Math.PI / 180;
        /**
         * * 旋转角度(偏航角)
         */
        const rx = -rotate.x * Math.PI / 180;
        /**
         * * x 轴分量
         */
        const x = Math.sin(ry) * Math.cos(rx);
        /**
         * * Y 轴分量
         */
        const y = Math.sin(rx);
        /**
         * * Z 轴分量
         */
        const z = Math.cos(ry) * Math.cos(rx);
        // 返回指向的三维向量
        return { x, y, z };
    }
    ;
    /**
     * 将三维方向向量转换为实体旋转角度（基于Minecraft坐标系规则）
     *
     * @param {server.Vector3} direction - 标准化后的三维方向向量
     *
     * @returns {server.Vector2} 实体旋转角度（pitch/x轴, yaw/y轴）
     */
    static Vector3ToAngle(direction) {
        /**
         * 计算水平面投影长度
         */
        const horizontalDist = Math.sqrt(direction.x ** 2 + direction.z ** 2);
        /**
         * 计算偏航角（yaw）调整参数顺序和符号
         */
        let yaw = Math.atan2(-direction.x, direction.z) * (180 / Math.PI);
        /**
         * 计算俯仰角（pitch）并取反（Minecraft向下为正方向）
         */
        let pitch = -Math.atan2(direction.y, horizontalDist) * (180 / Math.PI);
        // 处理极端情况（垂直方向）
        if (isNaN(pitch)) {
            pitch = direction.y > 0 ? -90 : 90; // 符号与原始计算相反
        }
        // 规范yaw到[-180, 180]范围
        yaw = ((yaw + 180) % 360 + 360) % 360 - 180;
        // 返回实体旋转角度
        return { x: pitch, y: yaw };
    }
    ;
    /**
     * * 计算 目标方向相关 的 方向向量集
     *
     * @param {server.Vector3} front - 前方 方向向量
     *
     * @returns {VECTOR_DIRECTIONS} - 包含计算出的方向向量的对象
     */
    static directions(front) {
        /**
         * * 定义 常量 向量
         */
        const sample = this.CONSTANT_UP;
        /**
         * * 后方 方向向量
         */
        const back = this.normalize(this.multiply(front, -1));
        /**
         * * 右方 方向向量
         */
        const right = this.normalize(this.cross(front, sample));
        /**
         * * 左方 方向向量
         */
        const left = this.normalize(this.multiply(right, -1));
        /**
         * * 下方 方向向量
         */
        const down = this.normalize(this.cross(front, right));
        /**
         * * 上方 方向向量
         */
        const above = this.normalize(this.multiply(down, -1));
        // 返回计算结果
        return { front, back, left, right, above, down };
    }
    ;
    /**
     * * 计算 目标方向相关 的 坐标偏移
     *
     * @param {server.Vector3} source - 进行计算的源坐标
     *
     * @param {server.Vector3} front - 前方向向量
     *
     * @param {VECTOR_RELATIVE_OFFSET} offset - 偏移量
     *
     * @returns {server.Vector3} - 计算后的坐标
     */
    static relativeOffset(source, front, offset) {
        /**
         * * 计算 方向向量集
         */
        const directions = this.directions(front);
        /**
         * * 计算 前方偏移量
         */
        const frontScale = this.multiply(front, offset.front);
        /**
         * * 计算 右方偏移量
         */
        const rightScale = this.multiply(directions.right, offset.right);
        /**
         * * 计算 上方偏移量
         */
        const upScale = this.multiply(directions.above, offset.above);
        // 返回偏移量
        return this.add(source, this.add(frontScale, this.add(upScale, rightScale)));
    }
    ;
    /**
     * * 提前量计算
     *
     * @param {server.Vector3} posA - 点 A 的位置
     *
     * @param {server.Vector3} posB - 点 B 的位置
     *
     * @param {number} speedA - A 发射的直线弹射物的速率
     *
     * @param {server.Vector3} velB - B 的速度
     *
     * @returns {server.Vector3} - A 发射的直线弹射物的速度
     */
    static calculateLeadVelocity(posA, posB, speedA, velB) {
        /**
         * * 计算 向量BA
         */
        const vecBA = this.subtract(posB, posA);
        /**
         * * 计算 向量BA的归一化向量
         */
        const normVecBA = this.normalize(vecBA);
        /**
         * * 计算 向量BA与速度B的点积
         */
        const compVbBA = this.dot(velB, normVecBA);
        /**
         * * 计算 向量BA与归一化B的垂直分量
         */
        const vbAlongBA = this.multiply(normVecBA, compVbBA);
        /**
         * * 计算 向量BA与速度B的垂直分量
         */
        const perpCompVa = this.subtract(velB, vbAlongBA);
        /**
         * * 计算 向量BA与速度A的垂直分量
         */
        const magVaBA = Math.sqrt(speedA * speedA - this.dot(perpCompVa, perpCompVa));
        // 如果A的发射速度在BA方向上的分量为负数, 则返回速度B的垂直分量
        if (magVaBA <= 0)
            return perpCompVa;
        /**
         * * 计算 A 发射的直线弹射物的速度向量
         */
        const vaAlongBA = this.multiply(normVecBA, -magVaBA);
        // 计算最终的速度向量（A的发射速度）
        return this.add(perpCompVa, vaAlongBA);
    }
    ;
    /**
     * * 获取区块坐标
     *
     * @param {server.Vector3} vector - 计算前的原始坐标
     *
     * @param {boolean} Yzero - 是否将 Y轴 的值设置为 0
     *
     * @param {number} size - 区块大小
     *
     * @returns {server.Vector3} - 计算后的区块坐标
     */
    static chunkLocation(vector, Yzero = true, size = 16) {
        /**
         * * 计算 Y轴 的值
         */
        const y = Yzero ? 0 : vector.y;
        // 返回计算结果
        return new Vector(Math.floor(vector.x / size) * size, y, Math.floor(vector.z / size) * size);
    }
    ;
}
;
/**
 * * Minecraft 调色板基类 (RGB格式 0-255 取值区间 转 0-1 取值区间)
 */
class MinecraftColorBase {
    red;
    green;
    blue;
    /** Minecraft 颜色类 */
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.red = red / 255;
        this.green = green / 255;
        this.blue = blue / 255;
    }
    ;
    /** 获取十六进制表示 */
    get hex() {
        return `#${[Math.round(this.red * 255), Math.round(this.green * 255), Math.round(this.blue * 255)].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    }
    ;
    /**
     * 计算两个 RGB 颜色之间的距离
     *
     * @param {server.RGB} color1 - 第一个颜色 (RGB格式, 0-1取值区间)
     *
     * @param {server.RGB} color2 - 第二个颜色 (RGB格式, 0-1取值区间)
     *
     * @returns {number} - 两个颜色之间的欧几里得距离
     */
    static distance(color1, color2) {
        /**
         * rgb(255, 0, 0) - 计算红色通道差值
         */
        const deltaR = Math.round(color1.red * 255) - Math.round(color2.red * 255);
        /**
         * rgb(0, 255, 0) - 计算绿色通道差值
         */
        const deltaG = Math.round(color1.green * 255) - Math.round(color2.green * 255);
        /**
         * rgb(0, 0, 255) - 计算蓝色通道差值
         */
        const deltaB = Math.round(color1.blue * 255) - Math.round(color2.blue * 255);
        // 计算欧几里得距离
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    }
    ;
    /**
     * 获取两个 RGB 颜色之间的距离
     *
     * @param {server.RGB} color - 需要计算的颜色 (RGB格式, 0-1取值区间)
     *
     * @returns {number} - 两个颜色之间的欧几里得距离
     */
    distance(color) {
        /**
         * rgb(255, 0, 0) - 计算红色通道差值
         */
        const deltaR = Math.round(this.red * 255) - Math.round(color.red * 255);
        /**
         * rgb(0, 255, 0) - 计算绿色通道差值
         */
        const deltaG = Math.round(this.green * 255) - Math.round(color.green * 255);
        /**
         * rgb(0, 0, 255) - 计算蓝色通道差值
         */
        const deltaB = Math.round(this.blue * 255) - Math.round(color.blue * 255);
        // 计算欧几里得距离
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    }
    ;
    /**
     * 判断两个 RGB 颜色是否相等
     *
     * @param {server.RGB} color1 - 第一个颜色 (RGB格式, 0-1取值区间)
     *
     * @param {server.RGB} color2 - 第二个颜色 (RGB格式, 0-1取值区间)
     *
     * @returns {boolean} - 两个颜色是否相等
     */
    static equals(color1, color2) {
        return MinecraftColorBase.distance(color1, color2) < 1;
    }
    ;
    /**
     * 判断两个 RGB 颜色是否相等
     *
     * @param color - 需要判断的颜色 (RGB格式, 0-1取值区间)
     *
     * @returns {boolean} - 两个颜色是否相等
     */
    equals(color) {
        return this.distance(color) < 1;
    }
    ;
    /**
     * 获取实体的 RGB 颜色信息
     *
     * @param {server.Entity} target - 用于获取颜色信息的实体对象
     *
     * @returns {MinecraftColor} - 返回 经过数据转换后的 颜色对象
     */
    static getEntityColor(target) {
        /**
         * rgb(255, 0, 0) - 获取 红色通道 参数
         */
        const entityColorR = target.getProperty('property:color_r');
        /**
         * rgb(0, 255, 0) - 获取 绿色通道 参数
         */
        const entityColorG = target.getProperty('property:color_g');
        /**
         * rgb(0, 0, 255) - 获取 蓝色通道 参数
         */
        const entityColorB = target.getProperty('property:color_b');
        // 返回 经过数据转换后的 颜色对象
        return new MinecraftColorBase((entityColorR ?? 0.5) * 255, (entityColorG ?? 0.5) * 255, (entityColorB ?? 0.5) * 255);
    }
    ;
}
;
/**
 * * Minecraft 调色板 (RGB格式 0-255 取值区间 转 0-1 取值区间)
 */
class MinecraftColor extends MinecraftColorBase {
    /**
     * 白色 (White) #F0F0F0
     */
    static WHITE = new this(240, 240, 240);
    /**
     * 浅灰色 (Light Gray) #9D9D97
     */
    static LIGHT_GRAY = new this(157, 157, 151);
    /**
     * 灰色 (Gray) #474F52
     */
    static GRAY = new this(71, 79, 82);
    /**
     * 黑色 (Black) #1D1D21
     */
    static BLACK = new this(29, 29, 33);
    /**
     * 棕色 (Brown) #835432
     */
    static BROWN = new this(131, 84, 50);
    /**
     * 红色 (Red) #B02E26
     */
    static RED = new this(176, 46, 38);
    /**
     * 橙色 (Orange) #F9801D
     */
    static ORANGE = new this(249, 128, 29);
    /**
     * 黄色 (Yellow) #FED83D
     */
    static YELLOW = new this(254, 216, 61);
    /**
     * 黄绿色 (Lime) #80C71F
     */
    static LIME = new this(128, 199, 31);
    /**
     * 绿色 (Green) #5E7C16
     */
    static GREEN = new this(94, 124, 22);
    /**
     * 青色 (Cyan) #169C9C
     */
    static CYAN = new this(22, 156, 156);
    /**
     * 淡蓝色 (Light Blue) #3AB3DA
     */
    static LIGHT_BLUE = new this(58, 179, 218);
    /**
     * 蓝色 (Blue) #3C44AA
     */
    static BLUE = new this(60, 68, 170);
    /**
     * 紫色 (Purple) #8932B8
     */
    static PURPLE = new this(137, 50, 184);
    /**
     * 品红色 (Magenta) #C74EBD
     */
    static MAGENTA = new this(199, 78, 189);
    /**
     * 粉红色 (Pink) #F38BAA
     */
    static PINK = new this(243, 139, 170);
}
;
/**
 * * 将数值限制在指定的最小值和最大值范围内
 *
 * @param {type.Vertex} input 包含数字范围的 Vertex 对象
 *
 * @param {number} value 用于测试的数值
 *
 * @returns {number} 限制后的数值, 确保在 [range.min, range.max] 区间内
 */
function Clamp({ min, max }, value) {
    return Math.max(min, Math.min(max, value));
}
;
/**
 * * 生成指定范围内的随机整数
 *
 * @param {number} min - 范围的最小值（包含在内）
 *
 * @param {number} max - 范围的最大值（包含在内）
 *
 * @returns {number} 返回 min 和 max 之间的一个随机整数, 包括 min 和 max
 */
function RandomFloor(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
;
/**
 * * 生成一个在指定范围内的随机浮点数, 并保留指定的小数位数
 *
 * @param {number} min - 随机数范围的最小值（包含）
 *
 * @param {number} max - 随机数范围的最大值（包含）
 *
 * @param {number} length - 返回的浮点数的小数位数, 默认为2
 *
 * @returns {number} 在指定范围内的随机浮点数, 保留指定的小数位数
 */
function RandomFloat(min, max, length = 2) {
    return Number((Math.random() * (max - min) + min).toFixed(length));
}
;
/**
 * * 计算数组的中位数
 *
 * @param {number[]} numbers - 输入的数字数组
 *
 * @returns {number} - 返回数组的中位数
 */
function CalculateMedian(numbers) {
    /**
     * * 复制输入的数组并排序, 避免修改原数组
     */
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    /**
     * * 计算中位数索引
     */
    const middleIndex = Math.floor(sortedNumbers.length / 2);
    // 如果数组长度是偶数, 返回中间两个数的平均
    if (sortedNumbers.length % 2 === 0)
        return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
    // 如果数组长度是奇数, 返回中间的数
    else
        return sortedNumbers[middleIndex];
}
;
/**
 * * 计算数组中的众数
 *
 * @param {number[]} numbers - 输入的数字数组
 *
 * @returns {number[]} - 返回一个包含所有众数的数组
 */
function CalculateModes(numbers) {
    /**
     * * 用于存储数字出现的频率
     */
    const frequencyMap = new Map();
    /**
     * * 用于存储最大频率
     */
    let maxFrequency = 0;
    /**
     * * 用于存储所有众数
     */
    const modes = [];
    // 遍历数组, 统计每个数字出现的频率
    for (const number of numbers) {
        /**
         * * 获取当前数字的频率
         */
        const frequency = (frequencyMap.get(number) || 0) + 1;
        // 更新频率映射
        frequencyMap.set(number, frequency);
        // 更新最大频率
        if (frequency > maxFrequency)
            maxFrequency = frequency;
    }
    ;
    // 再次遍历频率映射, 找出所有众数
    frequencyMap.forEach((frequency, number) => {
        if (frequency === maxFrequency)
            modes.push(number);
    });
    // 返回所有众数
    return modes;
}
;
/**
 * 分析字符串权重信息, 根据权重随机选择一个字符串
 *
 * 该函数通过累积权重的方式, 将输入的字符串及其权重映射到一个随机索引上,
 *
 * 并返回随机选择的结果及其相关信息
 *
 * @param input - 输入的字符串权重映射（Map<string, number>）
 *
 * @returns {type.WEIGHT_STRING_INTEL} - 包含随机选择结果的解析信息
 */
function AnalysisStringWeight(input) {
    /**
     * 总权重, 用于计算随机索引。
     */
    let totalWeight = 0;
    /**
     * 累积权重数组, 用于快速找到随机索引对应的输出值。
     */
    const cumulativeWeights = [];
    // 遍历输入的权重信息, 填充累积权重数组
    input.forEach(weight => {
        // 计算总权重
        totalWeight += weight;
        // 填充累积权重数组
        cumulativeWeights.push(totalWeight);
    });
    /**
     * 生成一个随机索引, 范围在 0 到 totalWeight - 1 之间。
     */
    const randomIndex = RandomFloor(0, totalWeight - 1);
    /**
     * 找到第一个大于等于随机索引的累积权重, 并返回索引。
     */
    const outputIndex = cumulativeWeights.findIndex(weight => randomIndex < weight);
    /**
     * 找到对应的输出值。
     */
    const output = Array.from(input.keys())[outputIndex];
    // 返回解析结果
    return { source: Array.from(input.keys()), index: outputIndex, output };
}
;
/**
 * 分析消息权重信息, 根据权重随机选择一个消息
 *
 * 该函数通过累积权重的方式, 将输入的消息及其权重映射到一个随机索引上,
 *
 * 并返回随机选择的结果及其相关信息
 *
 * @param input - 输入的消息权重映射（Map<server.RawMessage, number>）
 *
 * @returns {type.WEIGHT_MESSAGE_INTEL} - 包含随机选择结果的解析信息
 */
function AnalysisMessageWeight(input) {
    /**
     * 总权重, 用于计算随机索引。
     */
    let totalWeight = 0;
    /**
     * 累积权重数组, 用于快速找到随机索引对应的输出值。
     */
    const cumulativeWeights = [];
    // 遍历输入的权重信息, 填充累积权重数组
    input.forEach(weight => {
        // 计算总权重
        totalWeight += weight;
        // 填充累积权重数组
        cumulativeWeights.push(totalWeight);
    });
    /**
     * 生成一个随机索引, 范围在 0 到 totalWeight - 1 之间。
     */
    const randomIndex = RandomFloor(0, totalWeight - 1);
    /**
     * 找到第一个大于等于随机索引的累积权重, 并返回索引。
     */
    const outputIndex = cumulativeWeights.findIndex(weight => randomIndex < weight);
    /**
     * 找到对应的输出值。
     */
    const output = Array.from(input.keys())[outputIndex];
    // 返回解析结果
    return { source: Array.from(input.keys()), index: outputIndex, output };
}
;
/**
 * 解析权重信息, 根据输入的键类型动态选择处理逻辑
 *
 * 该函数通过类型守卫判断输入的键类型（字符串或 RawMessage）, 并调用相应的处理函数
 *
 * @param inputMap - 输入的权重映射（Map<K, number>）, 其中 K 是字符串或 RawMessage
 *
 * @returns {type.DetermineReturnType<K>} - 根据输入键类型返回相应的解析结果
 *
 * @throws 如果输入的 Map 为空, 则抛出错误
 */
function AnalysisWeight(inputMap) {
    // 类型守卫判断
    if (inputMap.size === 0)
        throw new Error("Input map cannot be empty");
    /**
     * 通过第一个键的类型进行判断（假设所有键类型一致）。
     */
    const firstKey = Array.from(inputMap.keys())[0];
    // 类型分支处理
    if (typeof firstKey === 'string') {
        // 类型断言确保类型安全
        return AnalysisStringWeight(inputMap);
    }
    else {
        // 处理 RawMessage 类型
        return AnalysisMessageWeight(inputMap);
    }
}
;
/**
 * * 判断 是否启用
 *
 * @param {number} input - 百分比(整数)
 *
 * @returns {boolean} - 返回 是否启用
 */
function IsEnable(input) {
    // 判断 实体属性
    return RandomFloor(0, 100) <= input;
}
;
/**
 * * 在范围内寻找合适的落脚点
 *
 * @param {type.LOCATION_AND_DIMENSION} source 带有位置与维度信息的实例
 *
 * @param {number} range 最大检测范围
 *
 * @param {number} height 最小检测高度
 *
 * @param {number} limit 最大检测高度
 */
function QueryFoothold(source, range, height, limit) {
    /**
     * * 定义 输出的 坐标
     */
    let output = Vector.CONSTANT_ZERO;
    /**
     * * 设置最大循环次数 以避免无限循环
     */
    const maxRepeat = 1024;
    /**
     * * 设置 循环 的 计数值
     */
    let alpha = 1;
    // 循环 1024 次
    while (alpha > 0 && alpha <= maxRepeat) {
        // 获取 随机值
        const random0 = RandomFloor(0, 3);
        const random1 = RandomFloor(16, range);
        const random2 = RandomFloor(-range, -16);
        // 修改 着陆点 坐标
        output =
            {
                x: source.location.x + (random0 === 0 || random0 === 2 ? random1 : random2),
                y: RandomFloor(height, limit),
                z: source.location.z + (random0 === 0 || random0 === 3 ? random1 : random2)
            };
        //判定 目标点附近 的 方块类型
        const getBlock0 = source.dimension.getBlock(output);
        const getBlock1 = source.dimension.getBlock(Vector.add(output, Vector.CONSTANT_UP));
        const getBlock2 = source.dimension.getBlock(Vector.add(output, { x: 0, y: -3, z: 0 }));
        const getBlock3 = source.dimension.getBlock(Vector.add(output, { x: 8, y: -2, z: 8 }));
        const getBlock4 = source.dimension.getBlock(Vector.add(output, { x: -8, y: -4, z: -8 }));
        //测试 目标阵列 是否 满足条件
        if (getBlock0?.isAir && getBlock1?.isAir && getBlock2 && getBlock3 && getBlock4) {
            //设置 测试点参数
            const test2 = !getBlock2.isAir && !getBlock2.isLiquid;
            const test3 = !getBlock3.isAir && !getBlock3.isLiquid;
            const test4 = !getBlock4.isAir && !getBlock4.isLiquid;
            //确认 是否 满足条件
            if (test2 && test3 && test4)
                alpha = -1;
        }
        alpha++;
    }
    //达到最大循环次数 时 返回 起点 否则 返回 计算值
    return alpha == maxRepeat ? source.location : output;
}
;
/**
 * * 在范围内寻找合适的实体落脚点
 *
 * @param {server.Entity} source 带有位置与维度信息的实例
 *
 * @param {string[]} exclude 排除的实体类型
 *
 * @param {number} scale 最大检测次数
 *
 * @param {number} range 最大检测范围
 */
function QueryEntityFoothold(source, exclude, scale, range) {
    /**
     * * 实体查询参数
     */
    const options = {
        excludeTypes: [...exclude, "minecraft:player"],
        location: source.location,
        maxDistance: range,
        closest: scale
    };
    /**
     * * 获取 实体列表
     */
    const entitys = source.dimension.getEntities(options);
    // 如果 方块列表 为空 则返回 起点
    if (entitys.length < 1)
        return Vector.add(source.location, { x: 0, y: 255, z: 0 });
    /**
     * * 获取 方块列表
     */
    const blocks = entitys.map(entity => entity.dimension.getBlock(entity.location));
    // 如果 方块列表 为空 则返回 起点
    if (entitys.length < 1)
        return Vector.add(source.location, { x: 0, y: 128, z: 0 });
    /**
     * * 获取 有效方块列表
     */
    const output = blocks.filter(block => {
        // 判断 方块是否有效
        if (!block)
            return false;
        /**
         * * 获取 上方的 方块
         */
        const above = block.above();
        /**
         * * 获取 下方的 方块
         */
        const below = block.below();
        /**
         * * 获取 东方的 方块
         */
        const east = below?.east();
        /**
         * * 获取 南方的 方块
         */
        const south = below?.south();
        // 判断 方块是否有效
        if (!above?.isAir && !above?.isLiquid)
            return false;
        if (below?.isAir || below?.isLiquid)
            return false;
        if (south?.isAir || south?.isLiquid)
            return false;
        if (east?.isAir || east?.isLiquid)
            return false;
        return true;
    });
    // 排序 方块列表
    output.sort((a, b) => {
        const distance_a = Vector.distance(source.location, a.location);
        const distance_b = Vector.distance(source.location, b.location);
        return distance_a - distance_b;
    });
    // 如果 方块列表 为空 则返回 起点
    if (output.length < 1)
        return Vector.add(source.location, { x: 0, y: 64, z: 0 });
    else
        return output[0].location;
}
;
