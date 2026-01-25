
import * as serverUI from "@minecraft/server-ui";
import * as server from "@minecraft/server";
import { can_display_logs, biome_map, dimension_map, response_patterns } from "../data/table";

import { RandomFloor, Vector } from './maths';

import { GetProperty } from './rune_attack';

import { TriggerControl } from './control';

import { EntitysSort } from './parse_entity';

import { DistanceAndName } from './intel';

import { TrySetPermutation, TrySpawnItem, TryProcessBlocksInVolume } from "./create";

export { ReplyMessages, material, manageChatResponses, windowedRetriever, lexiconWindowedInterface, isPlayerAuthorized, lexiconInterface };

const nameTag = '§d§l月华§r';

let decisionThreshold = 0.25;


class ReplyMessages {
    
    static get root_certificate_set() {
        return { text: '#$^$#已获得根证书, 授权签发完成!\n' };
    }
    
    static get get_root_certificate() {
        return { text: '正在为你签发授权, #$^$#需要您提供一下根证书\n' };
    }
    ;
    
    static get root_certificate_error() {
        return { text: '根证书错误, #$^$#无法给您进行临时授权\n' };
    }
    ;
    
    static get ask_for_task() {
        return { text: '请问需要我做些什么呀?\n' };
    }
    ;
    
    static get unknown_theme() {
        return { text: '#$^$#听不太明白哦……你能再详细说一下吗?\n' };
    }
    ;
    
    static get unknown_paper() {
        return { text: '很抱歉, #$^$#似乎没有找到您想要的资料呢……\n' };
    }
    ;
    
    static get obtain_paper() {
        return { text: '#$^$#找到了哦, 请看以下资料 : \n\n' };
    }
    ;
    
    static get unknown_biome() {
        return { text: '看起来这个群系#$^$#还没有发现过……能否提供更多信息呢?\n' };
    }
    ;
    
    static get unknown_node() {
        return { text: '#$^$#很抱歉, 不太明白您的意思, 能换个说法再解释一下吗?\n' };
    }
    ;
    
    static get unknown_echo() {
        return { text: '这个记忆, #$^$#似乎有些模糊, 能否重新描述一遍?\n' };
    }
    ;
    
    static get enact_echo() {
        return { text: '#$^$#明白了哦! 正在执行中啦~\n' };
    }
    ;
    
    static get log_toggle() {
        return { text: '#$^$#收到你的指令啦! 正在切换日志状态哦~\n' };
    }
    ;
    
    static get power_lack() {
        return { text: '哎呀, 权限不够的话, #$^$#就不能帮你做这个操作啦……\n' };
    }
    ;
    
    static get realm_mineral() {
        return { text: '#$^$#收到你的指令啦! 我将借助<§q§l 律令 §r>的力量, 协助你调试<§s§l 虚岩矿脉 §r>\n' };
    }
    ;
    
    static get realm_energy() {
        return { text: '#$^$#看到你的请求啦! 我将借助<§q§l 律令 §r>的力量, 协助你调试<§u§l 星尘能量 §r>\n' };
    }
    ;
    
    static get pursue_rune_hurt() {
        return { text: '#$^$#听到你的需求了! 我将借助<§q§l 律令 §r>的力量, 协助你释放<§5§l 元素攻击 §r>\n' };
    }
    ;
    
    static get pursue_dynamic_property() {
        return { text: '#$^$#明白你的指令啦! 我将借助<§q§l 律令 §r>的力量, 协助你调试<§5§l 动态属性 §r>\n' };
    }
    ;
    
    static get pursue_fissure() {
        return { text: '#$^$#知道你的愿望啦! 我将借助<§q§l 律令 §r>的力量, 协助你构建<§9§l 雾海裂隙 §r>\n' };
    }
    ;
    
    static get craft_template() {
        return { root: [], only: true, priority: 128 };
    }
    ;
    
    static get reset_structural_constraints() {
        return { text: '#$^$#成功重置了<§9 结构限制 §r>! 有些结构可以重新生成啦~\n' };
    }
    ;
    
    static get print_to_chat_bar() {
        return { text: '明白了! #$^$#会把结果打印到聊天栏里~ 这样你就能看到啦!\n' };
    }
    ;
    
    static get create_data_directory() {
        return { text: '#$^$#明白了, 正在创建你需要的数据目录\n' };
    }
    ;
    
    static get cannot_select() {
        return { text: '§l§m没有了哦, ' + nameTag + '什么都没有了啦……' };
    }
    ;
    
    static get experimental_api_disabled() {
        return { text: '很抱歉呀, 这个接口#$^$#目前还在实验阶段, 目前无法继续使用哦~ 等后续版本更新啦! \n' };
    }
    ;
    
    static get unknown_query_results() {
        
        const template = [
            "#$^$#听不太明白哦……你能再详细说一下吗?\n",
            "很抱歉, #$^$#似乎不记得跟这个有关的信息呢……\n",
            "这个记忆, #$^$#似乎有些模糊, 能否重新描述一遍?\n",
            "#$^$#很抱歉, 不太明白您的意思, 能换个说法再解释一下吗?\n",
        ];
        return { text: template[RandomFloor(0, template.length)] };
    }
    
    constructor() { }
    ;
}
;

const userInputHistory = [];

const scalability = new Map();

const playerOfChat = new Set();

const material = [];

const contextRegistry = new Map();


function lexiconInterface(player, rawQuery, useImmersiveMode = false, isChat = false) {
    
    const semanticSegments = rawQuery.normalize('NFC').toLowerCase().split(/\s+/);
    
    const responsePackage = { rawtext: [] };
    
    if (!rawQuery?.trim() || rawQuery.trim().length == 0)
        return { rawtext: [ReplyMessages.unknown_query_results] };
    
    const mainQueryWord = semanticSegments[0];
    
    const outputContent = [];
    
    const codeFunctions = [];
    
    const normalizedDatabase = new Map(material);
    
    const strictQueryResult = normalizedDatabase.get(mainQueryWord);
    
    const databaseSample = material.map(info => info[1]);
    
    const onlyRoot = new Set();
    
    const finale = { text: '=-=-=-=-=-=-=-=-=-=\n' };
    
    const processSample = (isFuzzy) => {
        for (const target of databaseSample) {
            
            const rootNode = target.root.join(' * ');
            
            const title = { text: '§q§l' + rootNode + '§r\n\n' };
            
            const rootTag = new Set(target.root);
            
            if (isFuzzy) {
                
                const proximity = calculateKeywordRelevance(mainQueryWord, rootNode, target.root);
                
                if (proximity < decisionThreshold)
                    continue;
            }
            else {
                
                if (!rootTag.has(mainQueryWord))
                    continue;
            }
            ;
            
            if (target.code)
                codeFunctions.push(target.code);
            
            if (target.only && !onlyRoot.has(rootNode) && target.intel) {
                
                outputContent.push(useImmersiveMode ? {} : title, ...target.intel, finale);
                
                onlyRoot.add(rootNode);
            }
            
            else if (!target.only && target.intel) {
                
                outputContent.push(useImmersiveMode ? {} : title, ...target.intel, finale);
            }
        }
    };
    
    for (let currentIndex = databaseSample.length - 1; currentIndex > 0; currentIndex--) {
        
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        
        [databaseSample[currentIndex], databaseSample[randomIndex]] = [databaseSample[randomIndex], databaseSample[currentIndex]];
    }
    ;
    
    if (strictQueryResult) {
        
        const rootNode = strictQueryResult.root.join(' * ');
        
        const title = { text: '§q§l' + rootNode + '§r\n\n' };
        
        if (strictQueryResult.code)
            codeFunctions.push(strictQueryResult.code);
        
        if (strictQueryResult.intel)
            outputContent.push(useImmersiveMode ? {} : title, ...strictQueryResult.intel, finale);
    }
    ;
    
    processSample(false);
    
    if (outputContent.length === 0)
        processSample(true);
    
    if (codeFunctions.length >= 1 && codeFunctions[0] !== undefined) {
        
        const codeOutput = codeFunctions[0]?.(player, semanticSegments.slice(1), semanticSegments, isChat);
        
        if (Array.isArray(codeOutput))
            outputContent.push(...codeOutput);
        
        else
            outputContent.push(codeOutput);
    }
    ;
    
    if (outputContent.length === 0)
        responsePackage.rawtext?.push(generateResponse(mainQueryWord));
    
    else
        responsePackage.rawtext?.push(...outputContent);
    
    contextRegistry.set(player.id, [rawQuery, responsePackage]);
    
    return responsePackage;
}
;

async function lexiconWindowedInterface(player) {
    
    await server.system.waitTicks(0);
    
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    
    const display = new serverUI.ActionFormData().title(title).body(formatOutputMessage());
    
    if (!TriggerControl('触发月华百科', player, 40))
        return;
    
    display.button('§9<§l§s 百科查询 §r§9>').button('§9<§l§u 知识库目录 §r§9>').button('§9<§l§v 技能库目录 §r§9>').button('§9<§l§m 关闭窗口 §r§9>').show(player).then(response => {
        
        if (response.canceled || response.selection == undefined)
            return;
        
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

function windowedRetriever(player, content, initialInput) {
    
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    
    const container = player.getComponent('minecraft:inventory')?.container;
    
    const typeID = container?.getItem(player.selectedSlotIndex)?.typeId;
    
    const defaultText = !content ? typeID : (initialInput ? initialInput + ' ' : undefined);
    
    const displayText = formatOutputMessage(content);
    
    const condition = JSON.stringify(displayText).length <= 64 || (displayText.rawtext && displayText.rawtext?.length <= 2);
    
    if (condition && !initialInput)
        player.sendMessage(displayText);
    
    else {
        
        const display = new serverUI.ModalFormData().title(title);
        
        display.textField(displayText, ReplyMessages.ask_for_task, { 'defaultValue': defaultText });
        
        display.show(player).then(option => {
            
            if (option.canceled || !option.formValues)
                return;
            
            const rawtext = option.formValues[0];
            
            windowedRetriever(player, lexiconInterface(player, rawtext));
        });
    }
}
;

function isPlayerAuthorized(user) {
    
    const creativePlayers = user.dimension.getPlayers({ gameMode: server.GameMode.Creative });
    
    const isInCreativeMode = creativePlayers.some(player => player.id === user.id);
    
    const hasAgreedToAgreement = getMaterialRootTag('单次授权协定').some(item => item === user.nameTag);
    
    return isInCreativeMode || hasAgreedToAgreement;
}
;

function replacePlaceholders(input) {
    
    const placeholderRegex = /(#\$[\^]+\$\#)/g;
    
    const replacedString = JSON.stringify(input).replace(placeholderRegex, nameTag);
    
    return JSON.parse(replacedString);
}
;

function randomizePatterns(patterns) {
    
    const randomizedPatterns = [...patterns];
    
    for (let currentIndex = randomizedPatterns.length - 1; currentIndex > 0; currentIndex--) {
        
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        
        [randomizedPatterns[currentIndex], randomizedPatterns[randomIndex]] = [randomizedPatterns[randomIndex], randomizedPatterns[currentIndex]];
    }
    ;
    
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
    
    return randomizedPatterns;
}
;

function generateResponse(userInput) {
    
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
    
    const handleTimeQuery = () => {
        
        if (!timeQueryRegexPatterns.some(pattern => pattern.test(userInput)))
            return null;
        
        const gameTicks = server.system.currentTick % 24000;
        
        const totalDays = Math.floor(server.system.currentTick / 24000);
        
        const baseHours = Math.floor(gameTicks / 1000);
        
        const gameHours = (baseHours + 6) % 24;
        
        const remainingTicks = gameTicks % 1000;
        
        const gameMinutes = Math.floor((remainingTicks / 1000) * 60);
        
        const totalMonths = Math.floor(totalDays / 30);
        
        const currentMonthDay = totalDays % 30 + 1;
        
        const currentYear = Math.floor(totalMonths / 12) + 1;
        
        const currentMonth = totalMonths % 12 + 1;
        
        const formatTimeUnit = (num) => num.toString().padStart(2, '0');
        
        const monthNames = [
            '霜月', '冬月', '寒月', '立春', '花月', '阳春',
            '盛夏', '炎月', '金秋', '收获', '雪月', '岁末'
        ];
        return `游戏时间：${formatTimeUnit(gameHours)}:${formatTimeUnit(gameMinutes)} 当前日期：${currentYear}年 ${monthNames[currentMonth - 1]}${currentMonthDay}日（游戏纪元 ${totalDays}天）`;
    };
    
    const detectRepeatedInput = () => {
        
        userInputHistory.push(userInput);
        
        const recentInputs = userInputHistory.slice(-3);
        
        if (recentInputs.length >= 3 && recentInputs.every((value, _, array) => value === array[0])) {
            
            return repeatedQuestionResponses[RandomFloor(0, repeatedQuestionResponses.length - 1)];
        }
        return null;
    };
    
    const formatResponse = (responseTemplate, regexMatch) => {
        
        const processedGroups = regexMatch.slice(1)
            .map(matchedGroup => matchedGroup
            .replace(/你/g, '%TEMP_PRONOUN%')
            .replace(/我/g, '你')
            .replace(/%TEMP_PRONOUN%/g, '我'));
        
        return responseTemplate.replace(/{(\d+)}/g, (_, placeholderIndex) => processedGroups[Number(placeholderIndex)] || '');
    };
    
    const findMatchingPattern = () => {
        
        const shuffledPatterns = randomizePatterns(response_patterns);
        
        const matchedPattern = shuffledPatterns.find(([regexPattern]) => userInput.toLowerCase().match(regexPattern));
        
        if (matchedPattern) {
            
            const [_, responseTemplates] = matchedPattern;
            
            const selectedTemplate = responseTemplates[RandomFloor(0, responseTemplates.length - 1)];
            
            const matchResult = userInput.toLowerCase().match(matchedPattern[0]);
            
            if (matchResult) {
                return formatResponse(selectedTemplate, matchResult);
            }
        }
        return "你在说什么, #$^$#是一点都没听懂";
    };
    
    const finalResponse = detectRepeatedInput() || handleTimeQuery() || findMatchingPattern();
    
    return { text: `#$^$# : ${finalResponse}` };
}
;

function displayChatWithTypingEffect(player, input) {
    
    const rawtext = input.rawtext;
    
    if (!rawtext || rawtext.length == 0)
        return player.sendMessage(ReplyMessages.unknown_query_results);
    
    displayMessagesWithTypingEffect(player, rawtext);
}
;

function displayMessagesWithTypingEffect(player, input) {
    
    replacePlaceholders(input).forEach((text, index) => server.system.runTimeout(() => player.sendMessage(text), index * 4));
}
;

function manageChatResponses(player, message) {
    
    const awaken = new Set(['月华', '百科']);
    
    const desist = new Set(['再见', '感谢', '退出']);
    
    if (awaken.has(message) && !playerOfChat.has(player.id)) {
        
        displayChatWithTypingEffect(player, lexiconInterface(player, '你好', false, true));
        
        playerOfChat.add(player.id);
    }
    else if (desist.has(message) && playerOfChat.has(player.id)) {
        
        displayChatWithTypingEffect(player, lexiconInterface(player, '再见', false, true));
        
        playerOfChat.delete(player.id);
    }
    else if (playerOfChat.has(player.id)) {
        displayChatWithTypingEffect(player, lexiconInterface(player, message, false, true));
    }
}
;

function formatOutputMessage(input) {
    
    const modelSize = material.length + response_patterns.length;
    
    const pageScale = material.map(info => info[1]?.intel?.length || 0).reduce((prev, next) => prev + next) + response_patterns.map(info => info[1].length).reduce((prev, next) => prev + next);
    
    const totalData = material.flatMap(info => info[1].intel).map(info => info?.text?.length ?? 0).reduce((prev, next) => prev + next);
    
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
    
    return input && input?.rawtext?.length !== 0 ? replacePlaceholders(input) : defaultTemplate;
}
;

function displayDocumentCatalog(player, texts) {
    
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    
    let sample = [...material];
    
    const display = new serverUI.ActionFormData().title(title);
    
    if (texts.length >= 1)
        sample = sample.filter(item => texts.every(info => calculateKeywordRelevance(info, item[1].root.join('&'), item[1].root) >= decisionThreshold));
    
    sample = sample.filter(item => item[1].root.length !== 0 && !item[1].code && !item[1].only);
    
    if (sample.length !== 0)
        sample.forEach(text => display.button('§u§l' + text[1].root.join('§5 - §u') + '§r'));
    
    else
        display.button(ReplyMessages.cannot_select);
    
    display.show(player).then(option => {
        
        if (sample.length == 0 || option.selection == undefined)
            return;
        
        const select = sample[option.selection][1].intel;
        
        contextRegistry.set(player.id, ['知识库目录页', { rawtext: select }]);
        
        windowedRetriever(player, { rawtext: select });
    });
}
;

function displayScalabilityCatalog(player, texts) {
    
    const title = { text: "§9《§u§l §r" + nameTag + "§u§l百科 §9》§r" };
    
    let materialsData = [...material];
    
    const catalogDisplay = new serverUI.ActionFormData().title(title);
    
    if (texts.length >= 1)
        materialsData = materialsData.filter(item => texts.every(info => calculateKeywordRelevance(info, item[1].root.join('&'), item[1].root) >= decisionThreshold));
    
    materialsData = materialsData.filter(item => item[1].code && item[1].synopsis);
    
    if (materialsData.length !== 0)
        materialsData.forEach(text => catalogDisplay.button(replacePlaceholders({ rawtext: [{ text: '<]§v§l ' + text[0] + ' §r[>\n' }, text[1].synopsis ?? {}] })));
    
    else
        catalogDisplay.button(ReplyMessages.cannot_select);
    
    catalogDisplay.show(player).then(result => {
        
        if (materialsData.length == 0 || result.selection == undefined)
            return;
        
        const selectedIndex = result.selection;
        const content = materialsData[selectedIndex][1].synopsis;
        const initialInput = materialsData[selectedIndex][0];
        windowedRetriever(player, content, initialInput);
    });
}
;

function selectResponseByWeightedProbability(responseConfig, rawTexts) {
    
    const processedInput = rawTexts.join('').normalize('NFC').toLowerCase().replace(/[\s\p{P}]/gu, '');
    
    let totalWeightSum = 0;
    
    let weightedEntries = [];
    
    for (const [keyword, config] of responseConfig) {
        
        const matchScore = calculateKeywordRelevance(processedInput, '权重响应', keyword.toLowerCase().split(''));
        
        const dynamicWeight = config.weight * (64 * matchScore);
        
        totalWeightSum += dynamicWeight;
        
        weightedEntries.push({ responses: config.responses, weight: dynamicWeight });
        
        if (can_display_logs)
            console.log(`[lexicon] 匹配关键词: ${keyword} 匹配得分: ${matchScore} 动态权重: ${dynamicWeight}`);
    }
    ;
    
    const randomThreshold = Math.random() * totalWeightSum;
    
    let accumulatedWeight = 0;
    
    for (const configEntry of weightedEntries) {
        
        accumulatedWeight += configEntry.weight;
        
        if (accumulatedWeight >= randomThreshold)
            return configEntry.responses;
    }
    ;
    
    return [ReplyMessages.unknown_node];
}
;

function calculateKeywordRelevance(input, type, source) {
    
    const sampleChars = source.join('').split('');
    
    const sample = new Set(sampleChars);
    
    if (sample.size === 0)
        return 0;
    
    const inputSet = new Set(input.split(''));
    
    const matchedChars = [...inputSet].filter(char => sample.has(char));
    
    const score = matchedChars.length;
    
    const relevance = Number((score / sample.size).toFixed(3));
    
    if (can_display_logs && relevance !== 0)
        console.log(`§p${type}` + `§r | §5匹配度:§2 ${relevance}` + `§r | §5相同字:§2 ${score}` + `§r | §5总规模:§2 ${sample.size}`);
    
    return relevance;
}
;

function getMaterialRootTag(type) {
    
    const norm = new Map(material);
    
    const page = norm.get(type);
    
    if (!page)
        return [];
    
    return page.root;
}
;

function setMaterialRootTag(type, root) {
    
    const norm = new Map(material);
    
    const page = norm.get(type);
    
    if (!page)
        return;
    
    page.root = [...new Set([...page.root, ...root])];
}

scalability.set('知识库目录页', {
    synopsis: { text: '§a◆§r 显示#$^$#中的§d资料目录§r, 允许进行§u过滤§r' },
    ...ReplyMessages.craft_template,
    
    code(player, texts, rawtexts, isChat) {
        
        if (isChat)
            server.system.runTimeout(() => displayDocumentCatalog(player, texts), 40);
        else
            displayDocumentCatalog(player, texts);
        
        return ReplyMessages.create_data_directory;
    },
    root: [],
});
scalability.set('展开功能菜单', {
    synopsis: { text: '§a◆§r 显示#$^$#中的§v功能目录§r, 允许进行§u过滤§r' },
    ...ReplyMessages.craft_template,
    
    code(player, texts, rawtexts, isChat) {
        
        if (isChat)
            server.system.runTimeout(() => displayScalabilityCatalog(player, texts), 40);
        else
            displayScalabilityCatalog(player, texts);
        
        return ReplyMessages.create_data_directory;
    },
    root: [],
});
scalability.set('单次授权协定', {
    synopsis: { text: '§a◆§r 阅读注意事项, 并颁发临时许可' },
    ...ReplyMessages.craft_template,
    
    code(player) {
        
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
        
        function signingCertificate(result) {
            
            if (result.canceled || result.selection == 0)
                return;
            
            function executionSigning(option) {
                
                if (option.canceled || !option.formValues)
                    return;
                
                const rawtext = option.formValues[0];
                
                const rootCertificate = server.world.getDynamicProperty('game_rules:root_certificate');
                
                if (rawtext.length <= 5)
                    return displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_error]);
                
                if (!rootCertificate) {
                    
                    server.world.setDynamicProperty('game_rules:root_certificate', rawtext);
                    
                    setMaterialRootTag('单次授权协定', [player.nameTag]);
                    
                    displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_set, { text: '可分享的子证书: ' + rawtext.slice(-6) }]);
                }
                
                else if (rootCertificate == rawtext || rawtext.slice(-6) == rawtext) {
                    
                    setMaterialRootTag('单次授权协定', [player.nameTag]);
                    
                    displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_set, { text: '可分享的子证书: ' + rawtext.slice(-6) }]);
                }
                
                else
                    displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_error]);
            }
            ;
            
            const display = new serverUI.ModalFormData().title('请输入根证书');
            
            display.textField('请输入作为凭证的根证书', '你想要输入自定义根证书吗?', { 'defaultValue': player.id });
            
            display.show(player).then(executionSigning);
        }
        ;
        
        const display = new serverUI.ActionFormData().title('§9<§l 单次授权协定 §9>');
        
        display.body({ rawtext: agreement }).button('§4§l关闭§r').button('§9§l签署§r');
        
        server.system.runTimeout(() => display.show(player).then(signingCertificate), 10);
        
        return ReplyMessages.get_root_certificate;
    }
});
scalability.set('请重置根证书', {
    synopsis: { text: '§c◆§r 与#$^$#重新签订根证书' },
    ...ReplyMessages.craft_template,
    
    code(player, texts, rawtexts) {
        
        const rootCertificate = server.world.getDynamicProperty('game_rules:root_certificate');
        
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        
        if (texts[0] != rootCertificate && rawtexts[1] != rootCertificate)
            return ReplyMessages.root_certificate_error;
        
        const display = new serverUI.ModalFormData().title('请输入根证书');
        
        display.textField('请输入作为凭证的根证书', '你想要输入自定义根证书吗?', { 'defaultValue': player.id });
        
        display.show(player).then(option => {
            
            if (option.canceled || !option.formValues)
                return;
            
            const rawtext = option.formValues[0];
            
            if (rawtext.length <= 5)
                return displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_error]);
            
            server.world.setDynamicProperty('game_rules:root_certificate', rawtext);
            
            setMaterialRootTag('单次授权协定', [player.nameTag]);
            
            displayMessagesWithTypingEffect(player, [ReplyMessages.root_certificate_set, { text: '可分享的子证书: ' + rawtext.slice(-6) }]);
        });
        
        return ReplyMessages.get_root_certificate;
    }
});
scalability.set('获取权柄道具', {
    synopsis: { text: '§a◆§r 获取全套< 神恩权柄 >系列道具' },
    ...ReplyMessages.craft_template,
    code(player) {
        
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        
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
            
            item.setLore(['§4§l[ 切勿随意交予他人使用 !! ]§r']);
            
            TrySpawnItem(player.dimension, item, player.getHeadLocation());
        });
        
        return ReplyMessages.enact_echo;
    }
});
scalability.set('继续本次操作', {
    synopsis: { text: '§a◆§r 继续对话, 聊天栏显示§u查询结果§r与§9功能反馈§r' },
    ...ReplyMessages.craft_template,
    
    code(player) {
        
        const entry = contextRegistry.get(player.id);
        
        if (entry) {
            
            const texts = entry[0].split(/\s+/);
            
            const next = texts.slice(1).join(' ');
            
            server.system.runTimeout(() => {
                
                const query = lexiconInterface(player, texts.length > 1 ? next : entry[0], false);
                
                const rawtext = query.rawtext;
                
                if (rawtext)
                    displayMessagesWithTypingEffect(player, rawtext);
            }, 10);
            
            return ReplyMessages.enact_echo;
        }
        
        else
            return ReplyMessages.unknown_echo;
    },
    root: ["继续", "重复", "再来"]
});
scalability.set('查询生物群系', {
    synopsis: { text: '§a◆§r 根据输入, 查找§3生态群系§r并保存§v锚点§r信息' },
    ...ReplyMessages.craft_template,
    
    code(player, texts) {
        
        const biome = biome_map.get(texts[0]);
        
        if (!biome)
            return ReplyMessages.unknown_biome;
        
        player.runCommand('opal:record_biome_location @s ' + biome);
        
        return { text: `${nameTag}正在查询你说的群系 ! \n` };
    }
});
scalability.set('打印至聊天栏', {
    synopsis: { text: '§a◆§r 将#$^$#的页面内容, 逐行打印到§9聊天栏§r' },
    ...ReplyMessages.craft_template,
    
    code(player) {
        
        const entry = contextRegistry.get(player.id);
        
        const rawtext = entry?.[1].rawtext;
        
        player.sendMessage({ text: '\n=-=-=-=-=-=-=-=-=-=\n' });
        
        if (!rawtext || rawtext.length == 0)
            return { text: '§c无历史输入§r' };
        
        displayMessagesWithTypingEffect(player, rawtext);
        
        server.system.run(() => contextRegistry.set(player.id, ['打印至聊天栏', { rawtext }]));
        
        return ReplyMessages.print_to_chat_bar;
    },
    root: ["打印"],
});
scalability.set('清除结构缓存', {
    synopsis: { text: '§c◆§r 清空§5世界结构管理器§r中的§3结构缓存§r' },
    ...ReplyMessages.craft_template,
    
    code(player) {
        
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        
        const structureNames = server.world.structureManager.getWorldStructureIds();
        
        let count = 0;
        
        function StructureErase(player, name, count) {
            try {
                
                server.world.structureManager.delete(name);
                
                count++;
            }
            
            catch {
                player.playSound('chime.amethyst_block');
            }
        }
        ;
        
        structureNames.forEach(neme => StructureErase(player, neme, count));
        
        return { text: `好的, <§9 结构缓存 §r>已经被#$^$#清除了, 共删除§2 ${count} §r项\n` };
    }
});
scalability.set('发动元素攻击', {
    synopsis: { text: '§c◆§r 对§9目标实体§r应用§5元素伤害§r, 允许设定§4伤害值§r' },
    ...ReplyMessages.craft_template,
    
    code(player, texts) {
        
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        
        const damage = (texts[0].match(/\b\d+(\.\d+)?\b/g)?.map(Number) ?? [1])[0];
        
        const selfRune = GetProperty(player).self_rune;
        
        player.runCommand('opal:apply_elemental_damage @s ' + selfRune + ' ' + damage);
        
        return ReplyMessages.pursue_rune_hurt;
    }
});
scalability.set('设置雾海裂隙', {
    synopsis: { text: '§c◆§r 根据的§9坐标§r和§3维度§r信息, 创建§5雾海裂隙§r' },
    ...ReplyMessages.craft_template,
    
    code(player, texts) {
        
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        
        const location = () => {
            
            const matches = texts.join().match(/-?\b\d+(\.\d+)?\b/g);
            
            const proto = matches?.map(Number) ?? [0, 512, 0];
            
            return new Vector(proto[0] ?? 0, proto[1] ?? 512, proto[2] ?? 0).toString({ 'delimiter': ' ' });
        };
        
        const dimension = () => {
            
            const check = texts[3] ?? '主世界';
            
            return server.world.getDimension(dimension_map.get(check) ?? 'minecraft:overworld').id;
        };
        
        player.runCommand('opal:create_misty_sea_fissure @s ' + location() + ' ' + dimension());
        
        return ReplyMessages.pursue_fissure;
    }
});
scalability.set('调试动态属性', {
    synopsis: { text: '§c◆§r 允许玩家查看并修改§9目标实体§r的§6动态属性§r' },
    ...ReplyMessages.craft_template,
    
    code(player) {
        
        if (!isPlayerAuthorized(player))
            return ReplyMessages.power_lack;
        
        const options = { excludeTypes: ["minecraft:item", "minecraft:xp_orb"] };
        
        const Distance = (entity) => Math.floor(Vector.distance(player.location, entity.location));
        
        const queue = EntitysSort(player.dimension, options, (a, b) => Distance(a) - Distance(b), entity => entity.getComponent('minecraft:health'));
        
        const title = {
            text: "§9§l<§u 动态属性 §9>§r§3操作界面"
        };
        
        const display = new serverUI.ActionFormData().title(title);
        
        if (queue.length > 1)
            queue.forEach(entity => display.button(DistanceAndName(entity, Distance(entity)), "textures/项目图标/元素增益"));
        else
            display.button('§4§l未知的动态属性');
        
        display.show(player).then(option => {
            
            if (option.selection == undefined || queue.length === 0)
                return;
            
            const target = queue[option.selection];
            
            const property = new Map();
            
            const types = target.getDynamicPropertyIds();
            
            const values = types.map(type => target.getDynamicProperty(type));
            
            types.forEach((type, index) => { const args = values[index]; if (args)
                property.set(type, args); });
            
            const analysis = [...property].sort((a, b) => {
                
                return a[0].toLowerCase().charCodeAt(0) - b[0].toLowerCase().charCodeAt(0);
            });
            
            const display = new serverUI.ModalFormData().title(title);
            
            const text = { text: "请输入新的属性值, 修改需谨慎以避免故障" };
            
            analysis.forEach(type => display.textField(type[0], text, { 'defaultValue': JSON.stringify(type[1]) }));
            
            display.show(player).then(option => {
                
                if (!option.formValues)
                    return;
                
                option.formValues.forEach((data, index) => { target.setDynamicProperty(analysis[index][0], JSON.parse(data)); });
            });
        });
        
        return ReplyMessages.pursue_dynamic_property;
    },
});
scalability.set('修复版本差异', {
    synopsis: { text: '§a◆§r 修复版本更新导致的外观与功能上的差异' },
    ...ReplyMessages.craft_template,
    
    code(player) {
        
        const filter = { includeTypes: ['starry_map:basic_pipeline', 'starry_map:pulse_latch'] };
        
        TryProcessBlocksInVolume(player.dimension, player.location, 16, filter, block => TrySetPermutation(block, 'STATE:is_storage', false));
        
        player.playSound('respawn_anchor.charge');
        
        return { text: '§a修复成功§r, #$^$#已经完成任务了哦§r' };
    }
});

material.push(...scalability);
