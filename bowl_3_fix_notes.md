# bowl_3 渲染修复总结

## 失败原因

1. **新增材质不被识别**  
   `.material` 文件属于编译型资源，修改后必须**完全重启游戏**才能生效，`/reload` 或断线重连无效。导致 `entity_alphablend_doublesided`、早期的 `ppmshjz_ao` 反复报 "material not defined"。

2. **FANCY + entity_alphablend 导致不透明像素变半透明**  
   直接在 `entity_alphablend` 子材质上加回 `FANCY` 后，opaque 像素也会呈现半透明效果。最终通过显式设置 `blendSrc / blendDst` + `DisableDepthWrite` 解决。

3. **渲染控制器解析失败**  
   早期创建的 `bowl_3.render_controller.json` 缺少必要字段（`part_visibility`、`is_hurt_color`、`on_fire_color`、`ignore_lighting`），导致 Bedrock 拒绝解析。与 `fern_1.render_controller.json` 完整结构对比后确认字段要求。

4. **透过 bottle 看不到不透明骨骼（深度排序问题）**  
   Bedrock 对 alphablend 实体**逆序**渲染骨骼。`bottle` 处于骨骼数组末位，反而最先渲染并写入深度缓冲，导致后续 `plate`/`bowl` 等骨骼深度测试失败、不可见。

---

## 成功经验

- `.material` 修改 → 必须完整重启游戏
- 渲染控制器字段必须完整（对照已有可用文件）
- **分骨骼材质是解决混合深度问题的正确方式**：不透明骨骼用 `entity_alphatest`（写深度），透明骨骼用自定义 alphablend（`DisableDepthWrite`，不遮挡其他骨骼）

---

## 最终方案

| 文件 | 改动 |
|------|------|
| `entity.material` | 新增 `ppmshjz_ao`：`entity_alphablend` + `DisableCulling` + `DisableDepthWrite` + `FANCY` |
| `bowl_3.render_controller.json` | `*` → `Material.opaque`，`bottle` → `Material.transparent` |
| `bowl_3.json` | `opaque: entity_alphatest`，`transparent: ppmshjz_ao`，使用 `controller.render.cit.bowl_3` |

**效果**：`bottle` 骨骼双面半透明（可见内部结构），其余骨骼完全不透明，AO 保留。
