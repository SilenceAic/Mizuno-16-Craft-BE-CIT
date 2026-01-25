
export { GetContractRoles, EntitysSort, GetPartner };

function GetContractRoles(player, options, after) {
    
    const merge = {
        excludeTypes: ["minecraft:item", "minecraft:xp_orb", player.typeId],
        families: ['starry'],
        ...options
    };
    
    const roles = player.dimension.getEntities(merge).filter(role => role.getComponent('is_tamed'));
    
    roles.filter(role => role.getDynamicProperty('entity:contract_user') == player.id);
    
    roles.forEach(role => after(role));
}
;

function EntitysSort(dimension, options, onSort, onFilter) {
    
    const entitys = onSort ? dimension.getEntities(options).sort(onSort) : dimension.getEntities(options);
    return onFilter ? entitys.filter(onFilter) : entitys;
}
;

function GetPartner(entity, after) {
    
    const roleOptions = {
        location: entity.location,
        families: ['starry'],
        maxDistance: 32
    };
    
    const playerOptions = {
        location: entity.location,
        maxDistance: 32
    };
    
    const partner = [
        ...entity.dimension.getEntities(roleOptions),
        ...entity.dimension.getPlayers(playerOptions)
    ];
    
    const contract = entity.getDynamicProperty('entity:contract_user');
    
    partner.forEach((entity, index) => {
        
        if (entity.id != contract && entity.getDynamicProperty('entity:contract_user') != contract)
            return;
        
        after(entity, index);
    });
}
;
