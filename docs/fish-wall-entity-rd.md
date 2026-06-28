# raw_cod_0 鱼类墙面实体研发记录

## 概述

为 Mizuno 16 Craft BE CIT 项目新增 9 个鱼类 CIT 实体（raw_cod、raw_salmon、tropical_fish、pufferfish），实现完整的墙面/地面放置、拿持旋转、平滑过渡、动态回弹等功能。

---

## 功能清单

### 1. 鱼类实体系统

创建了完整的 behavior entity、client entity、render controller、animation 四件套：

| 实体 | 放置类型 | 骨骼结构 | 注记 |
|------|----------|----------|------|
| `cit:raw_cod_0` | wall/ground | spruce_planks + raw_cod_0 | 地平模型，贴墙时 X 轴 −90° 旋转立起 |
| `cit:raw_cod_1` | top (ceiling) | raw_meat_hook + raw_cod_0 | 左键可切换 raw_cod_1a 变体 |
| `cit:raw_cod_1a` | top | raw_meat_hook + raw_cod_0a | 变体，独立客户端实体 |
| `cit:raw_salmon_0` | wall/ground | spruce_planks + raw_salmon_0 | |
| `cit:raw_salmon_2` | top | raw_meat_hook + raw_salmon_0 | |
| `cit:tropical_fish_0` | wall/ground | spruce_planks + tropical_fish_0 | |
| `cit:tropical_fish_1` | wall/ground | spruce_planks + tropical_fish_1 | |
| `cit:pufferfish_0` | wall/ground | spruce_planks + pufferfish_0 | |
| `cit:pufferfish_1` | top | pufferfish_1（单骨骼） | |

### 2. 墙面吸附平滑旋转

拿持实体对准墙面时，实体从地面朝向平滑插值旋转到墙面朝向，6 tick（0.3秒）完成。

### 3. 动态落地回弹系统（`is_dynamic` 族）

地面实体右键旋转 + 弹跳后，自动回落至原位，模拟重力手感。通过 `is_dynamic` 类型族标记，不影响已有实体。

### 4. 墙面旋转方向修正

地面时自动走 `hopFloorStack` 物理旋转+弹跳，墙上时走 `wall_10` 属性动画旋转。按 `currentlyOnWall` 实时判定，不依赖死板的后缀匹配。

### 5. 多骨骼 part_visibility 渲染

多骨骼模型（spruce_planks + fish 或 raw_meat_hook + fish）采用 `golden_apple_1_top` 风格的 part_visibility 分离渲染，每个骨骼一个 render controller pass。

---

## 相关文件

### 行为实体（9 个）
```
behavior_packs/Mizuno 16 Craft BE CIT/entities/cit/
  raw_cod_0.json
  raw_cod_1.json
  raw_cod_1a.json
  raw_salmon_0.json
  raw_salmon_2.json
  tropical_fish_0.json
  tropical_fish_1.json
  pufferfish_0.json
  pufferfish_1.json
```

### 客户端实体（9 个）
```
resource_packs/Mizuno 16 Craft BE CIT/entity/cit/
  raw_cod_0.json
  raw_cod_1.json
  raw_cod_1a.json
  raw_salmon_0.json
  raw_salmon_2.json
  tropical_fish_0.json
  tropical_fish_1.json
  pufferfish_0.json
  pufferfish_1.json
```

### 渲染控制器（9 个）
```
resource_packs/Mizuno 16 Craft BE CIT/render_controllers/cit/
  raw_cod_0.render_controller.json      ← 双骨骼 part_visibility
  raw_cod_1.render_controller.json
  raw_cod_1a.render_controller.json
  raw_salmon_0.render_controller.json
  raw_salmon_2.render_controller.json
  tropical_fish_0.render_controller.json
  tropical_fish_1.render_controller.json
  pufferfish_0.render_controller.json
  pufferfish_1.render_controller.json   ← 单骨骼
```

### 模型（1 个新增）
```
resource_packs/Mizuno 16 Craft BE CIT/models/entity/cit/
  raw_salmon_0.geo.json   ← java_to_bedrock.py 转换
```
其他 8 个模型此前已由 `java_to_bedrock.py` 转换完成。

### 动画
```
resource_packs/Mizuno 16 Craft BE CIT/animations/cit/
  cit.wall.animation.json   ← 新增 9 个动画条目
```
动画关键 Molang 表达式（以 raw_cod_0_wall 为例）：
```javascript
rotation: [
    "q.property('cit:is_wall') ? -90 : 0",   // 贴墙立起 / 地平平放
    0,
    "q.property('cit:is_wall') ? q.property('cit:wall_rotation') : 0"
]
position: [0, "math.sin(q.life_time * 1080) * q.property('cit:bounce') * 0.5", 0]
```

### 脚本
```
behavior_packs/Mizuno 16 Craft BE CIT/scripts/item3d/
  custom_component.js   ← 核心逻辑：墙面过渡、锚点矫正、旋转模式
  custom_function.js    ← item3dList 增补鱼类
  item_config.js        ← 4 组鱼类 placement/config
```

---

## 关键配置

### item_config.js — cod 墙面偏移

```js
"minecraft:cod": {
    _default: {
        entityId: "cit:raw_cod_0",
        wallEntityId: "cit:raw_cod_0",
        placement: { wall: -0.4, ground: 1.01, ceiling: -0.01 },
    },
    "Raw Cod_0": {
        entityId: "cit:raw_cod_0",
        wallEntityId: "cit:raw_cod_0",
        placement: { wall: -0.4, ground: 1.01, ceiling: -0.01 },
    },
}
```

注意 `wall: -0.4`。cod 的模型 1 单位厚的案板在地平放置时沿 XZ 面展开，贴墙立起（X 轴 −90°）后案板厚度变成 Z 方向。pivot 在墙面对外会全部伸出房间；−0.4 将 pivot 推入墙内，视觉上贴紧。

### item_config.js — Salmon_1 缺失

`raw_salmon_1` 模型存在但未配置。`raw_salmon_0` 为 wall，`raw_salmon_2` 为 top。

### custom_function.js — 类型映射修复

```js
// held loop 中，正则洗掉 _wall/_top/_数字 后缀后：
itemTypeId = itemTypeId.replace("minecraft:raw_cod", "minecraft:cod");
itemTypeId = itemTypeId.replace("minecraft:raw_salmon", "minecraft:salmon");
```

原因：`cit:raw_cod_0` → `minecraft:raw_cod`，但 config 键是 `minecraft:cod`，不映射会导致 `getPlacementConfig` fallback 到默认值，held 行为与 spawn 行为不一致。

### custom_component.js — 旋转模式修正

```js
const currentlyOnWall = isWallEntity && target.getProperty("cit:is_wall") === true;
const rotationMode = (currentlyOnWall || isTopEntity) ? "wall_10" : "floor";
```

之前的逻辑 `isWallEntity || isTopEntity` 只要实体有墙属性就走 wall_10，地面右键也走属性旋转无法弹跳。改为实时判定当前状态。

### custom_component.js — 锚点回拉系统

```js
// 模块顶层
const dynamicEntities = new Set(["cit:raw_cod_0", "cit:raw_cod_1", ...]);
const dynamicAnchorMap = new Map(); // entityId → anchorY

// hopFloorStack 中
if (dynamicEntities.has(entity.typeId)) {
    dynamicAnchorMap.set(entity.id, location.y);  // 弹跳前记录
}

// 独立矫正循环（1 tick 间隔）
mc.system.runInterval(() => {
    // 对锚点高于当前 Y 的实体，每 tick 回落 0.05，直到归位
}, 1);
```

矫正循环的逻辑：只要实体的 `currentY > anchorY + 0.005`，就 teleport 下降 max(anchorY, currentY − 0.05)。被拿起的实体（有 `cit:owner`）跳过矫正。

### custom_component.js — 墙面过渡

```js
const wallTransitionEntities = new Map();
const WALL_TRANSITION_TICKS = 6;
```

过渡流程：
1. 检测到首次贴墙（`wasNotOnWall`），记录当前旋转为起点
2. 此后 6 tick 内，旋转通过 `shortestAngleDelta` 从地面角插值到墙面角
3. 过渡期间位置跟手，旋转渐进
4. 完成后删除状态，后续正常 snap

### 行为实体 — `minecraft:physics` 取舍

鱼类实体**不能添加** `minecraft:physics`，因为：
- `item_config` 中 `noGravity: true` 需要实体浮空（挂墙/贴顶）
- 添加 physics 后重力会拉掉实体，无重力配置失效
- 左键攻击的微小位移靠 `knockback_resistance: 1.0` + `damage_sensor` 抑制

### 行为实体 — `is_dynamic` 类型族

```json
"minecraft:type_family": {
    "family": ["raw_cod_0", "cit", "inanimate", "is_wall", "is_dynamic"]
}
```

用于标记需要锚点矫正的实体。脚本中 `dynamicEntities` Set 与此对应。

---

## 研发过程

### 阶段 1：实体基础搭建
- `java_to_bedrock.py` 转换 Java OptiFine 模型 → Bedrock .geo.json
- 参考 `golden_apple_0_wall` 模板创建 behavior entity、client entity、render controller
- 在 `item_config.js` 添加配置，`custom_function.js` 注册物品

### 阶段 2：墙面动画修正（第一轮）
- 问题：raw_cod_0 的动画 `raw_cod_0_top` 只有 Y 轴天花板旋转，没有 X 轴倾斜
- 解决：重写为 `raw_cod_0_wall`，加入 `is_wall ? -90 : 0` 条件旋转
- 同时修正其他 4 个带 spruce_planks 的墙面鱼类动画

### 阶段 3：墙面过渡 + 平滑旋转
- 需求：拿持实体对准墙面时，从地面朝向平滑过渡到贴墙面，看到旋转过程
- 实现：`wallTransitionEntities` Map + `shortestAngleDelta` 线性插值，6 tick
- 附带修复：`hasWallCapability` 重构（`_wall` 后缀 + 白名单替代死板的 try/catch）

### 阶段 4：旋转模式 bug 修复
- 问题 1：所有带 `cit:is_wall` 属性的实体都被判为 wall，地面右键不弹跳
- 问题 2：held loop 中类型 ID 映射错误（`raw_cod` → `cod`），placement 配置不生效
- 修复：旋转模式按 `currentlyOnWall` 实时判定；类型 ID 加映射

### 阶段 5：动态回弹系统
- 需求：地面右键弹跳后自然回落，模拟重力手感，仅限鱼类不影响其他实体
- 发现：`hopFloorStack` 只上抛无回落；held loop 每 tick 拉回创造了 "重力"错觉
- 实现：`dynamicEntities` + `dynamicAnchorMap` + 独立矫正循环
- 尝试过添加 `minecraft:physics` → 与 `noGravity` 冲突，回退

### 阶段 6：placement 偏移 + 多骨骼渲染
- cod 的 `wall: 0` 改为 `wall: -0.4` 推入墙内
- 所有多骨骼实体改用 `part_visibility` 分离渲染

### 阶段 7：文档化
- 编写本研发文档

---

## 经验教训

1. **实体命名一致性**：`cit:raw_cod_0` 对应 `minecraft:cod`，而非 `minecraft:raw_cod`。正则清洗后类型 ID 可能与 config 键不匹配，需要显式映射。

2. **墙后缀判断不要过宽**：`_wall` 后缀是高效的判断方式。用 `try getProperty("cit:is_wall")` 会误匹配所有带此属性的实体（apple、bowl 等），导致 floor 实体误走 wall 逻辑。改用白名单 `wallCapableEntities` Set 精确控制。

3. **动画的 X 轴倾斜**：地平铺设的模型（案板+鱼）需要通过 X 轴 −90° 旋转才能在墙面上立起。仅靠 Z 轴旋转 + bounce 不够。

4. **held loop 是"伪重力"**：held loop 每 tick 把实体拉回准星位置，弹跳后的回落效果靠此实现。地上无 held loop 的实体弹跳后只升不降，需要额外矫正循环。

5. **physics 与 noGravity 冲突**：`minecraft:physics` 会给实体施加重力，与 `noGravity: true` 配置冲突。挂墙/贴顶实体不能有 physics 组件。

6. **placement.wall 的符号**：正值把实体推离墙面，负值推入墙面。地平模型在贴墙立起后厚度方向反转，需要负值才能贴紧。

7. **旋转状态应实时判定**：`isWallEntity` 不应作为旋转模式的唯一依据。加 `currentlyOnWall` 检查，墙上用属性动画、地上用物理旋转。

8. **PowerShell 正则不可靠**：Windows 上的 PowerShell 正则替换在跨行匹配时经常因编码/换行符问题失败。批量文件编辑优先使用 Node.js 脚本。

---

## 测试验证

- raw_cod_0 贴墙放置 → 模型立起，贴紧墙面 ✓
- 蹲下拿持 raw_cod_0，对准墙面 → 平滑旋转过渡 ✓
- raw_cod_0 放地上，右键 → 旋转+弹跳+自然回落 ✓
- raw_cod_0 放地上，左键 → 无异常物理运动 ✓
- 其他鱼类（salmon、tropical_fish、pufferfish）行为一致 ✓
- 苹果、碗、鸡蛋等原有实体不受影响 ✓
- 弹跳后拿起来 → 锚点清除，不干扰手持 ✓