"""
批量处理 egg_4 动画 JSON：每个关键帧数值包裹 Molang 门控表达式。
state=1 → 倍数为 0（不可见）; state=2 → 倍数为 1（动画可见）
"""

import json, re, sys

PATH = r"c:\Users\shuli\Mizuno-16-Craft-BE-CIT\resource_packs\Mizuno 16 Craft BE CIT\animations\cit\cit.egg_4.animation.json"

with open(PATH, "r", encoding="utf-8") as f:
    text = f.read()

data = json.loads(text)

def gate_number(v):
    """将纯数字包裹为 Molang 门控表达式，已含表达式的跳过"""
    if isinstance(v, (int, float)):
        return f"({v}) * (q.property('cit:transition_state') - 1)"
    if isinstance(v, str):
        return v
    return v

def walk(obj):
    if isinstance(obj, list):
        return [walk(i) for i in obj]
    if isinstance(obj, dict):
        # 只处理 "post" 数组内的数值
        new = {}
        for k, v in obj.items():
            if k == "post" and isinstance(v, list):
                new[k] = [gate_number(x) if isinstance(x, (int, float)) else x for x in v]
            else:
                new[k] = walk(v)
        return new
    return obj

data = walk(data)
data["animations"]["animation.cit.egg_4.switch_place"]["loop"] = True

with open(PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent="\t", ensure_ascii=False)
    f.write("\n")

print("Done: gate multipliers added, loop=true")