const fs = require("fs");
const path = require("path");

// 路径配置
const BEHAVIOR_PACK_DIR = path.join(
  __dirname,
  "..",
  "behavior_packs",
  "Mizuno 16 Craft BE CIT"
);
const BLOCKS_DIR = path.join(BEHAVIOR_PACK_DIR, "blocks");
const RECIPES_DIR = path.join(BEHAVIOR_PACK_DIR, "recipes");

// 配方模板
function createRecipeTemplate(name) {
  return {
    format_version: "1.12",
    "minecraft:recipe_shaped": {
      description: {
        identifier: `cit:${name}`,
      },
      tags: ["crafting_table"],
      pattern: ["A"],
      key: {
        A: {
          item: "minecraft:air",
        },
      },
      result: {
        item: `cit:${name}`,
        count: 1,
      },
    },
  };
}

// 递归获取目录下所有 JSON 文件
function getAllJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllJsonFiles(filePath, fileList);
    } else if (file.endsWith(".json")) {
      fileList.push({
        name: file.replace(".json", ""),
        path: filePath,
        relativePath: path.relative(BLOCKS_DIR, filePath),
      });
    }
  }

  return fileList;
}

// 检查配方文件是否存在（支持直接在 recipes 目录或子目录中）
function recipeExists(blockName) {
  // 检查直接在 recipes 目录下
  const directPath = path.join(RECIPES_DIR, `${blockName}_r.json`);
  if (fs.existsSync(directPath)) {
    return true;
  }

  // 检查所有子目录
  if (!fs.existsSync(RECIPES_DIR)) {
    return false;
  }

  const items = fs.readdirSync(RECIPES_DIR);
  for (const item of items) {
    const itemPath = path.join(RECIPES_DIR, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const subPath = path.join(itemPath, `${blockName}_r.json`);
      if (fs.existsSync(subPath)) {
        return true;
      }
    }
  }

  return false;
}

// 获取 block 文件所在的子目录名（如果有）
function getBlockSubDir(relativePath) {
  const parts = relativePath.split(path.sep);
  if (parts.length > 1) {
    return parts[0];
  }
  return null;
}

// 主函数
function main() {
  console.log("[generate-recipes] 开始扫描 blocks 目录...");

  // 确保 recipes 目录存在
  if (!fs.existsSync(RECIPES_DIR)) {
    fs.mkdirSync(RECIPES_DIR, { recursive: true });
  }

  // 获取所有 block 文件
  const blockFiles = getAllJsonFiles(BLOCKS_DIR);
  console.log(`[generate-recipes] 找到 ${blockFiles.length} 个 block 文件`);

  let createdCount = 0;

  for (const block of blockFiles) {
    const blockName = block.name;

    // 检查是否已有对应的配方文件
    if (recipeExists(blockName)) {
      continue;
    }

    // 生成配方文件
    const template = createRecipeTemplate(blockName);
    const subDir = getBlockSubDir(block.relativePath);

    let recipePath;
    if (subDir) {
      // 如果 block 在子目录中，配方也放在对应的子目录中
      const recipeSubDir = path.join(RECIPES_DIR, `${subDir}_r`);
      if (!fs.existsSync(recipeSubDir)) {
        fs.mkdirSync(recipeSubDir, { recursive: true });
      }
      recipePath = path.join(recipeSubDir, `${blockName}_r.json`);
    } else {
      // 否则直接放在 recipes 目录下
      recipePath = path.join(RECIPES_DIR, `${blockName}_r.json`);
    }

    // 写入文件（使用制表符缩进以匹配项目风格）
    fs.writeFileSync(recipePath, JSON.stringify(template, null, "\t"));

    console.log(`[generate-recipes] 已创建: ${path.relative(RECIPES_DIR, recipePath)}`);
    createdCount++;
  }

  if (createdCount > 0) {
    console.log(`[generate-recipes] 共创建 ${createdCount} 个配方文件`);
  } else {
    console.log("[generate-recipes] 所有 block 都已有对应的配方文件");
  }
}

main();
