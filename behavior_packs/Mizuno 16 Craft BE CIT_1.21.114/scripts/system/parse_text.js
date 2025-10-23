
export { TemplateMatcher, CleanMessageArray, JsonToUnicode };

function TemplateMatcher(template, sample) {
    
    if (template.has(sample))
        return true;
    
    const suffixRegex = /^\*(.*)$/;
    
    const prefixRegex = /^(.*)\*$/;
    
    for (const pattern of template) {
        
        const suffixMatch = pattern.match(suffixRegex);
        if (suffixMatch) {
            
            const content = suffixMatch[1];
            
            if (content && sample.endsWith(content))
                return true;
            
            
        }
        
        const prefixMatch = pattern.match(prefixRegex);
        if (prefixMatch) {
            
            const content = prefixMatch[1];
            
            if (content && sample.startsWith(content))
                return true;
            
            
        }
    }
    return false;
}
;

function CleanMessageArray(dataArray) {
    
    return dataArray.map(item => {
        
        if (item.text)
            item.text = item.text.replace(/§\w|\n/g, '');
        return item;
    });
}
;

function JsonToUnicode(input) {
    
    if (typeof input !== 'string')
        input = JSON.stringify(input);
    
    const chars = input.split('');
    
    const compile = chars.map(char => {
        
        const code = char.charCodeAt(0);
        
        if (code >= 0x0041 && code <= 0x005A)
            return `\\u${code.toString(16).padStart(4, '0')}`;
        
        else if (code >= 0x0061 && code <= 0x007A)
            return `\\u${code.toString(16).padStart(4, '0')}`;
        
        else if (code >= 0x4E00 && code <= 0x9FA5)
            return `\\u${code.toString(16).padStart(4, '0')}`;
        
        else
            return char;
    }).join('');
    
    return compile
        .replace(/\\u0074\\u0072\\u0075\\u0065/g, 'true')
        .replace(/\\u0066\\u0061\\u006c\\u0073\\u0065/g, 'false');
}
;
