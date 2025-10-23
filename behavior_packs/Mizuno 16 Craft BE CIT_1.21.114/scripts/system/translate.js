
import * as server from "@minecraft/server";

export { translate };
function translate(target, type) {
    
    if (target instanceof server.Player || (target instanceof server.Entity && target.nameTag.length >= 1))
        return { text: target.nameTag };
    
    else if (typeof target == 'string') {
        
        const split = target.split(':');
        
        switch (type) {
            case 'entity': return { translate: `entity.${(split[0] == 'minecraft') ? split[1] : target}.name` };
            case 'block': return { translate: `tile.${(split[0] == 'minecraft') ? split[1] : target}.name` };
            case 'item': return { translate: `item.${(split[0] == 'minecraft') ? split[1] : target}${(split[0] == 'minecraft') ? '.name' : ''}` };
            default: return { text: '未知的 -> ' + target };
        }
    }
    
    else
        return { translate: target.localizationKey };
}
;
