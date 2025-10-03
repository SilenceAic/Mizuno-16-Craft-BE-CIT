# Mizuno 16 Craft BE CIT

<div align="center">

![Minecraft Version](https://img.shields.io/badge/Minecraft-1.21.80+-green.svg)
![Version](https://img.shields.io/badge/版本-1.2.0-blue.svg)
![License](https://img.shields.io/badge/许可证-MIT-yellow.svg)

一个将 Java 版 Mizuno 16 Craft CIT 移植到基岩版的资源包项目

[功能特性](#功能特性) • [安装说明](#安装说明) • [开发指南](#开发指南) • [贡献](#贡献)

</div>

---

## 📖 项目简介

**Mizuno 16 Craft BE CIT** 是基于 Java 版 Mizuno 16 Craft 1.20.1 CIT 移植到 Minecraft 基岩版的资源包和行为包项目。本项目通过 TypeScript 和脚本 API 实现了自定义物品纹理（CIT）功能，让基岩版玩家也能享受到 Java 版的精美纹理体验。

### ✨ 功能特性

- 🎨 **自定义物品纹理（CIT）**：支持基于物品属性的动态纹理切换
- 🌳 **丰富的方块变体**：包含多种植物、方块的随机纹理变体
- ✨ **光线追踪支持**：兼容 RTX 光线追踪渲染
- 🔧 **模块化设计**：使用 TypeScript 开发，易于维护和扩展

### 📦 包含内容

#### 资源包特性

- 自定义方块模型（177+ 模型文件）
- 自定义实体模型和动画
- 自定义纹理贴图（1377+ PNG 文件）
- 粒子效果系统
- 渲染控制器

#### 行为包特性

- CIT 脚本系统
- 自定义方块行为
- 自定义物品定义
- 自定义实体逻辑
- 战利品表系统
- 配方系统（147+ 配方）

---

## 🎯 适用版本

- **Minecraft 基岩版**: 1.21.80 或更高版本
- **平台支持**: Windows 10/11, Xbox, PlayStation, Android, iOS, Nintendo Switch

---

## 📥 安装说明

### 方法一：直接安装（推荐给玩家）

1. 下载本项目的 Release 版本
2. 解压后双击 `.mcaddon` 文件自动导入
3. 在游戏中创建新世界或编辑现有世界
4. 在**资源包**和**行为包**列表中激活 `Mizuno 16 Craft BE CIT_1.21.110`
5. 开始游戏并享受！

### 方法二：手动安装

1. 克隆或下载本仓库

```bash
git clone https://github.com/你的用户名/Mizuno-16-Craft-BE-CIT.git
```

2. 将文件夹复制到 Minecraft 目录：
   - **资源包**: `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\resource_packs\`
   - **行为包**: `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\behavior_packs\`

3. 在游戏中激活资源包和行为包

---

## 🛠️ 开发指南

### 前置要求

在开始之前，请确保已安装以下工具：

- [Node.js](https://nodejs.org/) (LTS 版本)
- [Visual Studio Code](https://code.visualstudio.com/)
- [TypeScript](https://www.typescriptlang.org/)

### 开发环境设置

1. **克隆仓库**

```bash
git clone https://github.com/你的用户名/Mizuno-16-Craft-BE-CIT.git
cd Mizuno-16-Craft-BE-CIT
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**（可选）

   创建 `.env` 文件并配置：

```
PROJECT_NAME="Mizuno 16 Craft BE CIT_1.21.110"
MINECRAFT_PRODUCT="BedrockUWP"
```

### 可用的 NPM 命令

```bash
# 构建项目
npm run build

# 监视模式（自动编译和部署）
npm run 1

# 生成生产版本
npm run build:production

# 创建 .mcaddon 文件
npm run mcaddon

# 创建生产版 .mcaddon 文件
npm run 2

# 代码检查
npm run lint

# 清理构建文件
npm run clean
```

### 项目结构

```
Mizuno 16 Craft BE CIT/
├── behavior_packs/          # 行为包
│   └── Mizuno 16 Craft BE CIT_1.21.110/
│       ├── blocks/          # 方块定义
│       ├── entities/        # 实体定义
│       ├── functions/       # 函数文件
│       ├── items/           # 物品定义
│       ├── scripts/         # JavaScript 脚本
│       │   ├── cit/        # CIT 系统脚本
│       │   └── system/     # 系统脚本
│       └── manifest.json   # 行为包清单
│
├── resource_packs/          # 资源包
│   └── Mizuno 16 Craft BE CIT_1.21.110/
│       ├── animations/      # 动画
│       ├── entity/          # 实体模型
│       ├── models/          # 方块和实体模型
│       ├── textures/        # 纹理贴图
│       ├── particles/       # 粒子效果
│       └── manifest.json   # 资源包清单
│
├── scripts/                 # TypeScript 源代码
│   └── main.ts             # 主入口文件
│
├── package.json            # NPM 配置
├── tsconfig.json           # TypeScript 配置
└── just.config.ts          # 构建配置
```

### 开发工作流

1. 编辑 TypeScript 代码在 `scripts/` 目录
2. 运行 `npm run 1` 启动监视模式
3. 在 Minecraft 中测试变更（使用 `/reload` 命令重新加载脚本）
4. 准备发布时运行 `npm run 2` 生成 .mcaddon 文件

---

## 🎨 自定义纹理功能

本项目实现了以下自定义纹理功能：

### 方块变体

- **树叶**: 橡树、白桦、云杉、丛林树叶的多种变体
- **树苗**: 各种树苗的生长阶段纹理
- **植物**: 多种花卉和植物的变体纹理
- **藤蔓**: 6 种不同的藤蔓纹理
- **草**: 7 种草的随机纹理
- **原木**: 橡木原木的变体

### 物品纹理

- **工作台**: 8 种不同的工作台纹理
- **箱子**: 5 种箱子变体
- **火把**: 10 种火把变体
- **方块**: 包括金块、南瓜、雪块等的多种变体

### 羊毛和地毯

- 16 种颜色的羊毛变体
- 16 种颜色的地毯变体

---

## 🤝 贡献

欢迎贡献！如果你想为项目做出贡献：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m '添加某个很棒的功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 贡献指南

- 遵循现有的代码风格
- 为新功能添加适当的注释
- 测试你的更改确保不会破坏现有功能
- 更新相关文档

---

## 👥 作者与贡献者

- **@Mizuno** - 原作者（Java 版）
- **@LingAic** - 基岩版移植
- **@TBQ4416** - 前輩
- **@Fallen.** - 資源包貢獻

### 相关链接

- B站主页: [https://space.bilibili.com/487185196](https://space.bilibili.com/487185196?spm_id_from=333.337.0.0)

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🐛 问题反馈

如果你遇到任何问题或有建议，请：

1. 在 [Issues](https://github.com/你的用户名/Mizuno-16-Craft-BE-CIT/issues) 页面创建新问题
2. 提供详细的问题描述和复现步骤
3. 附上你的 Minecraft 版本和设备信息

---

## 📚 相关资源

- [Minecraft 基岩版脚本 API 文档](https://learn.microsoft.com/minecraft/creator/)
- [基岩版开发 Wiki](https://wiki.bedrock.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

---

## ⚠️ 注意事项

- 1.暫時沒想好哦

## 🌟 致谢

感谢所有为本项目做出贡献的开发者和测试人员，以及 Minecraft 基岩版社区的支持！

如果这个项目对你有帮助，欢迎给个 ⭐ Star！

---

<div align="center">

**Made with ❤️ for Minecraft Community**

</div>
