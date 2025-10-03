# Mizuno 16 Craft BE CIT

<div align="center">

![Minecraft Version](https://img.shields.io/badge/Minecraft-1.21.80+-green.svg)
![Version](https://img.shields.io/badge/版本-1.2.0-blue.svg)
![License](https://img.shields.io/badge/許可證-MIT-yellow.svg)

一個將 Java 版 Mizuno 16 Craft CIT 移植到基岩版的資源包項目

[項目簡介](#項目簡介) • [功能特性](#功能特性) • [開發指南](#開發指南) • [貢獻](#貢獻)

</div>

---

<a id="項目簡介"></a>

## 📖 項目簡介

**Mizuno 16 Craft BE CIT** 是基於 Java 版 Mizuno 16 Craft 1.20.1 CIT 移植到 Minecraft 基岩版的資源包和行為包項目。本項目透過 TypeScript 和腳本 API 實現了自訂物品紋理（CIT）功能，讓基岩版玩家也能享受到 Java 版的精美紋理體驗。

<a id="功能特性"></a>

### ✨ 功能特性

- 🎨 **自訂物品紋理（CIT）**：支援基於物品屬性的動態紋理切換
- 🌳 **豐富的方塊變體**：包含多種植物、方塊的隨機紋理變體
- ✨ **光線追蹤支援**：兼容 RTX 光線追蹤渲染
- 🔧 **模組化設計**：使用 TypeScript 開發，易於維護和擴展

### 📦 包含內容

#### 資源包特性

- 自訂方塊模型（177+ 模型檔案）
- 自訂實體模型和動畫
- 自訂紋理貼圖（1377+ PNG 檔案）
- 粒子效果系統
- 渲染控制器

#### 行為包特性

- CIT 腳本系統
- 自訂方塊行為
- 自訂物品定義
- 自訂實體邏輯
- 戰利品表系統
- 配方系統（147+ 配方）

---

## 🎯 適用版本

- **Minecraft 基岩版**: 1.21.80 或更高版本
- **平台支援**: Windows 10/11, Xbox, PlayStation, Android, iOS, Nintendo Switch

---

<a id="開發指南"></a>

## 🛠️ 開發指南

### 前置要求

在開始之前，請確保已安裝以下工具：

- [Node.js](https://nodejs.org/) (LTS 版本)
- [Visual Studio Code](https://code.visualstudio.com/)
- [TypeScript](https://www.typescriptlang.org/)

### 開發環境設置

1. **克隆倉庫**

```bash
git clone https://github.com/你的用戶名/Mizuno-16-Craft-BE-CIT.git
cd Mizuno-16-Craft-BE-CIT
```

2. **安裝依賴**

```bash
npm install
```

3. **配置環境變數**（可選）

   建立 `.env` 檔案並配置：

```
PROJECT_NAME="Mizuno 16 Craft BE CIT_1.21.110"
MINECRAFT_PRODUCT="BedrockUWP"
```

### 可用的 NPM 命令

```bash
# 構建項目
npm run build

# 監視模式（自動編譯和部署）
npm run 1

# 生成生產版本
npm run build:production

# 建立 .mcaddon 檔案
npm run mcaddon

# 建立生產版 .mcaddon 檔案
npm run 2

# 程式碼檢查
npm run lint

# 清理構建檔案
npm run clean
```

### 項目結構

```
Mizuno 16 Craft BE CIT/
├── behavior_packs/          # 行為包
│   └── Mizuno 16 Craft BE CIT_1.21.110/
│       ├── blocks/          # 方塊定義
│       ├── entities/        # 實體定義
│       ├── functions/       # 函數檔案
│       ├── items/           # 物品定義
│       ├── scripts/         # JavaScript 腳本
│       │   ├── cit/        # CIT 系統腳本
│       │   └── system/     # 系統腳本
│       └── manifest.json   # 行為包清單
│
├── resource_packs/          # 資源包
│   └── Mizuno 16 Craft BE CIT_1.21.110/
│       ├── animations/      # 動畫
│       ├── entity/          # 實體模型
│       ├── models/          # 方塊和實體模型
│       ├── textures/        # 紋理貼圖
│       ├── particles/       # 粒子效果
│       └── manifest.json   # 資源包清單
│
├── scripts/                 # TypeScript 原始碼
│   └── main.ts             # 主入口檔案
│
├── package.json            # NPM 配置
├── tsconfig.json           # TypeScript 配置
└── just.config.ts          # 構建配置
```

### 開發工作流

1. 編輯 TypeScript 程式碼在 `scripts/` 目錄
2. 執行 `npm run 1` 啟動監視模式
3. 在 Minecraft 中測試變更（使用 `/reload` 命令重新載入腳本）
4. 準備發布時執行 `npm run 2` 生成 .mcaddon 檔案

---

## 🎨 自訂紋理功能

本項目實現了以下自訂紋理功能：

### 方塊變體

- **樹葉**: 橡樹、白樺、雲杉、叢林樹葉的多種變體
- **樹苗**: 各種樹苗的生長階段紋理
- **植物**: 多種花卉和植物的變體紋理
- **藤蔓**: 6 種不同的藤蔓紋理
- **草**: 7 種草的隨機紋理
- **原木**: 橡木原木的變體

### 物品紋理

- **工作台**: 8 種不同的工作台紋理
- **箱子**: 5 種箱子變體
- **火把**: 10 種火把變體
- **方塊**: 包括金塊、南瓜、雪塊等的多種變體

### 羊毛和地毯

- 16 種顏色的羊毛變體
- 16 種顏色的地毯變體

---

<a id="貢獻"></a>

## 🤝 貢獻

歡迎貢獻！如果你想為項目做出貢獻：

1. Fork 本倉庫
2. 建立你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m '新增某個很棒的功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

### 貢獻指南

- 遵循現有的程式碼風格
- 為新功能新增適當的註解
- 測試你的更改確保不會破壞現有功能
- 更新相關文件

---

## 👥 作者與貢獻者

- **@Mizuno** - 原作者（Java 版）
- **@LingAic** - 基岩版移植
- **@TBQ4416** - 前輩
- **@Fallen.** - 資源包貢獻

### 相關連結

- B站主頁: [https://space.bilibili.com/487185196](https://space.bilibili.com/487185196?spm_id_from=333.337.0.0)

---

## 📄 許可證

本項目採用 MIT 許可證 - 查看 [LICENSE](LICENSE) 檔案了解詳情

---

## 🐛 問題回饋

如果你遇到任何問題或有建議，請：

1. 在 [Issues](https://github.com/你的用戶名/Mizuno-16-Craft-BE-CIT/issues) 頁面建立新問題
2. 提供詳細的問題描述和複現步驟
3. 附上你的 Minecraft 版本和裝置資訊

---

## 📚 相關資源

- [Minecraft 基岩版腳本 API 文件](https://learn.microsoft.com/minecraft/creator/)
- [基岩版開發 Wiki](https://wiki.bedrock.dev/)
- [TypeScript 官方文件](https://www.typescriptlang.org/docs/)

---

## ⚠️ 注意事項

- 1.暫時沒想好哦

## 🌟 致謝

感謝所有為本項目做出貢獻的開發者和測試人員，以及 Minecraft 基岩版社群的支援！

如果這個項目對你有幫助，歡迎給個 ⭐ Star！

---

<div align="center">

**Made with ❤️ for Minecraft Community**

</div>
