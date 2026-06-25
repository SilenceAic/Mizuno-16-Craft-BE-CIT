"""还原 egg_4 动画：去掉 Molang 门控包裹，恢复纯数值"""
import json, re

PATH = r"c:\Users\shuli\Mizuno-16-Craft-BE-CIT\resource_packs\Mizuno 16 Craft BE CIT\animations\cit\cit.egg_4.animation.json"

with open(PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

def ungather(v):
    """从 Molang 门控表达式中提取原始数值"""
    if isinstance(v, str):
        m = re.match(r'^\((-?[\d.]+)\)\s*\*', v)
        if m:
            num = float(m.group(1))
            return int(num) if num == int(num) else num
    return v

def walk(obj):
    if isinstance(obj, list):
        return [walk(i) for i in obj]
    if isinstance(obj, dict):
        return {k: walk(v) for k, v in obj.items()}
    return ungather(obj)

data = walk(data)
anim = data["animations"]["animation.cit.egg_4.switch_place"]
anim["loop"] = "hold_on_last_frame"

with open(PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent="\t", ensure_ascii=False)
    f.write("\n")

print("Done: gate removed, loop=hold_on_last_frame")