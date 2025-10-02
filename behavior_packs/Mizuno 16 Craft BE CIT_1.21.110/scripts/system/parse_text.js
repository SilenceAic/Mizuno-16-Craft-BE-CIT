/*
 * 导出模块
 */
export { TemplateMatcher, CleanMessageArray, JsonToUnicode };
/**
 * templateMatcher 函数用于检查样本字符串是否匹配模板集合中的任一模式。
 * 模板集合中可能包含三种模式：精确匹配、前缀匹配和后缀匹配。
 *
 * @param {Set<string>} template - 代表一系列匹配模式：
 *   - 精确匹配: 模板与样本完全一致（如 "exact"）
 *   - 前缀匹配: 模板以 (*content) 形式存在（如 "*contains"）, 样本包含 content 即匹配
 *   - 后缀匹配: 模板以 (content*) 形式存在（如 "contains*"）, 样本包含 content 即匹配
 *
 * @param {string} sample - 待匹配的样本字符串
 *
 * @returns {boolean} 匹配成功返回 true, 否则返回 false
 */
function TemplateMatcher(template, sample) {
    // 精确匹配：直接检查样本是否存在模板集合中
    if (template.has(sample))
        return true;
    /**
     * 匹配 (*content) 模式的正则, 提取 content
     * 示例：模板 "*example" 会提取 "example"
     */
    const suffixRegex = /^\*(.*)$/;
    /**
     * 匹配 (content*) 模式的正则, 提取 content
     * 示例：模板 "example*" 会提取 "example"
     */
    const prefixRegex = /^(.*)\*$/;
    // 遍历模板集合, 依次匹配每种模式
    for (const pattern of template) {
        /**
         * 前缀匹配检测（如 content*）
         */
        const suffixMatch = pattern.match(suffixRegex);
        if (suffixMatch) {
            /**
             * 提取 样本字符串
             */
            const content = suffixMatch[1];
            // 匹配结尾
            if (content && sample.endsWith(content))
                return true;
            // 包含即匹配
            //if (content && sample.includes(content)) return true;
        }
        /**
         * 前缀匹配检测（如 content*）
         */
        const prefixMatch = pattern.match(prefixRegex);
        if (prefixMatch) {
            /**
             * 提取 样本字符串
             */
            const content = prefixMatch[1];
            // 匹配开头
            if (content && sample.startsWith(content))
                return true;
            // 包含即匹配
            //if (content && sample.includes(content)) return true;
        }
    }
    return false;
}
;
/**
 * 清理消息数组中的格式化代码和换行符
 *
 * @param {server.RawMessage[]} dataArray - 待处理的消息数组
 *
 * @returns {server.RawMessage[]} - 处理后的消息数组
 */
function CleanMessageArray(dataArray) {
    // 遍历数组中的每个对象
    return dataArray.map(item => {
        // 如果对象中有 'text' 属性, 则对其进行正则替换
        if (item.text)
            item.text = item.text.replace(/§\w|\n/g, '');
        return item;
    });
}
;
/**
 * * 将JSON字符串中的特定字符转换为Unicode编码的十六进制形式
 *
 * 对大写字母, 小写字母, 中文字符进行编码, 同时将特定的 Unicode 编码转换为 true 和 false
 *
 * @param {string} input - 待处理的 JSON 字符串
 *
 * @return {string} 处理后的 JSON 字符串
 */
function JsonToUnicode(input) {
    // 确保输入是字符串
    if (typeof input !== 'string')
        input = JSON.stringify(input);
    /**
     * * 将字符串转换为字符数组
     */
    const chars = input.split('');
    /**
     * * 将字符数组转换为 Unicode字符串
     */
    const compile = chars.map(char => {
        /**
         * * 获取字符的 Unicode 编码
         */
        const code = char.charCodeAt(0);
        // 对大写字母进行Unicode编码
        if (code >= 0x0041 && code <= 0x005A)
            return `\\u${code.toString(16).padStart(4, '0')}`;
        // 对小写字母进行Unicode编码
        else if (code >= 0x0061 && code <= 0x007A)
            return `\\u${code.toString(16).padStart(4, '0')}`;
        // 对中文字符进行Unicode编码
        else if (code >= 0x4E00 && code <= 0x9FA5)
            return `\\u${code.toString(16).padStart(4, '0')}`;
        // 其他字符保持不变
        else
            return char;
    }).join('');
    // 将特定的 Unicode 编码转换为 true 和 false
    return compile
        .replace(/\\u0074\\u0072\\u0075\\u0065/g, 'true')
        .replace(/\\u0066\\u0061\\u006c\\u0073\\u0065/g, 'false');
}
;
