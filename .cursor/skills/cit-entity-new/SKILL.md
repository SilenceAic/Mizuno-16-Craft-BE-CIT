---
name: cit-entity-new
description: "Create new Bedrock CIT entity from Java OptiFine model. Converts Java JSON to Bedrock geometry via java_to_bedrock.py, then configures behavior entity, client entity, render controllers, item_config entry, and optional features: multi-bone rendering, variant model switching, shovel-triggered animation with animation controller. Use when user mentions creating a new CIT entity, configuring egg/like models, or adding new block/item 3D entities from the OptiFine CIT folder."
---

# CIT Entity Creation Workflow

## Prerequisite

The agent must have already read and understood the egg_4 configuration files as reference templates:
- `behavior_packs/Mizuno 16 Craft BE CIT/entities/cit/egg_4.json`
- `resource_packs/Mizuno 16 Craft BE CIT/entity/cit/egg_4.json`
- `resource_packs/Mizuno 16 Craft BE CIT/render_controllers/cit/egg_4.render_controller.json`
- `resource_packs/Mizuno 16 Craft BE CIT/animation_controllers/cit/cit.egg_4.animation_controller.json`
- `behavior_packs/Mizuno 16 Craft BE CIT/scripts/item3d/item_config.js` (egg section)
- `behavior_packs/Mizuno 16 Craft BE CIT/scripts/item3d/custom_component.js` (egg_4 branch)

## Step 1: Model Conversion

Run the Java-to-Bedrock converter:

```bash
python java_to_bedrock.py [model_name]
```

Note the bone names and cube counts from output (e.g., `bones: 2, cubes: 8 | plate_white: 5 cubes | egg_4: 3 cubes`).

If a variant model exists (e.g., `egg_5a.json`), also convert it:
```bash
python java_to_bedrock.py [model_name]a
```

## Step 2: Ask for Features

Use AskQuestion to determine which features to enable:

```
feature_multi_bone: "Multi-bone rendering (separate pass per bone with part_visibility)?"
  → If bones > 1 from Step 1 output, default YES.

feature_variant_model: "Variant model switching (same entity, cit:variant toggles geometry, like egg_4/egg_4a)?"
  → Only if `[model_name]a.geo.json` was generated in Step 1.

feature_variant_count: "How many variants?" 
  → 2 if variant model exists.

feature_shovel_anim: "Shovel-triggered custom animation on left-click?"
  → Only if user has or plans an animation file.

animation_name: "Animation short-name?"
  → default: "switch_place"

animation_length_seconds: "Animation duration in seconds?"
  → default: from animation file's animation_length
```

## Step 3: Generate Files

Generate ALL files based on selected features. Use egg_4 as exact template, substituting `egg_4` → `[model_name]`, `egg_4a` → `[model_name]a`, and bone names from Step 1 output.

### Always create:

**Behavior entity** `entities/cit/[model_name].json`:
- identifier: `cit:[model_name]`
- properties: `cit:is_wall`, `cit:wall_face`, `cit:wall_rotation`
- + `cit:variant` (0-1) IF feature_variant_model
- + `cit:transition_state` (0-2) IF feature_shovel_anim
- type_family: `[model_name]`, `cit`, `inanimate`

**Client entity** `entity/cit/[model_name].json`:
- identifier: `cit:[model_name]`
- materials: one per bone (discovered from Step 1)
- textures: one per bone, pointing to `textures/cit/entity/[model_name]`
- geometry.default: `geometry.cit.[model_name]`
- + geometry: `[model_name]a: "geometry.cit.[model_name]a"` IF feature_variant_model
- + animations section IF feature_shovel_anim

**Render controller** `render_controllers/cit/[model_name].render_controller.json`:
- One pass per bone name (discovered from Step 1)
- Each pass: `"*": "Material.[bone_name]"`, `"Texture.[bone_name]"`, `part_visibility` isolating that bone
- IF feature_variant_model: geometry switches by `cit:variant`:
  ```
  "geometry": "q.property('cit:variant') == 0 ? Geometry.default : Geometry.[model_name]a"
  ```

**item_config.js**: Add entries to the appropriate item section (e.g., `minecraft:egg`):
```js
[ModelName]: {
    entityId: "cit:[model_name]",
    variantCount: [variant_count],  // only if feature_variant_model
    placement: { wall: 0.3, ground: 1.0, ceiling: -0.01 },
},
```
IF variant model: also add `[ModelName]a` entry with `entityId: "cit:[model_name]", spawnVariant: 1`.

### Conditional: Shovel Animation

**Animation controller** `animation_controllers/cit/cit.[model_name].animation_controller.json`:
- Two states: `idle` ↔ `playing`
- Transition: `idle → playing` when `q.property('cit:transition_state') == 2`
- Transition: `playing → idle` when `q.property('cit:transition_state') != 2`
- playing state plays `[animation_name]`

**custom_component.js**: Add egg_4-style branch before variant switching logic:
```js
if (hitEntity.typeId === "cit:[model_name]") {
    const inv = damagingEntity.getComponent("inventory");
    const heldItem = inv?.container?.getItem(damagingEntity.selectedSlotIndex);
    const isShovel = heldItem?.getTags?.()?.includes("minecraft:is_shovel");
    if (isShovel) {
        if (hitEntity.getProperty("cit:transition_state") !== 2) {
            hitEntity.setProperty("cit:transition_state", 2);
            mc.system.runTimeout(() => {
                if (hitEntity.isValid) hitEntity.setProperty("cit:transition_state", 1);
            }, [animation_length * 20 rounded]);
        }
        // hop if floor entity
        return;
    }
    // fall through to variant switching
}
```

### Conditional: Variant Model (separate entity, same behavior entity)

**Behavior entity** `entities/cit/[model_name]a.json`: NOT needed — uses same `cit:[model_name]` entity.

**Client entity** `entity/cit/[model_name]a.json`: NOT needed — geometry switch handled by render controller.

**Render controller** `[model_name]a.render_controller.json`: NOT needed — same controller handles variant switching.

## Feature Matrix Reference

| Feature | Behavior Entity Property | Client Entity | Render Controller | item_config |
|---|---|---|---|---|
| Single model | only wall props | single geometry | single pass per bone | just entityId |
| Variant model switch | + `cit:variant` (0-1) | + `geometry.[name]a` | + Molang geometry select | + `variantCount` |
| Shovel animation | + `cit:transition_state` (0-2) | + animations + ctrl | (no change) | (no change) |

## Post-Creation

Remind user to provide:
- Texture PNGs: `textures/cit/entity/[model_name].png`, `[model_name]a.png`
- Animation JSON: `animations/cit/cit.[model_name].animation.json` (if shovel feature)