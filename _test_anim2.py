import json
from pathlib import Path

bone_names = ['raw_chicken_0', 'raw_meat_hook']
name = 'raw_chicken_0_top'

# script logic: all bones get rotation + position
bones = {}
for bn in bone_names:
    bones[bn] = {
        "rotation": [0, "q.property('cit:wall_rotation')", 0],
        "position": [0, "math.sin(q.life_time * 1080) * q.property('cit:bounce') * 0.5", 0],
    }
gen_anim = {f"animation.cit.{name}": {"loop": True, "bones": bones}}

data = json.loads(Path('resource_packs/Mizuno 16 Craft BE CIT/animations/cit/cit.wall.animation.json').read_text())
orig_anim = {f"animation.cit.{name}": data['animations'][f"animation.cit.{name}"]}

assert gen_anim == orig_anim, f"MISMATCH\nGEN: {json.dumps(gen_anim, indent=2)}\nORIG: {json.dumps(orig_anim, indent=2)}"
print("animation.cit.raw_chicken_0_top: MATCH")