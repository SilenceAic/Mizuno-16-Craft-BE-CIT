
import * as server from "@minecraft/server";

export { Vector, MinecraftColor, CalculateMedian, CalculateModes, AnalysisWeight, RandomFloor, RandomFloat, Clamp, IsEnable, QueryFoothold, QueryEntityFoothold };

class VectorConstant {
    
    static get CONSTANT_HALF() { return new Vector(0.5, 0.5, 0.5); }
    ;
    
    static get CONSTANT_ZERO() { return new Vector(0, 0, 0); }
    ;
    
    static get CONSTANT_UP() { return new Vector(0, 1, 0); }
    ;
    
    static get CONSTANT_DOWN() { return new Vector(0, -1, 0); }
    ;
    
    static get CONSTANT_ONE() { return new Vector(1, 1, 1); }
    ;
    
    static get CONSTANT_LOSS_ONE() { return new Vector(-1, -1, -1); }
    ;
    
    static get CONSTANT_WEST() { return new Vector(-1, 0, 0); }
    ;
    
    static get CONSTANT_EAST() { return new Vector(1, 0, 0); }
    ;
    
    static get CONSTANT_SOUTH() { return new Vector(0, 0, 1); }
    ;
    
    static get CONSTANT_NORTH() { return new Vector(0, 0, -1); }
    ;
    
    static get CONSTANT_HORIZONTAL() {
        return [
            Vector.CONSTANT_NORTH,
            Vector.CONSTANT_SOUTH,
            Vector.CONSTANT_EAST,
            Vector.CONSTANT_WEST
        ];
    }
    ;
    
    static get CONSTANT_VERTICAL() {
        return [
            Vector.CONSTANT_DOWN,
            Vector.CONSTANT_UP,
        ];
    }
    ;
    
    static get CONSTANT_ALL() {
        return [
            ...Vector.CONSTANT_VERTICAL,
            ...Vector.CONSTANT_HORIZONTAL,
        ];
    }
    ;
    
    static get CONSTANT_DOWN_HORIZONTAL() {
        return [
            Vector.CONSTANT_DOWN,
            ...Vector.CONSTANT_HORIZONTAL,
        ];
    }
    ;
}
;

class Vector extends VectorConstant {
    x;
    y;
    z;
    
    constructor(x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
    ;
    
    static createCubeLattice(scope) {
        
        const size = 2 * scope + 1;
        
        const vectors = [];
        
        for (let i = 0; i < size ** 3; i++) {
            
            const x = -scope + Math.floor(i / (size ** 2)) % size;
            
            const y = -scope + Math.floor((i / size) % size);
            
            const z = -scope + i % size;
            
            vectors.push(new Vector(x, y, z));
        }
        
        return vectors;
    }
    ;
    
    static equals(start, done) {
        return start.x === done.x && start.y === done.y && start.z === done.z;
    }
    ;
    
    equals(sample) {
        return this.x === sample.x && this.y === sample.y && this.z === sample.z;
    }
    ;
    
    static copy(vector) {
        return this.CONSTANT_ZERO.add(vector);
    }
    ;
    
    get copy() {
        return this.add(Vector.CONSTANT_ZERO);
    }
    ;
    
    above(steps) {
        
        const offset = steps ?? 1;
        
        return this.add({ x: 0, y: offset, z: 0 });
    }
    ;
    
    east(steps) {
        
        const offset = steps ?? 1;
        
        return this.add({ x: offset, y: 0, z: 0 });
    }
    ;
    
    north(steps) {
        
        const offset = steps ?? 1;
        
        return this.add({ x: 0, y: 0, z: offset });
    }
    ;
    
    static add(start, done) {
        return new Vector(start.x + done.x, start.y + done.y, start.z + done.z);
    }
    ;
    
    add(sample) {
        return new Vector(sample.x + this.x, sample.y + this.y, sample.z + this.z);
    }
    ;
    
    static subtract(start, done) {
        return new Vector(start.x - done.x, start.y - done.y, start.z - done.z);
    }
    ;
    
    subtract(sample) {
        return new Vector(this.x - sample.x, this.y - sample.y, this.z - sample.z);
    }
    ;
    
    static multiply(vector, scale) {
        return new Vector(vector.x * scale, vector.y * scale, vector.z * scale);
    }
    ;
    
    multiply(scale) {
        return new Vector(this.x * scale, this.y * scale, this.z * scale);
    }
    ;
    
    static dot(start, done) {
        return start.x * done.x + start.y * done.y + start.z * done.z;
    }
    ;
    
    dot(sample) {
        return this.x * sample.x + this.y * sample.y + this.z * sample.z;
    }
    ;
    
    static cross(start, done) {
        return new Vector(start.y * done.z - start.z * done.y, start.z * done.x - start.x * done.z, start.x * done.y - start.y * done.x);
    }
    ;
    
    cross(done) {
        return new Vector(this.y * done.z - this.z * done.y, this.z * done.x - this.x * done.z, this.x * done.y - this.y * done.x);
    }
    ;
    
    static division(vector, divisor) {
        if (divisor === 0)
            return new Vector(vector.x, vector.y, vector.z);
        return new Vector(vector.x / divisor, vector.y / divisor, vector.z / divisor);
    }
    ;
    
    division(divisor) {
        if (divisor === 0)
            return this;
        return new Vector(this.x / divisor, this.y / divisor, this.z / divisor);
    }
    ;
    
    static magnitude(vector) {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
    }
    ;
    
    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
    ;
    
    static distance(start, done) {
        return this.magnitude(this.subtract(start, done));
    }
    ;
    
    distance(vector) {
        return Vector.magnitude(this.subtract(vector));
    }
    ;
    
    static normalize(vector) {
        
        const mag = this.magnitude(vector);
        return new Vector(vector.x / mag, vector.y / mag, vector.z / mag);
    }
    ;
    
    get normalize() {
        
        const mag = this.magnitude;
        return new Vector(this.x / mag, this.y / mag, this.z / mag);
    }
    ;
    
    static floor(vector, decimals = 2) {
        
        const multiplier = Math.pow(10, decimals);
        return new Vector(Math.floor(vector.x * multiplier) / multiplier, Math.floor(vector.y * multiplier) / multiplier, Math.floor(vector.z * multiplier) / multiplier);
    }
    ;
    
    floor(decimals = 2) {
        
        const multiplier = Math.pow(10, decimals);
        return new Vector(Math.floor(this.x * multiplier) / multiplier, Math.floor(this.y * multiplier) / multiplier, Math.floor(this.z * multiplier) / multiplier);
    }
    ;
    
    static toString(vector, options) {
        
        const decimals = options?.decimals ?? 2;
        
        const delimiter = options?.delimiter ?? ', ';
        
        const components = 'z' in vector
            ? [vector.x.toFixed(decimals), vector.y.toFixed(decimals), vector.z.toFixed(decimals)]
            : [vector.x.toFixed(decimals), vector.y.toFixed(decimals)];
        
        return components.join(delimiter);
    }
    ;
    
    toString(options) {
        
        const decimals = options?.decimals ?? 2;
        
        const delimiter = options?.delimiter ?? ', ';
        
        const components = [this.x.toFixed(decimals), this.y.toFixed(decimals), this.z.toFixed(decimals)];
        
        return components.join(delimiter);
    }
    ;
    
    static clamp(vector, limits) {
        return new Vector(Clamp({ min: limits?.min?.x ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.x ?? Number.MAX_SAFE_INTEGER }, vector.x), Clamp({ min: limits?.min?.y ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.y ?? Number.MAX_SAFE_INTEGER }, vector.y), Clamp({ min: limits?.min?.z ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.z ?? Number.MAX_SAFE_INTEGER }, vector.z));
    }
    ;
    
    clamp(limits) {
        return new Vector(Clamp({ min: limits?.min?.x ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.x ?? Number.MAX_SAFE_INTEGER }, this.x), Clamp({ min: limits?.min?.y ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.y ?? Number.MAX_SAFE_INTEGER }, this.y), Clamp({ min: limits?.min?.z ?? Number.MIN_SAFE_INTEGER, max: limits?.max?.z ?? Number.MAX_SAFE_INTEGER }, this.z));
    }
    ;
    
    static lerp(start, done, time) {
        return new Vector(start.x + (done.x - start.x) * time, start.y + (done.y - start.y) * time, start.z + (done.z - start.z) * time);
    }
    ;
    
    static slerp(start, done, time) {
        
        const angleCosine = this.dot(start, done);
        
        const safeAngleCosine = Math.min(Math.max(angleCosine, -1), 1);
        
        const angleTheta = Math.acos(safeAngleCosine);
        
        const angleSin = Math.sin(angleTheta);
        
        if (Math.abs(angleSin) < Number.EPSILON)
            return start;
        
        const ratioA = Math.sin((1.0 - time) * angleTheta) / angleSin;
        
        const ratioB = Math.sin(time * angleTheta) / angleSin;
        
        return this.add(this.multiply(start, ratioA), this.multiply(done, ratioB));
    }
    ;
    
    static rangeRandom(start, done) {
        
        const range = new server.BlockVolume(start, done);
        
        const min = range.getMin();
        
        const max = range.getMax();
        
        return new Vector(RandomFloat(min.x, max.x), RandomFloat(min.y, max.y), RandomFloat(min.z, max.z));
    }
    ;
    
    rangeRandom(done) {
        
        const range = new server.BlockVolume(this, done);
        
        const min = range.getMin();
        
        const max = range.getMax();
        return new Vector(RandomFloat(min.x, max.x), RandomFloat(min.y, max.y), RandomFloat(min.z, max.z));
    }
    ;
    
    static random(anchor, range, offset = Vector.CONSTANT_ZERO) {
        return Vector.add(anchor, { x: RandomFloat(-range, range), y: RandomFloat(-range, range), z: RandomFloat(-range, range) }).add(offset);
    }
    ;
    
    random(range, offset = Vector.CONSTANT_ZERO) {
        return Vector.add(this, { x: RandomFloat(-range, range), y: RandomFloat(-range, range), z: RandomFloat(-range, range) }).add(offset);
        ;
    }
    ;
    
    static difference(start, done) {
        
        const direction = this.subtract(done, start);
        
        return this.normalize(direction);
    }
    ;
    
    difference(done) {
        
        const direction = done.subtract(this);
        return Vector.normalize(direction);
    }
    ;
    
    static randomTopmostBlock(source, range = 8) {
        
        const offset = Vector.add(source.location, { x: RandomFloor(-range, range), y: 0, z: RandomFloor(-range, range) });
        
        return source.dimension.getTopmostBlock(offset)?.above(1)?.center() ?? source.location;
    }
    ;
    
    static AngleToPlace(rotate) {
        
        const ry = -rotate.y * Math.PI / 180;
        
        const rx = -rotate.x * Math.PI / 180;
        
        const x = Math.sin(ry) * Math.cos(rx);
        
        const y = Math.sin(rx);
        
        const z = Math.cos(ry) * Math.cos(rx);
        
        return { x, y, z };
    }
    ;
    
    static Vector3ToAngle(direction) {
        
        const horizontalDist = Math.sqrt(direction.x ** 2 + direction.z ** 2);
        
        let yaw = Math.atan2(-direction.x, direction.z) * (180 / Math.PI);
        
        let pitch = -Math.atan2(direction.y, horizontalDist) * (180 / Math.PI);
        
        if (isNaN(pitch)) {
            pitch = direction.y > 0 ? -90 : 90; 
        }
        
        yaw = ((yaw + 180) % 360 + 360) % 360 - 180;
        
        return { x: pitch, y: yaw };
    }
    ;
    
    static directions(front) {
        
        const sample = this.CONSTANT_UP;
        
        const back = this.normalize(this.multiply(front, -1));
        
        const right = this.normalize(this.cross(front, sample));
        
        const left = this.normalize(this.multiply(right, -1));
        
        const down = this.normalize(this.cross(front, right));
        
        const above = this.normalize(this.multiply(down, -1));
        
        return { front, back, left, right, above, down };
    }
    ;
    
    static relativeOffset(source, front, offset) {
        
        const directions = this.directions(front);
        
        const frontScale = this.multiply(front, offset.front);
        
        const rightScale = this.multiply(directions.right, offset.right);
        
        const upScale = this.multiply(directions.above, offset.above);
        
        return this.add(source, this.add(frontScale, this.add(upScale, rightScale)));
    }
    ;
    
    static calculateLeadVelocity(posA, posB, speedA, velB) {
        
        const vecBA = this.subtract(posB, posA);
        
        const normVecBA = this.normalize(vecBA);
        
        const compVbBA = this.dot(velB, normVecBA);
        
        const vbAlongBA = this.multiply(normVecBA, compVbBA);
        
        const perpCompVa = this.subtract(velB, vbAlongBA);
        
        const magVaBA = Math.sqrt(speedA * speedA - this.dot(perpCompVa, perpCompVa));
        
        if (magVaBA <= 0)
            return perpCompVa;
        
        const vaAlongBA = this.multiply(normVecBA, -magVaBA);
        
        return this.add(perpCompVa, vaAlongBA);
    }
    ;
    
    static chunkLocation(vector, Yzero = true, size = 16) {
        
        const y = Yzero ? 0 : vector.y;
        
        return new Vector(Math.floor(vector.x / size) * size, y, Math.floor(vector.z / size) * size);
    }
    ;
}
;

class MinecraftColorBase {
    red;
    green;
    blue;
    
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.red = red / 255;
        this.green = green / 255;
        this.blue = blue / 255;
    }
    ;
    
    get hex() {
        return `#${[Math.round(this.red * 255), Math.round(this.green * 255), Math.round(this.blue * 255)].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    }
    ;
    
    static distance(color1, color2) {
        
        const deltaR = Math.round(color1.red * 255) - Math.round(color2.red * 255);
        
        const deltaG = Math.round(color1.green * 255) - Math.round(color2.green * 255);
        
        const deltaB = Math.round(color1.blue * 255) - Math.round(color2.blue * 255);
        
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    }
    ;
    
    distance(color) {
        
        const deltaR = Math.round(this.red * 255) - Math.round(color.red * 255);
        
        const deltaG = Math.round(this.green * 255) - Math.round(color.green * 255);
        
        const deltaB = Math.round(this.blue * 255) - Math.round(color.blue * 255);
        
        return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
    }
    ;
    
    static equals(color1, color2) {
        return MinecraftColorBase.distance(color1, color2) < 1;
    }
    ;
    
    equals(color) {
        return this.distance(color) < 1;
    }
    ;
    
    static getEntityColor(target) {
        
        const entityColorR = target.getProperty('property:color_r');
        
        const entityColorG = target.getProperty('property:color_g');
        
        const entityColorB = target.getProperty('property:color_b');
        
        return new MinecraftColorBase((entityColorR ?? 0.5) * 255, (entityColorG ?? 0.5) * 255, (entityColorB ?? 0.5) * 255);
    }
    ;
}
;

class MinecraftColor extends MinecraftColorBase {
    
    static WHITE = new this(240, 240, 240);
    
    static LIGHT_GRAY = new this(157, 157, 151);
    
    static GRAY = new this(71, 79, 82);
    
    static BLACK = new this(29, 29, 33);
    
    static BROWN = new this(131, 84, 50);
    
    static RED = new this(176, 46, 38);
    
    static ORANGE = new this(249, 128, 29);
    
    static YELLOW = new this(254, 216, 61);
    
    static LIME = new this(128, 199, 31);
    
    static GREEN = new this(94, 124, 22);
    
    static CYAN = new this(22, 156, 156);
    
    static LIGHT_BLUE = new this(58, 179, 218);
    
    static BLUE = new this(60, 68, 170);
    
    static PURPLE = new this(137, 50, 184);
    
    static MAGENTA = new this(199, 78, 189);
    
    static PINK = new this(243, 139, 170);
}
;

function Clamp({ min, max }, value) {
    return Math.max(min, Math.min(max, value));
}
;

function RandomFloor(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
;

function RandomFloat(min, max, length = 2) {
    return Number((Math.random() * (max - min) + min).toFixed(length));
}
;

function CalculateMedian(numbers) {
    
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    
    const middleIndex = Math.floor(sortedNumbers.length / 2);
    
    if (sortedNumbers.length % 2 === 0)
        return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
    
    else
        return sortedNumbers[middleIndex];
}
;

function CalculateModes(numbers) {
    
    const frequencyMap = new Map();
    
    let maxFrequency = 0;
    
    const modes = [];
    
    for (const number of numbers) {
        
        const frequency = (frequencyMap.get(number) || 0) + 1;
        
        frequencyMap.set(number, frequency);
        
        if (frequency > maxFrequency)
            maxFrequency = frequency;
    }
    ;
    
    frequencyMap.forEach((frequency, number) => {
        if (frequency === maxFrequency)
            modes.push(number);
    });
    
    return modes;
}
;

function AnalysisStringWeight(input) {
    
    let totalWeight = 0;
    
    const cumulativeWeights = [];
    
    input.forEach(weight => {
        
        totalWeight += weight;
        
        cumulativeWeights.push(totalWeight);
    });
    
    const randomIndex = RandomFloor(0, totalWeight - 1);
    
    const outputIndex = cumulativeWeights.findIndex(weight => randomIndex < weight);
    
    const output = Array.from(input.keys())[outputIndex];
    
    return { source: Array.from(input.keys()), index: outputIndex, output };
}
;

function AnalysisMessageWeight(input) {
    
    let totalWeight = 0;
    
    const cumulativeWeights = [];
    
    input.forEach(weight => {
        
        totalWeight += weight;
        
        cumulativeWeights.push(totalWeight);
    });
    
    const randomIndex = RandomFloor(0, totalWeight - 1);
    
    const outputIndex = cumulativeWeights.findIndex(weight => randomIndex < weight);
    
    const output = Array.from(input.keys())[outputIndex];
    
    return { source: Array.from(input.keys()), index: outputIndex, output };
}
;

function AnalysisWeight(inputMap) {
    
    if (inputMap.size === 0)
        throw new Error("Input map cannot be empty");
    
    const firstKey = Array.from(inputMap.keys())[0];
    
    if (typeof firstKey === 'string') {
        
        return AnalysisStringWeight(inputMap);
    }
    else {
        
        return AnalysisMessageWeight(inputMap);
    }
}
;

function IsEnable(input) {
    
    return RandomFloor(0, 100) <= input;
}
;

function QueryFoothold(source, range, height, limit) {
    
    let output = Vector.CONSTANT_ZERO;
    
    const maxRepeat = 1024;
    
    let alpha = 1;
    
    while (alpha > 0 && alpha <= maxRepeat) {
        
        const random0 = RandomFloor(0, 3);
        const random1 = RandomFloor(16, range);
        const random2 = RandomFloor(-range, -16);
        
        output =
            {
                x: source.location.x + (random0 === 0 || random0 === 2 ? random1 : random2),
                y: RandomFloor(height, limit),
                z: source.location.z + (random0 === 0 || random0 === 3 ? random1 : random2)
            };
        
        const getBlock0 = source.dimension.getBlock(output);
        const getBlock1 = source.dimension.getBlock(Vector.add(output, Vector.CONSTANT_UP));
        const getBlock2 = source.dimension.getBlock(Vector.add(output, { x: 0, y: -3, z: 0 }));
        const getBlock3 = source.dimension.getBlock(Vector.add(output, { x: 8, y: -2, z: 8 }));
        const getBlock4 = source.dimension.getBlock(Vector.add(output, { x: -8, y: -4, z: -8 }));
        
        if (getBlock0?.isAir && getBlock1?.isAir && getBlock2 && getBlock3 && getBlock4) {
            
            const test2 = !getBlock2.isAir && !getBlock2.isLiquid;
            const test3 = !getBlock3.isAir && !getBlock3.isLiquid;
            const test4 = !getBlock4.isAir && !getBlock4.isLiquid;
            
            if (test2 && test3 && test4)
                alpha = -1;
        }
        alpha++;
    }
    
    return alpha == maxRepeat ? source.location : output;
}
;

function QueryEntityFoothold(source, exclude, scale, range) {
    
    const options = {
        excludeTypes: [...exclude, "minecraft:player"],
        location: source.location,
        maxDistance: range,
        closest: scale
    };
    
    const entitys = source.dimension.getEntities(options);
    
    if (entitys.length < 1)
        return Vector.add(source.location, { x: 0, y: 255, z: 0 });
    
    const blocks = entitys.map(entity => entity.dimension.getBlock(entity.location));
    
    if (entitys.length < 1)
        return Vector.add(source.location, { x: 0, y: 128, z: 0 });
    
    const output = blocks.filter(block => {
        
        if (!block)
            return false;
        
        const above = block.above();
        
        const below = block.below();
        
        const east = below?.east();
        
        const south = below?.south();
        
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
    
    output.sort((a, b) => {
        const distance_a = Vector.distance(source.location, a.location);
        const distance_b = Vector.distance(source.location, b.location);
        return distance_a - distance_b;
    });
    
    if (output.length < 1)
        return Vector.add(source.location, { x: 0, y: 64, z: 0 });
    else
        return output[0].location;
}
;
