/*
 * 原版接口
 */
import * as serverUI from "@minecraft/server-ui";
import * as server from "@minecraft/server";
import { can_display_logs, biome_map, dimension_map, response_patterns } from "../data/table";
/*
 * 数学模块
 */
import { RandomFloor, Vector } from './maths';
/*
 * 元素攻击模块
 */
import { GetProperty } from './rune_attack';
/*
 * 触发控制模块
 */
import { TriggerControl } from './control';
/*
 * 实体处理模块
 */
import { EntitysSort } from './parse_entity';
/*
 * 信息处理模块
 */
import { DistanceAndName } from './intel';
/*
 * 实例创建模块
 */
import { TrySetPermutation, TrySpawnItem, TryProcessBlocksInVolume } from "./create";
/*
 * 导出模块
 */
export { ReplyMessages, material, manageChatResponses, windowedRetriever, lexiconWindowedInterface, isPlayerAuthorized, lexiconInterface };
/**
 * 模块的名称标签
 */
const nameTag = '§d§l月华§r';
/**
 * 决策阈值
 */
let decisionThreshold = 0.25;
// TODO : [ 知识库 ]
/**
 * 预设回复消息模板
 */
class ReplyMessages {
    /**
     * 根证书有效
     */
    static get root_certificate_set() {
        return { text: '#$^$#已获得根证书, 授权签发完成!\n' };
    }
    /**
     * 获取根证书
     */
    static get get_root_certificate() {
        return { text: '正在为你签发授权, #$^$#需要您提供一下根证书\n' };
    }
    ;
    /**
     * 根证书错误
     */
    static get root_certificate_error() {
        return { text: '根证书错误, #$^$#无法给您进行临时授权\n' };
    }
    ;
    /**
     * 询问需要什么服务
     */
    static get ask_for_task() {
        return { text: '请问需要我做些什么呀?\n' };
    }
    ;
    /**
     * 未识别的主题
     */
    static get unknown_theme() {
        return { text: '#$^$#听不太明白哦……你能再详细说一下吗?\n' };
    }
    ;
    /**
     * 缺少相关资料
     */
    static get unknown_paper() {
        return { text: '很抱歉, #$^$#似乎没有找到您想要的资料呢……\n' };
    }
    ;
    /**
     * 成功获取资料
     */
    static get obtain_paper() {
        return { text: '#$^$#找到了哦, 请看以下资料 : \n\n' };
    }
    ;
    /**
     * 未知的生态群系
     */
    static get unknown_biome() {
        return { text: '看起来这个群系#$^$#还没有发现过……能否提供更多信息呢?\n' };
    }
    ;
    /**
     * 未识别的节点
     */
    static get unknown_node() {
        return { text: '#$^$#很抱歉, 不太明白您的意思, 能换个说法再解释一下吗?\n' };
    }
    ;
    /**
     * 未知记忆
     */
    static get unknown_echo() {
        return { text: '这个记忆, #$^$#似乎有些模糊, 能否重新描述一遍?\n' };
    }
    ;
    /**
     * 执行记忆
     */
    static get enact_echo() {
        return { text: '#$^$#明白了哦! 正在执行中啦~\n' };
    }
    ;
    /**
     * 日志状态切换
     */
    static get log_toggle() {
        return { text: '#$^$#收到你的指令啦! 正在切换日志状态哦~\n' };
    }
    ;
    /**
     * 权限不足
     */
    static get power_lack() {
        return { text: '哎呀, 权限不够的话, #$^$#就不能帮你做这个操作啦……\n' };
    }
    ;
    /**
     * 设置 虚岩矿脉
     */
    static get realm_mineral() {
        return { text: '#$^$#收到你的指令啦! 我将借助<§q§l 律令 §r>的力量, 协助你调试<§s§l 虚岩矿脉 §r>\n' };
    }
    ;
    /**
     * 设置 星尘能量
     */
    static get realm_energy() {
        return { text: '#$^$#看到你的请求啦! 我将借助<§q§l 律令 §r>的力量, 协助你调试<§u§l 星尘能量 §r>\n' };
    }
    ;
    /**
     * 执行 元素攻击
     */
    static get pursue_rune_hurt() {
        return { text: '#$^$#听到你的需求了! 我将借助<§q§l 律令 §r>的力量, 协助你释放<§5§l 元素攻击 §r>\n' };
    }
    ;
    /**
     * 修改 动态属性
     */
    static get pursue_dynamic_property() {
        return { text: '#$^$#明白你的指令啦! 我将借助<§q§l 律令 §r>的力量, 协助你调试<§5§l 动态属性 §r>\n' };
    }
    ;
    /**
     * 创建 雾海裂隙
     */
    static get pursue_fissure() {
        return { text: '#$^$#知道你的愿望啦! 我将借助<§q§l 律令 §r>的力量, 协助你构建<§9§l 雾海裂隙 §r>\n' };
    }
    ;
    /**
     * 扩展功能模板
     */
    static get craft_template() {
        return { root: [], only: true, priority: 128 };
    }
    ;
    /**
     * 重置 结构限制
     */
    static get reset_structural_constraints() {
        return { text: '#$^$#成功重置了<§9 结构限制 §r>! 有些结构可以重新生成啦~\n' };
    }
    ;
    /**
     * 打印到聊天栏
     */
    static get print_to_chat_bar() {
        return { text: '明白了! #$^$#会把结果打印到聊天栏里~ 这样你就能看到啦!\n' };
    }
    ;
    /**
     * 创建数据目录
     */
    static get create_data_directory() {
        return { text: '#$^$#明白了, 正在创建你需要的数据目录\n' };
    }
    ;
    /**
     * 无法选择
     */
    static get cannot_select() {
        return { text: '§l§m没有了哦, ' + nameTag + '什么都没有了啦……' };
    }
    ;
    /**
     * 函数采用了实验性API, 目前暂不支持继续使用该接口,请等待后续版本更新
     */
    static get experimental_api_disabled() {
        return { text: '很抱歉呀, 这个接口#$^$#目前还在实验阶段, 目前无法继续使用哦~ 等后续版本更新啦! \n' };
    }
    ;
    /**
     * 无法识别的查询结果
     */
    static get unknown_query_results() {
        /**
         * 应答模板
         */
        const template = [
            "#$^$#听不太明白哦……你能再详细说一下吗?\n",
            "很抱歉, #$^$#似乎不记得跟这个有关的信息呢……\n",
            "这个记忆, #$^$#似乎有些模糊, 能否重新描述一遍?\n",
            "#$^$#很抱歉, 不太明白您的意思, 能换个说法再解释一下吗?\n",
        ];
        return { text: template[RandomFloor(0, template.length)] };
    }
    /**
     * 无效的构造函数
     */
    constructor() { }
    ;
}
;
/**
 * 存储用户输入历史记录的数组, 用于检测重复输入行为
 *
 * @type {string[]}
 */
const userInputHistory = [];
/**
 * 附加功能
 */
const scalability = new Map();
/**
 * 正在进行聊天的玩家的标识符列表
 */
const playerOfChat = new Set();
/**
 * 进行 数据检索 的 数据库
 */
const material = [];
/**
 * 聊天记录缓存 [ 玩家标识符 , [ 玩家的输入, 月华的回应 ] ]
 */
const contextRegistry = new Map();
// TODO : [ 功能组件 ]
/**
 * lexicon百科 访问接口
 *
 * @param {server.Player} player 玩家对象, 包含玩家的ID、位置等信息
 *
 * @param {string} rawQuery 原始查询字符串, 玩家输入的内容
 *
 * @param {boolean} useImmersiveMode 是否使用沉浸式模式, 默认为false
 *
 * @returns 符合MC消息协议的RawMessage对象, 包含搜索结果或执行代码后的输出
 */
function lexiconInterface(player, rawQuery, useImmersiveMode = false, isChat = false) {
    /**
     * 对查询字符串进行标准化处理, 转换为NFC形式并转为小写, 然后按空格分割成语义片段
     *
     * @type {string[]}
     */
    const semanticSegments = rawQuery.normalize('NFC').toLowerCase().split(/\s+/);
    /**
     * 构建标准化响应容器, 符合MC消息协议, 用于存储最终的返回消息
     *
     * @type {server.RawMessage}
     */
    const responsePackage = { rawtext: [] };
    // 空输入防护, 如果输入为空, 返回提示消息
    if (!rawQuery?.trim() || rawQuery.trim().length == 0)
        return { rawtext: [ReplyMessages.unknown_query_results] };
    /**
     * 提取查询字符串的第一个语义片段作为主要查询词
     *
     * @type {string}
     */
    const mainQueryWord = semanticSegments[0];
    /**
     * 初始化输出内容数组, 用于存储搜索结果或执行代码后的消息
     *
     * @type {server.RawMessage[]}
     */
    const outputContent = [];
    /**
     * 初始化代码函数数组, 用于存储需要执行的代码逻辑
     *
     * @type {((player: server.Player, texts: string[], rawtexts: string[]) => server.RawMessage | server.RawMessage[])[]}
     */
    const codeFunctions = [];
    /**
     * 规范化资料表, 将材料数据转换为Map结构, 方便快速查询
     *
     * @type {Map<string, type.LEXICON_INTEL>}
     */
    const normalizedDatabase = new Map(material);
    /**
     * 使用严谨模式查询数据库, 获取精确匹配的结果
     *
     * @type {type.LEXICON_INTEL | undefined}
     */
    const strictQueryResult = normalizedDatabase.get(mainQueryWord);
    /**
     * 数据库样本数据, 用于后续的模糊匹配和相关性计算
     *
     * @type {type.LEXICON_INTEL[]}
     */
    const databaseSample = material.map(info => info[1]);
    /**
     * 根节点集合, 用于记录根节点, 以避免重复显示
     */
    const onlyRoot = new Set();
    /**
     * 文本结尾分隔符
     *
     * @type {server.RawMessage }
     */
    const finale = { text: '=-=-=-=-=-=-=-=-=-=\n' };
    /**
     * 处理样本数据并生成输出内容
     *
     * 该函数遍历数据库样本, 根据是否启用模糊匹配来筛选符合条件的资料, 并将符合条件的资料内容添加到输出内容数组中。
     *
     * @param {boolean} isFuzzy - 是否启用模糊匹配模式。如果为 true, 则使用模糊匹配；否则使用精确匹配。
     */
    const processSample = (isFuzzy) => {
        for (const target of databaseSample) {
            /**
             * 根节点信息
             */
            const rootNode = target.root.join(' * ');
            /**
             * 构建资料名称, 包含根节点信息
             *
             * @type {server.RawMessage }
             */
            const title = { text: '§q§l' + rootNode + '§r\n\n' };
            /**
             * 根标签合集
             */
            const rootTag = new Set(target.root);
            // 判断是否启用模糊匹配
            if (isFuzzy) {
                /**
                 * 计算查询词与当前样本的匹配度
                 */
                const proximity = calculateKeywordRelevance(mainQueryWord, rootNode, target.root);
                // 如果匹配度低于决策阈值, 则跳过当前样本
                if (proximity < decisionThreshold)
                    continue;
            }
            else {
                // 如果根节点不包含查询词, 则跳过当前样本
                if (!rootTag.has(mainQueryWord))
                    continue;
            }
            ;
            /**
             * 如果当前样本包含代码逻辑, 则将其添加到代码函数数组中。
             */
            if (target.code)
                codeFunctions.push(target.code);
            // 如果文档应具有唯一性且未被记录过, 并且存在资料内容, 则将资料内容添加到输出内容数组, 并记录根节点。
            if (target.only && !onlyRoot.has(rootNode) && target.intel) {
                // 添加到输出内容
                outputContent.push(useImmersiveMode ? {} : title, ...target.intel, finale);
                // 记录根节点
                onlyRoot.add(rootNode);
            }
            // 如果文档不需要唯一性并且存在资料内容, 则直接将资料内容添加到输出内容数组。
            else if (!target.only && target.intel) {
                // 添加到输出内容
                outputContent.push(useImmersiveMode ? {} : title, ...target.intel, finale);
            }
        }
    };
    // Fisher-Yates洗牌算法实现
    for (let currentIndex = databaseSample.length - 1; currentIndex > 0; currentIndex--) {
        /**
         * 生成随机索引
         */
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        // 交换当前位置和随机位置元素
        [databaseSample[currentIndex], databaseSample[randomIndex]] = [databaseSample[randomIndex], databaseSample[currentIndex]];
    }
    ;
    // 如果存在精确匹配结果, 处理其内容和代码逻辑
    if (strictQueryResult) {
        /**
         * 根节点信息
         */
        const rootNode = strictQueryResult.root.join(' * ');
        /**
         * 构建资料名称, 包含根节点信息
         *
         * @type {server.RawMessage }
         */
        const title = { text: '§q§l' + rootNode + '§r\n\n' };
        // 如果存在代码逻辑, 添加到代码函数数组
        if (strictQueryResult.code)
            codeFunctions.push(strictQueryResult.code);
        // 如果存在资料内容, 将资料内容添加到输出内容数组
        if (strictQueryResult.intel)
            outputContent.push(useImmersiveMode ? {} : title, ...strictQueryResult.intel, finale);
    }
    ;
    // 使用标签检索模式扫描数据库样本
    processSample(false);
    // 如果没有找到匹配的样本, 使用模糊匹配模式扫描数据库样本
    if (outputContent.length === 0)
        processSample(true);
    // 如果存在代码函数, 执行并处理返回值
    if (codeFunctions.length >= 1 && codeFunctions[0] !== undefined) {
        /**
         * 执行第一个代码函数, 获取返回值
         *
         * @type {server.RawMessage | server.RawMessage[]}
         */
        const codeOutput = codeFunctions[0]?.(player, semanticSegments.slice(1), semanticSegments, isChat);
        // 如果返回值是数组, 展开并添加到输出内容
        if (Array.isArray(codeOutput))
            outputContent.push(...codeOutput);
        // 否则直接添加到输出内容
        else
            outputContent.push(codeOutput);
    }
    ;
    // 如果输出内容为空, 则转为聊天模式输出
    if (outputContent.length === 0)
        responsePackage.rawtext?.push(generateResponse(mainQueryWord));
    // 否则将所有输出内容添加到响应容器
    else
        responsePackage.rawtext?.push(...outputContent);
    // 会话上下文持久化, 支持对话延续
    contextRegistry.set(player.id, [rawQuery, responsePackage]);
    // 导出查询结果, 返回最终的响应容器
    return responsePackage;
}
;
/**
 * 显示百科窗口界面
 *
 * 该函数为玩家展示一个交互窗口, 允许玩家选择不同的百科功能, 包括百科查询, 知识库目录和技能库目录。
 *
 * @param {server.Player} player - 玩家对象
 *
 * @returns {Promise<void>} - 返回一个Promise, 表示异步操作的完成
 */
async function lexiconWindowedInterface(player) {
    // 延迟执行, 避免触发器冲突
    await server.system.waitTicks(0);
    /**
     * 标题
     */
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    /**
     * 定义了 窗口界面 的 表单对象
     */
    const display = new serverUI.ActionFormData().title(title).body(formatOutputMessage());
    // 设置事件触发限速器
    if (!TriggerControl('触发月华百科', player, 40))
        return;
    // 添加按钮
    display.button('§9<§l§s 百科查询 §r§9>').button('§9<§l§u 知识库目录 §r§9>').button('§9<§l§v 技能库目录 §r§9>').button('§9<§l§m 关闭窗口 §r§9>').show(player).then(response => {
        // 检测玩家是否未做出选择 或 取消操作
        if (response.canceled || response.selection == undefined)
            return;
        // 根据玩家选择的按钮执行不同的操作
        switch (response.selection) {
            case 0:
                windowedRetriever(player);
                break;
            case 1:
                displayDocumentCatalog(player, []);
                break;
            case 2:
                displayScalabilityCatalog(player, []);
                break;
            default: return;
        }
    });
}
;
/**
 * 窗口检索器
 *
 * 为玩家展示一个交互窗口, 允许玩家输入文本信息
 *
 * @param {server.Player} player - 玩家对象
 *
 * @param {server.RawMessage} [content=undefined] - 界面上显示的内容
 *
 * @param {string} [initialInput=undefined] - 文本输入框中预先输入的内容
 */
function windowedRetriever(player, content, initialInput) {
    /**
     * 标题
     */
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    /**
     * 获取 玩家背包
     */
    const container = player.getComponent('minecraft:inventory')?.container;
    /**
     * 获取 选中的物品的标识符
     */
    const typeID = container?.getItem(player.selectedSlotIndex)?.typeId;
    /**
     * 默认文本
     */
    const defaultText = !content ? typeID : (initialInput ? initialInput + ' ' : undefined);
    /**
     * 修饰输出信息, 生成格式化的文本消息
     */
    const displayText = formatOutputMessage(content);
    /**
     * 判断输入的文本长度, 如果小于等于64字节或为空, 则直接显示在聊天栏中, 否则显示表单
     */
    const condition = JSON.stringify(displayText).length <= 64 || (displayText.rawtext && displayText.rawtext?.length <= 2);
    // 根据输入的文本长度判断是否直接显示在聊天栏中
    if (condition && !initialInput)
        player.sendMessage(displayText);
    // 如果文本过长, 则显示表单
    else {
        /**
         * 定义了 窗口界面 的 表单对象
         */
        const display = new serverUI.ModalFormData().title(title);
        // 加入输入框
        display.textField(displayText, ReplyMessages.ask_for_task, { 'defaultValue': defaultText });
        // 显示表单
        display.show(player).then(option => {
            // 如果玩家取消了表单, 则不进行操作
            if (option.canceled || !option.formValues)
                return;
            /**
             * 获取玩家输入的文本
             */
            const rawtext = option.formValues[0];
            // 显示窗口检索表单
            windowedRetriever(player, lexiconInterface(player, rawtext));
        });
    }
}
;
/**
 * 判断特定玩家是否具有权限执行某些操作
 *
 * @param {server.Player} user - 需要查询权限的玩家对象
 *
 * @returns {boolean} - 返回玩家是否有权限的布尔值
 */
function isPlayerAuthorized(user) {
    /**
     * 获取当前维度下处于创造模式的玩家列表
     */
    const creativePlayers = user.dimension.getPlayers({ gameMode: server.GameMode.Creative });
    /**
     * 判断给定玩家是否在创造模式玩家列表中
     */
    const isInCreativeMode = creativePlayers.some(player => player.id === user.id);
    /**
     * 检查玩家是否已阅读并同意"单次授权协定"
     */
    const hasAgreedToAgreement = getMaterialRootTag('单次授权协定').some(item => item === user.nameTag);
    // 返回判断结果
    return isInCreativeMode || hasAgreedToAgreement;
}
;
/**
 * 处理服务器原始消息对象中的名称占位符
 *
 * @typeParam T - 输入数据类型, 自动推断为 server.RawMessage 或 server.RawMessage[]
 *
 * @param {T} input - 服务器原始消息对象或其数组
 *
 * @returns {T} - 保持输入类型的处理结果
 *
 * @example
 * // 返回类型自动推断为 server.RawMessage
 * const result = replacePlaceholders(rawMessage);
 *
 * @example
 * // 返回类型自动推断为 server.RawMessage[]
 * const results = replacePlaceholders([rawMessage1, rawMessage2]);
 */
function replacePlaceholders(input) {
    /**
     * 名称占位符正则表达式
     */
    const placeholderRegex = /(#\$[\^]+\$\#)/g;
    /**
     * 替换占位符为实际名称
     */
    const replacedString = JSON.stringify(input).replace(placeholderRegex, nameTag);
    // 保持原始类型结构并返回
    return JSON.parse(replacedString);
}
;
/**
 * 随机化响应模式数组并追加默认兜底响应
 *
 * @param {Array<[RegExp, string[]]>} patterns - 包含正则表达式和对应响应数组的元组集合
 *
 * @returns {Array<[RegExp, string[]]>} 处理后的随机模式数组（包含追加的兜底响应）
 */
function randomizePatterns(patterns) {
    /**
     * 创建模式数组的浅拷贝
     */
    const randomizedPatterns = [...patterns];
    // Fisher-Yates洗牌算法实现
    for (let currentIndex = randomizedPatterns.length - 1; currentIndex > 0; currentIndex--) {
        /**
         * 生成随机索引
         */
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        // 交换当前位置和随机位置元素
        [randomizedPatterns[currentIndex], randomizedPatterns[randomIndex]] = [randomizedPatterns[randomIndex], randomizedPatterns[currentIndex]];
    }
    ;
    // 添加兜底响应模式
    randomizedPatterns.push([
        /(.*)$/,
        [
            "嗯...{0}...",
            "啊?",
            "{0}?",
            "{0}是什么意思",
            "我不理解{0}的意思",
            "你提到{0}, 是想到了什么吗?",
            "这个{0}...我没太听懂你的意思",
            "{0}... #$^$#不太懂哦..."
        ]
    ]);
    // 返回处理后的随机模式数组
    return randomizedPatterns;
}
;
/**
 * 生成对用户输入的响应消息
 *
 * @param {string} userInput - 用户输入的文本内容
 *
 * @returns {server.RawMessage} 包含生成响应的原始消息对象
 */
function generateResponse(userInput) {
    /**
     * 定义重复问题提示信息
     */
    const repeatedQuestionResponses = [
        "连续问这个问题, 有什么特别的理由吗?",
        "你是想确认某事, 还是纯粹重复练习?",
        "你一直在重复, 是在测试我吗?",
        "你已经问过了, 记得吗?",
        "别重复了, 说点别的吧",
        "这问题我回答过几次了",
        "你是一台复读机吗?",
        "转人工",
    ];
    const timeQueryRegexPatterns = [
        /.*(几点|时间|现在时间).*/,
        /.*(现在是|当前时间).*/,
        /.*(告诉我时间|告诉我现在几点).*/
    ];
    /**
     * 处理时间查询类输入
     *
     * @returns {string|null} 当前时间信息或null
     */
    const handleTimeQuery = () => {
        /**
         * 检查用户输入是否匹配时间查询模式
         */
        if (!timeQueryRegexPatterns.some(pattern => pattern.test(userInput)))
            return null;
        /**
         * 当前游戏刻数
         */
        const gameTicks = server.system.currentTick % 24000;
        /**
         * 总天数
         */
        const totalDays = Math.floor(server.system.currentTick / 24000);
        /**
         * 基础小时数
         */
        const baseHours = Math.floor(gameTicks / 1000);
        /**
         * 游戏小时数（调整后）
         */
        const gameHours = (baseHours + 6) % 24;
        /**
         * 剩余刻数
         */
        const remainingTicks = gameTicks % 1000;
        /**
         * 游戏分钟数
         */
        const gameMinutes = Math.floor((remainingTicks / 1000) * 60);
        /**
         * 总月数
         */
        const totalMonths = Math.floor(totalDays / 30);
        /**
         * 当前月的天数
         */
        const currentMonthDay = totalDays % 30 + 1;
        /**
         * 当前年份
         */
        const currentYear = Math.floor(totalMonths / 12) + 1;
        /**
         * 当前月份
         */
        const currentMonth = totalMonths % 12 + 1;
        /**
         * 格式化时间单位（两位数）
         */
        const formatTimeUnit = (num) => num.toString().padStart(2, '0');
        /**
         * 月份名称数组
         */
        const monthNames = [
            '霜月', '冬月', '寒月', '立春', '花月', '阳春',
            '盛夏', '炎月', '金秋', '收获', '雪月', '岁末'
        ];
        return `游戏时间：${formatTimeUnit(gameHours)}:${formatTimeUnit(gameMinutes)} 当前日期：${currentYear}年 ${monthNames[currentMonth - 1]}${currentMonthDay}日（游戏纪元 ${totalDays}天）`;
    };
    /**
     * 检测连续重复输入
     *
     * @returns {string|null} 重复提示信息或null
     */
    const detectRepeatedInput = () => {
        // 向缓存中添加用户输入
        userInputHistory.push(userInput);
        /**
         * 获取最近三次输入
         */
        const recentInputs = userInputHistory.slice(-3);
        // 检查最近三次输入是否都相同
        if (recentInputs.length >= 3 && recentInputs.every((value, _, array) => value === array[0])) {
            // 返回随机重复提示信息
            return repeatedQuestionResponses[RandomFloor(0, repeatedQuestionResponses.length - 1)];
        }
        return null;
    };
    /**
     * 格式化响应模板
     *
     * @param {string} responseTemplate - 包含占位符的响应模板
     *
     * @param {RegExpMatchArray} regexMatch - 正则表达式匹配结果
     *
     * @returns {string} 格式化后的响应文本
     */
    const formatResponse = (responseTemplate, regexMatch) => {
        /**
         * 处理匹配结果中的占位符
         */
        const processedGroups = regexMatch.slice(1)
            .map(matchedGroup => matchedGroup
            .replace(/你/g, '%TEMP_PRONOUN%')
            .replace(/我/g, '你')
            .replace(/%TEMP_PRONOUN%/g, '我'));
        // 返回格式化后的响应文本
        return responseTemplate.replace(/{(\d+)}/g, (_, placeholderIndex) => processedGroups[Number(placeholderIndex)] || '');
    };
    /**
     * 查找匹配的响应模式
     *
     * @returns {string} 生成的响应文本
     */
    const findMatchingPattern = () => {
        /**
         * 随机化响应模式并追加默认兜底响应
         */
        const shuffledPatterns = randomizePatterns(response_patterns);
        /**
         * 查找匹配的响应模式
         */
        const matchedPattern = shuffledPatterns.find(([regexPattern]) => userInput.toLowerCase().match(regexPattern));
        // 如果找到匹配的响应模式, 生成响应文本
        if (matchedPattern) {
            /**
             * 获取响应模板和匹配结果
             */
            const [_, responseTemplates] = matchedPattern;
            /**
             * 从响应模板数组中随机选择一个响应模板
             */
            const selectedTemplate = responseTemplates[RandomFloor(0, responseTemplates.length - 1)];
            /**
             * 获取匹配结果
             */
            const matchResult = userInput.toLowerCase().match(matchedPattern[0]);
            // 格式化响应模板并返回
            if (matchResult) {
                return formatResponse(selectedTemplate, matchResult);
            }
        }
        return "你在说什么, #$^$#是一点都没听懂";
    };
    /**
     * 响应生成优先级：重复输入 > 时间查询 > 模式匹配
     */
    const finalResponse = detectRepeatedInput() || handleTimeQuery() || findMatchingPattern();
    // 返回生成的响应消息
    return { text: `#$^$# : ${finalResponse}` };
}
;
/**
 * 打印聊天信息
 *
 * 将聊天信息以打字机效果逐行显示给玩家
 *
 * @param {server.Player} player - 接收消息的玩家对象
 *
 * @param {server.RawMessage} input - 要显示的原始消息对象
 */
function displayChatWithTypingEffect(player, input) {
    /**
     * 提取记录中的文本信息
     */
    const rawtext = input.rawtext;
    // 判断是否存在历史记录
    if (!rawtext || rawtext.length == 0)
        return player.sendMessage(ReplyMessages.unknown_query_results);
    // 使用打字机的形式输出历史记录
    displayMessagesWithTypingEffect(player, rawtext);
}
;
/**
 * 逐行打印消息到聊天栏
 *
 * 将输入的多个消息对象逐行延迟发送到玩家的聊天栏, 实现类似打字机的效果
 *
 * @param {server.Player} player - 接收消息的玩家对象
 *
 * @param {server.RawMessage[]} input - 要逐行打印的消息数组
 */
function displayMessagesWithTypingEffect(player, input) {
    // 遍历消息数组, 为每条消息设置延迟, 实现逐行显示
    replacePlaceholders(input).forEach((text, index) => server.system.runTimeout(() => player.sendMessage(text), index * 4));
}
;
/**
 * 聊天回应功能
 *
 * 根据预设关键词开启或关闭<月华百科>的<聊天回应>, 并输出相应的聊天信息
 *
 * @param {server.Player} player - 发起聊天的玩家对象
 *
 * @param {string} message - 玩家发送的聊天信息
 */
function manageChatResponses(player, message) {
    /**
     * 唤醒关键词集合
     */
    const awaken = new Set(['月华', '百科']);
    /**
     * 停止关键词集合
     */
    const desist = new Set(['再见', '感谢', '退出']);
    // 判断是否允许<月华百科>对聊天信息做出回应
    if (awaken.has(message) && !playerOfChat.has(player.id)) {
        // 输出欢迎信息
        displayChatWithTypingEffect(player, lexiconInterface(player, '你好', false, true));
        // 将玩家添加到正在聊天的玩家列表中
        playerOfChat.add(player.id);
    }
    else if (desist.has(message) && playerOfChat.has(player.id)) {
        // 输出告别信息
        displayChatWithTypingEffect(player, lexiconInterface(player, '再见', false, true));
        // 将玩家从正在聊天的玩家列表中移除
        playerOfChat.delete(player.id);
    }
    else if (playerOfChat.has(player.id)) {
        displayChatWithTypingEffect(player, lexiconInterface(player, message, false, true));
    }
}
;
/**
 * 修饰输出信息, 生成格式化的文本消息
 *
 * @param {server.RawMessage} input - 原始文本消息, 待修饰
 *
 * @returns {server.RawMessage} - 修饰后的文本消息
 */
function formatOutputMessage(input) {
    /**
     * 模型规模, 即模型包含的条目数
     */
    const modelSize = material.length + response_patterns.length;
    /**
     * 页面规模, 即所有条目中信息字段的总长度
     */
    const pageScale = material.map(info => info[1]?.intel?.length || 0).reduce((prev, next) => prev + next) + response_patterns.map(info => info[1].length).reduce((prev, next) => prev + next);
    /**
     * 数据总量, 即所有条目中文本内容的总字符数
     */
    const totalData = material.flatMap(info => info[1].intel).map(info => info?.text?.length ?? 0).reduce((prev, next) => prev + next);
    /**
     * 默认文本模板, 包含模型的基本信息和扩展功能
     */
    const defaultTemplate = {
        rawtext: [
            { text: `嗨, 我是${nameTag}, 很高兴为您服务！\n` },
            { text: '--------------------------------\n' },
            { text: "[§5 模型参数 §r]:\n" },
            { text: '--------------------------------\n' },
            { text: '模型版本:§v lexicon v5 §r\n' },
            { text: '模型依赖:§q ServerAPI 2.0.0-beta §r\n' },
            { text: `模型规模:§s ${modelSize} §r\n` },
            { text: `页面规模:§q ${pageScale} §r\n` },
            { text: `数据总量:§u ${totalData} §r\n` },
            { text: '--------------------------------\n' },
        ]
    };
    // 如果提供了输入信息并且不为空, 则返回输入信息；否则, 返回默认模板
    return input && input?.rawtext?.length !== 0 ? replacePlaceholders(input) : defaultTemplate;
}
;
/**
 * 显示知识库目录
 *
 * @param {server.Player} player - 玩家对象
 *
 * @param {string[]} texts - 玩家输入的文本数组
 */
function displayDocumentCatalog(player, texts) {
    /**
     * 标题
     */
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    /**
     * 获取数据库中的所有资料页
     */
    let sample = [...material];
    /**
     * 定义了 窗口界面 的 表单对象
     */
    const display = new serverUI.ActionFormData().title(title);
    // 筛选出符合要求的资料
    if (texts.length >= 1)
        sample = sample.filter(item => texts.every(info => calculateKeywordRelevance(info, item[1].root.join('&'), item[1].root) >= decisionThreshold));
    // 在所有情况下过滤掉 root.length为 0 的条目
    sample = sample.filter(item => item[1].root.length !== 0 && !item[1].code && !item[1].only);
    // 遍历数据库 并 添加 按钮
    if (sample.length !== 0)
        sample.forEach(text => display.button('§u§l' + text[1].root.join('§5 - §u') + '§r'));
    // 如果 没有符合要求的资料 则 告知玩家这个消息
    else
        display.button(ReplyMessages.cannot_select);
    // 显示 窗口界面
    display.show(player).then(option => {
        // 检测玩家是否未做出选择 或 取消操作
        if (sample.length == 0 || option.selection == undefined)
            return;
        /**
         * 玩家选中的资料页
         */
        const select = sample[option.selection][1].intel;
        // 保存历史记录
        contextRegistry.set(player.id, ['知识库目录页', { rawtext: select }]);
        // 显示资料页内容
        windowedRetriever(player, { rawtext: select });
    });
}
;
/**
 * 显示技能库目录
 *
 * @param {server.Player} player - 玩家对象
 *
 * @param {string[]} texts - 玩家输入的文本数组
 */
function displayScalabilityCatalog(player, texts) {
    /**
     * 标题
     */
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    /**
     * 获取数据库中的所有资料页
     */
    let materialsData = [...material];
    /**
     * 定义了 窗口界面 的 表单对象
     */
    const catalogDisplay = new serverUI.ActionFormData().title(title);
    // 筛选出符合要求的资料
    if (texts.length >= 1)
        materialsData = materialsData.filter(item => texts.every(info => calculateKeywordRelevance(info, item[1].root.join('&'), item[1].root) >= decisionThreshold));
    // 在所有情况下过滤掉 不包含函数 的条目
    materialsData = materialsData.filter(item => item[1].code && item[1].synopsis);
    // 遍历数据库 并 添加 按钮
    if (materialsData.length !== 0)
        materialsData.forEach(text => catalogDisplay.button(replacePlaceholders({ rawtext: [{ text: '<]§v§l ' + text[0] + ' §r[>\n' }, text[1].synopsis ?? {}] })));
    // 如果 没有符合要求的资料 则 告知玩家这个消息
    else
        catalogDisplay.button(ReplyMessages.cannot_select);
    // 显示 窗口界面
    catalogDisplay.show(player).then(result => {
        // 检测玩家是否未做出选择 或 取消操作
        if (materialsData.length == 0 || result.selection == undefined)
            return;
        /**
         * 玩家选中的扩展功能的索引
         */
        const selectedIndex = result.selection;
        const content = materialsData[selectedIndex][1].synopsis;
        const initialInput = materialsData[selectedIndex][0];
        windowedRetriever(player, content, initialInput);
    });
}
;
/**
 * 随机选择一个符合权重条件的响应消息
 *
 * @param {Map<string, type.LEXICON_WEIGHT_FACTOR>} responseConfig - 配置包, 包含关键词和对应的权重及响应消息
 *
 * @param {string[]} rawTexts - 原始文本数组, 用于匹配关键词
 *
 * @returns {server.RawMessage[]} - 随机选择一个符合权重条件的响应消息
 */
function selectResponseByWeightedProbability(responseConfig, rawTexts) {
    /**
     * 输入预处理管道：
     * 1. 使用 Unicode NFC 标准化形式统一字符编码
     * 2. 转换为小写以实现大小写不敏感匹配
     * 3. 移除所有标点符号和空格, 避免匹配时受到干扰
     */
    const processedInput = rawTexts.join('').normalize('NFC').toLowerCase().replace(/[\s\p{P}]/gu, '');
    /**
     * 初始化总权重变量, 用于后续随机选择的范围计算
     */
    let totalWeightSum = 0;
    /**
     * 构建权重配置数组, 每个元素包含响应消息和对应的权重
     */
    let weightedEntries = [];
    /**
     * 遍历配置包, 动态计算每个配置项的权重
     */
    for (const [keyword, config] of responseConfig) {
        /**
         * 模糊匹配：检查预处理后的输入是否包含当前关键词（不区分大小写）
         */
        const matchScore = calculateKeywordRelevance(processedInput, '权重响应', keyword.toLowerCase().split(''));
        /**
         * 动态计算权重：如果输入匹配当前关键词, 则权重加倍, 否则使用原始配置权重
         */
        const dynamicWeight = config.weight * (64 * matchScore);
        /**
         * 累积总权重, 用于后续随机选择的比例计算
         */
        totalWeightSum += dynamicWeight;
        /**
         * 将当前配置项的响应消息和计算后的权重添加到权重配置数组中
         */
        weightedEntries.push({ responses: config.responses, weight: dynamicWeight });
        // 如果允许日志输出则输出日志
        if (can_display_logs)
            console.log(`[lexicon] 匹配关键词: ${keyword} 匹配得分: ${matchScore} 动态权重: ${dynamicWeight}`);
    }
    ;
    /**
     * 生成一个随机数, 范围在 0 到总权重之间, 用于随机选择权重配置项
     */
    const randomThreshold = Math.random() * totalWeightSum;
    /**
     * 累积权重变量, 用于逐步比较随机数以确定选中的配置项
     */
    let accumulatedWeight = 0;
    /**
     * 遍历权重配置数组, 找到第一个累积权重超过随机数的配置项并返回其响应消息
     */
    for (const configEntry of weightedEntries) {
        // 累积权重增加当前配置项的权重
        accumulatedWeight += configEntry.weight;
        // 如果当前累积权重超过随机数, 则返回当前配置项的响应消息
        if (accumulatedWeight >= randomThreshold)
            return configEntry.responses;
    }
    ;
    // 如果遍历完所有配置项仍未返回（理论上不会发生）, 则返回未知响应作为安全回退
    return [ReplyMessages.unknown_node];
}
;
/**
 * 计算输入字符串与样本集合的匹配度
 *
 * @param {string} input 输入字符串
 *
 * @param {string} type 类型标识
 *
 * @param {string[]} source 样本字符串数组
 *
 * @returns {number} - 匹配度（0-1之间的数值, 保留三位小数）
 */
function calculateKeywordRelevance(input, type, source) {
    /**
     * 将样本数组连接成字符串并分解成字符数组
     */
    const sampleChars = source.join('').split('');
    /**
     * 创建样本字符的唯一集合
     */
    const sample = new Set(sampleChars);
    // 如果样本集合为空, 直接返回 0
    if (sample.size === 0)
        return 0;
    /**
     * 将输入字符串分解成字符并创建唯一集合
     */
    const inputSet = new Set(input.split(''));
    /**
     * 计算输入字符串中与样本匹配的字符数组
     */
    const matchedChars = [...inputSet].filter(char => sample.has(char));
    /**
     * 匹配字符的数量
     */
    const score = matchedChars.length;
    /**
     * 计算匹配度（匹配字符数除以样本总字符数）
     */
    const relevance = Number((score / sample.size).toFixed(3));
    // 如果允许日志输出且匹配度不为 0, 则输出日志
    if (can_display_logs && relevance !== 0)
        console.log(`§p${type}` + `§r | §5匹配度:§2 ${relevance}` + `§r | §5相同字:§2 ${score}` + `§r | §5总规模:§2 ${sample.size}`);
    // 返回匹配度
    return relevance;
}
;
/**
 * 获取指定类型的资料页的根标签
 *
 * @param {string} type - 资料页的类型标识符
 *
 * @returns {string[]} - 匹配的资料页的根标签数组, 如果未找到则返回空数组
 */
function getMaterialRootTag(type) {
    /**
     * 规范化 资料表
     */
    const norm = new Map(material);
    /**
     * 获取匹配的数据页
     */
    const page = norm.get(type);
    // 如果 未能获取到 数据页 则返回
    if (!page)
        return [];
    // 返回根标签
    return page.root;
}
;
/**
 * 设置指定类型的资料页的根标签
 *
 * @param type - 数据页的类型标识符
 *
 * @param root - 根标签
 */
function setMaterialRootTag(type, root) {
    /**
     * 规范化 资料表
     */
    const norm = new Map(material);
    /**
     * 获取匹配的数据页
     */
    const page = norm.get(type);
    // 如果 未能获取到 数据页 则返回
    if (!page)
        return;
    // 设置根标签
    page.root = [...new Set([...page.root, ...root])];
}
// TODO : [ 功能组件 ]
scalability.set('知识库目录页', {
    synopsis: { text: '§a◆§r 显示#$^$#中的§d资料目录§r, 允许进行§u过滤§r' },
    ...ReplyMessages.craft_template,
    /**
     * 显示知识库目录
     *
     * 该方法根据玩家输入的文本数组, 筛选并显示符合条件的知识库目录
     * 如果没有符合条件的知识库目录, 则显示无法选择的消息
     *
     * @param {server.Player} player - 请求显示知识库目录的玩家对象
     *
     * @param {string[]} texts - 玩家输入的文本数组, 用于筛选知识库目录
     *
     * @returns {server.RawMessage} - 操作结果的消息, 表示知识库目录已创建
     */
    code(player, texts, rawtexts, isChat) {
        // 执行 显示知识库目录 的操作
        if (isChat)
            server.system.runTimeout(() => displayDocumentCatalog(player, texts), 40);
        else
            displayDocumentCatalog(player, texts);
        // 返回操作结果
        return ReplyMessages.create_data_directory;
    },
    root: [],
});
scalability.set('展开功能菜单', {
    synopsis: { text: '§a◆§r 显示#$^$#中的§v功能目录§r, 允许进行§u过滤§r' },
    ...ReplyMessages.craft_template,
    /**
     * 显示功能目录
     *
     * 该方法根据玩家输入的文本数组, 筛选并显示符合条件的功能目录
     * 如果没有符合条件的功能目录, 则显示无法选择的消息
     *
     * @param {server.Player} player - 请求显示功能目录的玩家对象
     *
     * @param {string[]} texts - 玩家输入的文本数组, 用于筛选功能目录
     *
     * @returns {server.RawMessage} - 操作结果的消息, 表示功能目录已创建
     */
    code(player, texts, rawtexts, isChat) {
        // 执行 显示技能目录 的操作
        if (isChat)
            server.system.runTimeout(() => displayScalabilityCatalog(player, texts), 40);
        else
            displayScalabilityCatalog(player, texts);
        // 返回操作结果
        return ReplyMessages.create_data_directory;
    },
    root: [],
});
scalability.set('单次授权协定', {
    synopsis: { text: '§a◆§r 阅读注意事项, 并颁发临时许可' },
    ...ReplyMessages.craft_template,
    /**
     * 阅读注意事项, 并颁发临时许可
     *
     * 该函数向玩家展示“单次授权协定”的协议书, 并根据玩家的选择和输入来处理根证书的验证或设置。
     * 协议书内容包括授权范围, 有效期, 风险条款, 创造模式条款和根证书协议。
     * 玩家可以选择签署协议, 并输入根证书以验证或设置。
     *
     * @param {server.Player} player - 当前交互的玩家对象
     *
     * @returns {server.RawMessage} - 包含操作确认消息的服务器原始消息对象
     */
    code(player) {
        /**
         * 协议书
         */
        const agreement = [
            { text: "-=-=-=-=-=§9<§l 单次授权协定 §9>§r-=-=-=-=-=\n" },
            { text: "鉴于甲方（玩家）申请执行可能影响平衡性的操作\n" },
            { text: "基于此需求, 双方现达成如下临时协议: \n" },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n" },
            { text: "\n[ 授予权限范围 ]\n" },
            { text: "乙方被授权执行, 包括但不限于: \n" },
            { text: "◆ 重置游戏结构生成限制\n" },
            { text: "◆ 解析并重构雾海裂隙参数\n" },
            { text: "◆ 解析并应用元素攻击算法\n" },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n" },
            { text: "\n[ 协定期效 ]\n" },
            { text: "本协议自签署之日起生效\n" },
            { text: "持续至当前游戏存档下次重启为止\n" },
            { text: "有效期结束后, 请重新激活本协议\n" },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n" },
            { text: "\n[ 风险条款 ]\n" },
            { text: "启用本协议可能引发以下风险, 包括但不限于: \n" },
            { text: "◇ 游戏世界参数异常波动\n" },
            { text: "◇ 其他玩家体验受损风险\n" },
            { text: "操作方有义务采取必要措施, 尽量减少对游戏环境的影响\n" },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n" },
            { text: "\n[ 创造模式条款 ]\n" },
            { text: "当甲方处于创造模式时, 本协议默认激活, 无需二次授权\n" },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n" },
            { text: "[ 根证书协议 ]\n" },
            { text: "首个与乙方签约的甲方将自动成为根证书持有者\n" },
            { text: "其他玩家如需执行本协议操作, 需通过根证书验证\n" },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n" },
            { text: "甲方（操作申请方）: " + player.nameTag + "\n\n" },
            { text: "乙方（协议执行方）: " + nameTag },
            { text: "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n" },
            { text: "已签约的操作方: " + getMaterialRootTag('单次授权协定') + "\n" },
        ];
        /**
         * 处理证书签名操作的响应, 显示根证书输入表单并处理验证逻辑
         *
         * @param {serverUI.ActionFormResponse} result - 来自前序操作表单的响应结果
         * @throws {Error} 当玩家输入不符合要求时通过 UI 提示错误信息
         * @example
         * // 通常在表单响应回调中调用
         * someForm.show(player).then(signingCertificate);
         */
        function signingCertificate(result) {
            // 如果用户取消了操作, 则返回
            if (result.canceled || result.selection == 0)
                return;
            /**
             * 执行证书签名验证逻辑, 处理模态表单的响应结果
             * @param {serverUI.ModalFormResponse} option - 根证书输入表单的响应结果
             * @private
             */
            function executionSigning(option) {
                // 如果玩家取消了表单, 则不进行操作
                if (option.canceled || !option.formValues)
                    return;
                /**
                 * 获取玩家输入的文本
                 */
                const rawtext = option.formValues[0];
                /**
                 * 获取世界根证书
                 */
                const rootCertificate = server.world.getDynamicProperty('game_rules:root_certificate');
                // 如果玩家输入的文本长度小于 6, 则返回错误消息
                if (rawtext.length <= 5)
                    return displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_error]);
                // 如果世界根证书为空, 则设置世界根证书为玩家输入的文本
                if (!rootCertificate) {
                    // 设置世界根证书为玩家输入的文本
                    server.world.setDynamicProperty('game_rules:root_certificate', rawtext);
                    // 设置玩家为根证书持有者
                    setMaterialRootTag('单次授权协定', [player.nameTag]);
                    // 返回操作确认消息
                    displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_set, { text: '可分享的子证书: ' + rawtext.slice(-6) }]);
                }
                // 如果玩家输入的文本与世界根证书相同, 则设置玩家为根证书持有者
                else if (rootCertificate == rawtext || rawtext.slice(-6) == rawtext) {
                    // 设置玩家为根证书持有者
                    setMaterialRootTag('单次授权协定', [player.nameTag]);
                    // 返回操作确认消息
                    displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_set, { text: '可分享的子证书: ' + rawtext.slice(-6) }]);
                }
                // 如果玩家输入的文本与世界根证书不相同, 则返回错误消息
                else
                    displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_error]);
            }
            ;
            /**
             * 定义了 窗口界面 的 表单对象
             */
            const display = new serverUI.ModalFormData().title('请输入根证书');
            // 加入输入框
            display.textField('请输入作为凭证的根证书', '你想要输入自定义根证书吗?', { 'defaultValue': player.id });
            // 显示 窗口界面
            display.show(player).then(executionSigning);
        }
        ;
        /**
         * 定义了 窗口界面 的 表单对象
         */
        const display = new serverUI.ActionFormData().title('§9<§l 单次授权协定 §9>');
        // 加入协议书 内容 和 按钮
        display.body({ rawtext: agreement }).button('§4§l关闭§r').button('§9§l签署§r');
        // 显示 窗口界面
        server.system.runTimeout(() => display.show(player).then(signingCertificate), 10);
        // 返回操作结果
        return ReplyMessages.get_root_certificate;
    }
});
scalability.set('请重置根证书', {
    synopsis: { text: '§c◆§r 与#$^$#重新签订根证书' },
    ...ReplyMessages.craft_template,
    /**
     * 重置根证书功能代码逻辑
     *
     * @param {server.Player} player - 当前交互的玩家对象
     * @param {string[]} texts - 玩家输入的文本数组（可能经过预处理）
     * @param {string[]} rawtexts - 玩家输入的原始文本数组
     * @returns {server.RawMessage} - 返回操作结果的消息对象
     *
     * 功能描述:
     * 1. 获取当前世界的根证书。
     * 2. 验证玩家权限, 若玩家无权限且输入不符合根证书要求, 则返回权限不足消息。
     * 3. 创建一个模态表单窗口, 提示玩家输入新的根证书。
     * 4. 显示窗口并等待玩家输入：
     *    - 如果玩家取消或未输入内容, 则不进行任何操作。
     *    - 如果玩家输入的根证书长度小于6, 则返回错误消息。
     *    - 如果输入有效, 更新世界根证书, 并设置玩家为根证书持有者。
     * 5. 返回根证书设置成功的确认消息。
     */
    code(player, texts, rawtexts) {
        /**
         * 获取世界根证书
         */
        const rootCertificate = server.world.getDynamicProperty('game_rules:root_certificate');
        // 权限验证
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        // 验证玩家输入的根证书是否正确
        if (texts[0] != rootCertificate && rawtexts[1] != rootCertificate)
            return ReplyMessages.root_certificate_error;
        /**
         * 定义了 窗口界面 的 表单对象
         */
        const display = new serverUI.ModalFormData().title('请输入根证书');
        // 加入输入框
        display.textField('请输入作为凭证的根证书', '你想要输入自定义根证书吗?', { 'defaultValue': player.id });
        // 显示 窗口界面
        display.show(player).then(option => {
            // 如果玩家取消了表单, 则不进行操作
            if (option.canceled || !option.formValues)
                return;
            /**
             * 获取玩家输入的文本
             */
            const rawtext = option.formValues[0];
            // 如果玩家输入的文本长度小于 6, 则返回错误消息
            if (rawtext.length <= 5)
                return displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_error]);
            // 设置世界根证书为玩家输入的文本
            server.world.setDynamicProperty('game_rules:root_certificate', rawtext);
            // 设置玩家为根证书持有者
            setMaterialRootTag('单次授权协定', [player.nameTag]);
            // 返回操作确认消息
            displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_set, { text: '可分享的子证书: ' + rawtext.slice(-6) }]);
        });
        // 返回操作结果
        return ReplyMessages.get_root_certificate;
    }
});
scalability.set('获取权柄道具', {
    synopsis: { text: '§a◆§r 获取全套< 神恩权柄 >系列道具' },
    ...ReplyMessages.craft_template,
    code(player) {
        // 权限验证
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        /**
         * 获取全套< 神恩权柄 >系列道具
         */
        const items = [
            new server.ItemStack('starry_map:obtain_block'),
            new server.ItemStack('starry_map:world_of_box'),
            new server.ItemStack('starry_map:inhibit_water'),
            new server.ItemStack('starry_map:creative_tools'),
            new server.ItemStack('starry_map:debugging_stick'),
            new server.ItemStack('starry_map:material_sorting'),
            new server.ItemStack('starry_map:purple_gold_gourd'),
            new server.ItemStack('starry_map:stateful_inspection'),
            new server.ItemStack('starry_map:nihility_space_block'),
        ];
        items.forEach(item => {
            // 设置道具的 Lore
            item.setLore(['§4§l[ 切勿随意交予他人使用 !! ]§r']);
            // 尝试在玩家头部位置生成道具
            TrySpawnItem(player.dimension, item, player.getHeadLocation());
        });
        // 返回操作确认消息
        return ReplyMessages.enact_echo;
    }
});
scalability.set('继续本次操作', {
    synopsis: { text: '§a◆§r 继续对话, 聊天栏显示§u查询结果§r与§9功能反馈§r' },
    ...ReplyMessages.craft_template,
    /**
     * 分析并执行玩家的历史输入, 继续上次的对话, 并在聊天栏显示查询结果与功能反馈
     *
     * @param {server.Player} player - 当前交互的玩家对象
     * @returns {server.RawMessage} - 包含操作结果的服务器原始消息对象
     */
    code(player) {
        /**
         * 获取 玩家历史输入
         */
        const entry = contextRegistry.get(player.id);
        // 判断是否存在历史记录
        if (entry) {
            /**
             * 拆分玩家的输入文本
             */
            const texts = entry[0].split(/\s+/);
            /**
             * 获取玩家输入的剩余文本
             */
            const next = texts.slice(1).join(' ');
            // 延迟执行 后续的文本查询
            server.system.runTimeout(() => {
                /**
                 * 创建新的查询对象
                 */
                const query = lexiconInterface(player, texts.length > 1 ? next : entry[0], false);
                /**
                 * 获取查询结果
                 */
                const rawtext = query.rawtext;
                // 使用打字机的形式,在聊天栏中显示查询结果
                if (rawtext)
                    displayMessagesWithTypingEffect(player, rawtext);
            }, 10);
            // 返回操作结果
            return ReplyMessages.enact_echo;
        }
        // 提示玩家 无历史记录
        else
            return ReplyMessages.unknown_echo;
    },
    root: ["继续", "重复", "再来"]
});
scalability.set('查询生物群系', {
    synopsis: { text: '§a◆§r 根据输入, 查找§3生态群系§r并保存§v锚点§r信息' },
    ...ReplyMessages.craft_template,
    /**
     * 分析并提供玩家指定生态群系的信息
     *
     * 获取玩家当前位置和维度, 根据玩家提供的生态群系名称查询信息
     *
     * 如果生态群系存在, 则在当前维度中查找并提供最接近玩家位置的生态群系坐标
     *
     * 同时为玩家添加传送锚点, 并保存锚点信息
     *
     * @param {server.Player} player - 当前交互的玩家对象
     *
     * @param {string[]} texts - 玩家输入的生态群系名称数组
     *
     * @returns {server.RawMessage} - 包含查询响应的服务器原始消息对象
     */
    code(player, texts) {
        /**
         * 获取生态群系标识符
         */
        const biome = biome_map.get(texts[0]);
        // 如果生态群系不存在, 返回未知生态群系的消息
        if (!biome)
            return ReplyMessages.unknown_biome;
        // 执行查询生态群系的命令
        player.runCommand('opal:record_biome_location @s ' + biome);
        // 返回操作确认消息
        return { text: `${nameTag}正在查询你说的群系 ! \n` };
    }
});
scalability.set('打印至聊天栏', {
    synopsis: { text: '§a◆§r 将#$^$#的页面内容, 逐行打印到§9聊天栏§r' },
    ...ReplyMessages.craft_template,
    /**
     * 打印月华百科的历史记录到聊天栏
     *
     * 获取并显示玩家的历史查询记录, 若无记录则提示
     *
     * @param {server.Player} player - 请求的玩家
     *
     * @returns {server.RawMessage} 提示信息
     */
    code(player) {
        /**
         * 获取玩家的历史记录
         */
        const entry = contextRegistry.get(player.id);
        /**
         * 提取记录中的文本信息
         */
        const rawtext = entry?.[1].rawtext;
        // 打印分界线
        player.sendMessage({ text: '\n=-=-=-=-=-=-=-=-=-=\n' });
        // 判断是否存在历史记录
        if (!rawtext || rawtext.length == 0)
            return { text: '§c无历史输入§r' };
        // 使用打字机的形式输出历史记录
        displayMessagesWithTypingEffect(player, rawtext);
        // 记录历史记录
        server.system.run(() => contextRegistry.set(player.id, ['打印至聊天栏', { rawtext }]));
        // 返回操作确认信息
        return ReplyMessages.print_to_chat_bar;
    },
    root: ["打印"],
});
scalability.set('清除结构缓存', {
    synopsis: { text: '§c◆§r 清空§5世界结构管理器§r中的§3结构缓存§r' },
    ...ReplyMessages.craft_template,
    /**
     * 清空服务器世界结构管理器中的结构缓存
     *
     * 遍历并尝试删除所有结构标识符, 成功则计数, 失败则反馈声音
     *
     * @param {server.Player} player - 执行操作的玩家
     *
     * @returns {server.RawMessage} - 操作结果的确认信息
     */
    code(player) {
        // 权限验证
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        /**
         * 获取结构标识符列表
         */
        const structureNames = server.world.structureManager.getWorldStructureIds();
        /**
         * 结构删除计数值
         */
        let count = 0;
        /**
         * 删除单个结构
         *
         * @param {string} name - 结构名称
         */
        function StructureErase(player, name, count) {
            try {
                // 执行删除操作
                server.world.structureManager.delete(name);
                // 计数增加
                count++;
            }
            // 失败反馈
            catch {
                player.playSound('chime.amethyst_block');
            }
        }
        ;
        // 遍历并删除结构
        structureNames.forEach(neme => StructureErase(player, neme, count));
        // 返回操作结果
        return { text: `好的, <§9 结构缓存 §r>已经被#$^$#清除了, 共删除§2 ${count} §r项\n` };
    }
});
scalability.set('发动元素攻击', {
    synopsis: { text: '§c◆§r 对§9目标实体§r应用§5元素伤害§r, 允许设定§4伤害值§r' },
    ...ReplyMessages.craft_template,
    /**
     * 解析并应用元素攻击
     *
     * 根据玩家输入的伤害值, 对选定的目标实体应用伤害, 包括暴击判定
     *
     * @param {server.Player} player - 执行操作的玩家
     * @param {string[]} texts - 玩家输入的参数数组
     *
     * @returns {server.RawMessage} - 操作成功的提示信息
     */
    code(player, texts) {
        // 权限验证
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        /**
         * 获取伤害值
         */
        const damage = (texts[0].match(/\b\d+(\.\d+)?\b/g)?.map(Number) ?? [1])[0];
        /**
         * 获取玩家当前元素属性
         */
        const selfRune = GetProperty(player).self_rune;
        // 运行命令
        player.runCommand('opal:apply_elemental_damage @s ' + selfRune + ' ' + damage);
        // 提示功能执行成功
        return ReplyMessages.pursue_rune_hurt;
    }
});
scalability.set('设置雾海裂隙', {
    synopsis: { text: '§c◆§r 根据的§9坐标§r和§3维度§r信息, 创建§5雾海裂隙§r' },
    ...ReplyMessages.craft_template,
    /**
     * 解析并创建雾海裂隙
     *
     * 根据玩家输入的坐标和维度信息, 创建雾海裂隙, 并为玩家提供视觉和声音反馈
     *
     * @param {server.Player} player - 发起操作的玩家
     * @param {string[]} texts - 玩家输入的参数数组
     *
     * @returns {server.RawMessage} - 操作成功的提示信息
     */
    code(player, texts) {
        // 检测玩家是否具有权限
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        /**
         * 解析坐标参数
         */
        const location = () => {
            /**
             * 匹配整数和小数, 包括负数
             */
            const matches = texts.join().match(/-?\b\d+(\.\d+)?\b/g);
            /**
             * 原始向量数组
             */
            const proto = matches?.map(Number) ?? [0, 512, 0];
            // 输出向量字符串
            return new Vector(proto[0] ?? 0, proto[1] ?? 512, proto[2] ?? 0).toString({ 'delimiter': ' ' });
        };
        /**
         * 解析维度参数
         */
        const dimension = () => {
            /**
             * 检测 字符串
             */
            const check = texts[3] ?? '主世界';
            // 输出维度
            return server.world.getDimension(dimension_map.get(check) ?? 'minecraft:overworld').id;
        };
        // 运行命令
        player.runCommand('opal:create_misty_sea_fissure @s ' + location() + ' ' + dimension());
        // 返回操作成功的提示
        return ReplyMessages.pursue_fissure;
    }
});
scalability.set('调试动态属性', {
    synopsis: { text: '§c◆§r 允许玩家查看并修改§9目标实体§r的§6动态属性§r' },
    ...ReplyMessages.craft_template,
    /**
     * 分析并展示动态属性
     *
     * 允许玩家查看并修改选定实体的动态属性
     *
     * @param {server.Player} player - 发起操作的玩家
     *
     * @returns {server.RawMessage} - 操作成功的提示信息
     */
    code(player) {
        // 权限验证
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        /**
         * 设置查询参数, 排除特定类型的实体
         */
        const options = { excludeTypes: ["minecraft:item", "minecraft:xp_orb"] };
        /**
         * 计算玩家与实体的距离
         */
        const Distance = (entity) => Math.floor(Vector.distance(player.location, entity.location));
        /**
         * 获取排序后的实体数组
         */
        const queue = EntitysSort(player.dimension, options, (a, b) => Distance(a) - Distance(b), entity => entity.getComponent('minecraft:health'));
        /**
         * 定义窗口界面标题
         */
        const title = {
            text: "§9§l<§u 动态属性 §9>§r§3操作界面"
        };
        /**
         * 创建窗口界面表单对象
         */
        const display = new serverUI.ActionFormData().title(title);
        // 遍历实体数组并加入按钮
        if (queue.length > 1)
            queue.forEach(entity => display.button(DistanceAndName(entity, Distance(entity)), "textures/项目图标/元素增益"));
        else
            display.button('§4§l未知的动态属性');
        // 显示窗口界面
        display.show(player).then(option => {
            // 验证表单关闭状态
            if (option.selection == undefined || queue.length === 0)
                return;
            /**
             * 获取目标实体
             */
            const target = queue[option.selection];
            /**
             * 创建动态属性缓存对象
             */
            const property = new Map();
            /**
             * 获取实体的动态属性类型数组
             */
            const types = target.getDynamicPropertyIds();
            /**
             * 获取实体的动态属性值数组
             */
            const values = types.map(type => target.getDynamicProperty(type));
            // 遍历类型数组并加入键值对
            types.forEach((type, index) => { const args = values[index]; if (args)
                property.set(type, args); });
            /**
             * 序列化动态属性并排序
             */
            const analysis = [...property].sort((a, b) => {
                // 比较两个字符串的首字母, 不区分大小写
                return a[0].toLowerCase().charCodeAt(0) - b[0].toLowerCase().charCodeAt(0);
            });
            /**
             * 表单对象
             */
            const display = new serverUI.ModalFormData().title(title);
            /**
             * 输入框提示
             */
            const text = { text: "请输入新的属性值, 修改需谨慎以避免故障" };
            // 输入动态属性信息
            analysis.forEach(type => display.textField(type[0], text, { 'defaultValue': JSON.stringify(type[1]) }));
            // 显示表单
            display.show(player).then(option => {
                // 验证表单关闭状态
                if (!option.formValues)
                    return;
                // 遍历输入框数组
                option.formValues.forEach((data, index) => { target.setDynamicProperty(analysis[index][0], JSON.parse(data)); });
            });
        });
        // 显示任务执行成功的提示
        return ReplyMessages.pursue_dynamic_property;
    },
});
scalability.set('修复版本差异', {
    synopsis: { text: '§a◆§r 修复版本更新导致的外观与功能上的差异' },
    ...ReplyMessages.craft_template,
    /**
     * 分析并展示动态属性
     *
     * 允许玩家查看并修改选定实体的动态属性
     *
     * @param {server.Player} player - 发起操作的玩家
     *
     * @returns {server.RawMessage} - 操作成功的提示信息
     */
    code(player) {
        /**
         * 方块过滤选项
         */
        const filter = { includeTypes: ['starry_map:basic_pipeline', 'starry_map:pulse_latch'] };
        // 遍历方块并修改状态
        TryProcessBlocksInVolume(player.dimension, player.location, 16, filter, block => TrySetPermutation(block, 'STATE:is_storage', false));
        // 播放音效
        player.playSound('respawn_anchor.charge');
        // 返回操作成功的提示
        return { text: '§a修复成功§r, #$^$#已经完成任务了哦§r' };
    }
});
// TODO: [ 数据注入 ]
material.push(...scalability);
