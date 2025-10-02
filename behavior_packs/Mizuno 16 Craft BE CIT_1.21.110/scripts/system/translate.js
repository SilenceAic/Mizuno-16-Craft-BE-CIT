/*
 * 原版接口
 */
import * as server from "@minecraft/server";
/*
 * 导出模块
 */
export { translate };
function translate(target, type) {
    // 如果目标为玩家或带有有效 nameTag 的实体, 返回 {text: target.nameTag}
    if (target instanceof server.Player || (target instanceof server.Entity && target.nameTag.length >= 1))
        return { text: target.nameTag };
    // 如果目标为字符串, 则根据 type 参数进行本地化处理
    else if (typeof target == 'string') {
        /**
         * * 获取识别标识
         */
        const split = target.split(':');
        // 根据type参数进行本地化处理
        switch (type) {
            case 'entity': return { translate: `entity.${(split[0] == 'minecraft') ? split[1] : target}.name` };
            case 'block': return { translate: `tile.${(split[0] == 'minecraft') ? split[1] : target}.name` };
            case 'item': return { translate: `item.${(split[0] == 'minecraft') ? split[1] : target}${(split[0] == 'minecraft') ? '.name' : ''}` };
            default: return { text: '未知的 -> ' + target };
        }
    }
    // 否则返回 {translate: target.localizationKey} 进行本地化处理
    else
        return { translate: target.localizationKey };
}
;
